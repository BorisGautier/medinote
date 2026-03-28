/**
 * Appointments Tests — TC-APT-001 to TC-APT-024
 * (Email queue is mocked to avoid SMTP calls in tests)
 */
import request from 'supertest';
import Doctor from '../models/Doctor.model';
import Hospital from '../models/Hospital.model';
import Specialty from '../models/Specialty.model';
import User from '../models/User.model';
import Appointment from '../models/Appointment.model';
import { buildApp } from './testApp';

// Mock the email queue so no SMTP is attempted
jest.mock('../queues/email.queue', () => ({
  addEmailToQueue: jest.fn().mockResolvedValue(undefined),
}));

// Mock Redis lock functions so they always succeed without a Redis server
jest.mock('../config/redis', () => ({
  lockSlot: jest.fn().mockResolvedValue(true),
  isSlotLocked: jest.fn().mockResolvedValue(false),
  redisClient: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
}));

const app = buildApp();

// ─── Helpers ──────────────────────────────────────────────
const registerAndLogin = async (email: string, password = 'Password123!') => {
  await request(app).post('/api/auth/register').send({
    firstName: 'Test',
    lastName: 'User',
    email,
    password,
  });
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return { token: res.body.data.accessToken as string, userId: res.body.data.user.id as string };
};

const getFutureDate = (hoursFromNow: number) => {
  const d = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
  // Round to next :00 or :30
  d.setMinutes(d.getMinutes() < 30 ? 30 : 0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d.toISOString();
};

let hospitalId: string;
let doctorId: string;

const seedDoctorAndHospital = async () => {
  const specialty = await Specialty.create({ name: 'Cardiologie', slug: 'cardiologie', icon: '🫀', description: '' });
  const hospital = await Hospital.create({
    name: 'Hôpital Test',
    type: 'public',
    address: 'Test',
    city: 'Yaoundé',
    region: 'Centre',
    phone: '+237222000001',
    email: 'test@hospital.cm',
    isActive: true,
  });
  hospitalId = hospital._id.toString();

  const docUser = await User.create({ email: 'doctor@apt.test', password: 'Password123!', role: 'doctor', isEmailVerified: true });
  const doctor = await Doctor.create({
    userId: docUser._id,
    title: 'Dr.',
    firstName: 'Jean',
    lastName: 'Doc',
    licenseNumber: 'CAM-01',
    consultationFee: 10000,
    specialties: [specialty._id],
    hospitals: [hospital._id],
    isActive: true,
    isVerified: true,
  });
  doctorId = doctor._id.toString();
};

describe('Appointments API', () => {
  beforeEach(seedDoctorAndHospital);

  // TC-APT-001
  it('TC-APT-001: should create a valid appointment', async () => {
    const { token } = await registerAndLogin('patient1@test.cm');
    const scheduledAt = getFutureDate(5); // 5h from now

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ doctorId, hospitalId, scheduledAt, reason: 'Consultation cardiologique' });

    expect(res.status).toBe(201);
    expect(res.body.data.appointment.status).toBe('confirmed');
    expect(res.body.data.appointment.reference).toMatch(/^MN-/);
    expect(res.body.data.appointment.duration).toBe(30);
  });

  // TC-APT-002
  it('TC-APT-002: should reject duplicate slot (conflict)', async () => {
    const { token } = await registerAndLogin('patient2@test.cm');
    const { token: token2 } = await registerAndLogin('patient3@test.cm');
    const scheduledAt = getFutureDate(5);

    // Force slot to appear locked for the second request
    const { isSlotLocked } = require('../config/redis');
    isSlotLocked.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ doctorId, hospitalId, scheduledAt, reason: 'Premier' });

    const res2 = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token2}`)
      .send({ doctorId, hospitalId, scheduledAt, reason: 'Second' });

    expect(res2.status).toBe(409);
  });

  // TC-APT-003
  it('TC-APT-003: should reject past date with 400', async () => {
    const { token } = await registerAndLogin('patient4@test.cm');
    const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ doctorId, hospitalId, scheduledAt: past, reason: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/passé/i);
  });

  // TC-APT-004
  it('TC-APT-004: should reject slot in less than 1h', async () => {
    const { token } = await registerAndLogin('patient5@test.cm');
    const tooSoon = getFutureDate(0.5); // 30 min

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ doctorId, hospitalId, scheduledAt: tooSoon, reason: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/1h/i);
  });

  // TC-APT-005
  it('TC-APT-005: should return 401 without authentication', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({ doctorId, hospitalId, scheduledAt: getFutureDate(5), reason: 'Test' });
    expect(res.status).toBe(401);
  });

  // TC-APT-006
  it('TC-APT-006: should return 422 when required fields are missing', async () => {
    const { token } = await registerAndLogin('patient6@test.cm');
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ doctorId, hospitalId, scheduledAt: getFutureDate(5) }); // missing reason
    expect(res.status).toBe(422);
  });

  // TC-APT-010
  it('TC-APT-010: GET /api/appointments/me should return patient appointments', async () => {
    const { token } = await registerAndLogin('patient7@test.cm');
    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ doctorId, hospitalId, scheduledAt: getFutureDate(5), reason: 'Check' });

    const res = await request(app)
      .get('/api/appointments/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.appointments.length).toBeGreaterThanOrEqual(1);
  });

  // TC-APT-011
  it('TC-APT-011: should filter appointments by status', async () => {
    const { token } = await registerAndLogin('patient8@test.cm');
    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ doctorId, hospitalId, scheduledAt: getFutureDate(5), reason: 'Check' });

    const res = await request(app)
      .get('/api/appointments/me?status=confirmed')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    res.body.data.appointments.forEach((apt: any) => {
      expect(apt.status).toBe('confirmed');
    });
  });

  // TC-APT-012
  it('TC-APT-012: should return empty array for patient with no appointments', async () => {
    const { token } = await registerAndLogin('patient9@test.cm');
    const res = await request(app).get('/api/appointments/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.appointments).toHaveLength(0);
  });

  // TC-APT-020
  it('TC-APT-020: should cancel own appointment (>2h before)', async () => {
    const { token, userId } = await registerAndLogin('patient10@test.cm');
    const createRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ doctorId, hospitalId, scheduledAt: getFutureDate(10), reason: 'Check' });
    const aptId = createRes.body.data.appointment._id;

    const res = await request(app)
      .patch(`/api/appointments/${aptId}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cancelReason: 'Indisponible' });
    expect(res.status).toBe(200);
    expect(res.body.data.appointment.status).toBe('cancelled');
    expect(res.body.data.appointment.cancelledBy).toBe('patient');
  });

  // TC-APT-021
  it('TC-APT-021: should reject cancellation less than 2h before', async () => {
    const { token, userId } = await registerAndLogin('patient11@test.cm');
    // Insert an appointment directly with scheduledAt = 1h from now (bypassing the 1h restriction in create)
    const user = await User.findOne({ email: 'patient11@test.cm' });
    const apt = await Appointment.create({
      patientId: user!._id,
      doctorId,
      hospitalId,
      scheduledAt: new Date(Date.now() + 60 * 60 * 1000), // 1h from now
      duration: 30,
      reason: 'Test',
      status: 'confirmed',
    });

    const res = await request(app)
      .patch(`/api/appointments/${apt._id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cancelReason: 'Trop tard' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/2h/i);
  });

  // TC-APT-022
  it('TC-APT-022: should reject cancellation on already cancelled appointment', async () => {
    const { token } = await registerAndLogin('patient12@test.cm');
    const user = await User.findOne({ email: 'patient12@test.cm' });
    const apt = await Appointment.create({
      patientId: user!._id,
      doctorId,
      hospitalId,
      scheduledAt: getFutureDate(10),
      duration: 30,
      reason: 'Test',
      status: 'cancelled',
    });

    const res = await request(app)
      .patch(`/api/appointments/${apt._id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/déjà annulé/i);
  });

  // TC-APT-023
  it('TC-APT-023: should return 403 when cancelling another patient\'s appointment', async () => {
    const { token: t1 } = await registerAndLogin('patient13a@test.cm');
    const { token: t2 } = await registerAndLogin('patient13b@test.cm');

    const createRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${t1}`)
      .send({ doctorId, hospitalId, scheduledAt: getFutureDate(10), reason: 'Check' });
    const aptId = createRes.body.data.appointment._id;

    const res = await request(app)
      .patch(`/api/appointments/${aptId}/cancel`)
      .set('Authorization', `Bearer ${t2}`)
      .send({ cancelReason: 'Intrusion' });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/autorisé/i);
  });

  // TC-APT-024
  it('TC-APT-024: should reject cancellation of completed appointment', async () => {
    const { token } = await registerAndLogin('patient14@test.cm');
    const user = await User.findOne({ email: 'patient14@test.cm' });
    const apt = await Appointment.create({
      patientId: user!._id,
      doctorId,
      hospitalId,
      scheduledAt: getFutureDate(3),
      duration: 30,
      reason: 'Test',
      status: 'completed',
    });

    const res = await request(app)
      .patch(`/api/appointments/${apt._id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/terminé/i);
  });
});
