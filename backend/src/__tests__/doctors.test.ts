/**
 * Doctors Tests — TC-DOC-001 to TC-DOC-022
 */
import request from 'supertest';
import mongoose from 'mongoose';
import Doctor from '../models/Doctor.model';
import Hospital from '../models/Hospital.model';
import Specialty from '../models/Specialty.model';
import User from '../models/User.model';
import Availability from '../models/Availability.model';
import { buildApp } from './testApp';

const app = buildApp();

let hospitalId: string;
let specialtyId: string;
let doctorId: string;

const seedDoctorData = async () => {
  const hospital = await Hospital.create({
    name: 'Hôpital Test',
    type: 'public',
    address: 'Rue Test',
    city: 'Yaoundé',
    region: 'Centre',
    phone: '+237222000001',
    email: 'test@hospital.cm',
    isActive: true,
  });
  hospitalId = hospital._id.toString();

  const specialty = await Specialty.create({
    name: 'Cardiologie',
    slug: 'cardiologie',
    icon: '🫀',
    description: 'Maladies du cœur',
  });
  specialtyId = specialty._id.toString();

  const user = await User.create({
    email: 'doctor@test.cm',
    password: 'Password123!',
    role: 'doctor',
    isEmailVerified: true,
  });

  const doctor = await Doctor.create({
    userId: user._id,
    title: 'Dr.',
    firstName: 'Paul',
    lastName: 'Martin',
    licenseNumber: 'CAM-1234',
    consultationFee: 15000,
    specialties: [specialty._id],
    hospitals: [hospital._id],
    rating: { average: 4.7, count: 25 },
    isActive: true,
    isVerified: true,
  });
  doctorId = doctor._id.toString();

  // Créer des disponibilités lundi à vendredi
  const avails = [];
  for (let day = 1; day <= 5; day++) {
    avails.push({
      doctorId: doctor._id,
      hospitalId: hospital._id,
      dayOfWeek: day,
      startTime: '08:00',
      endTime: '12:00',
      slotDuration: 30,
    });
  }
  await Availability.insertMany(avails);
};

describe('Doctors API', () => {
  beforeEach(seedDoctorData);

  // TC-DOC-001
  it('TC-DOC-001: GET /api/doctors should return active doctors', async () => {
    const res = await request(app).get('/api/doctors');
    expect(res.status).toBe(200);
    expect(res.body.data.doctors).toHaveLength(1);
    expect(res.body.data.doctors[0].isActive).toBe(true);
    expect(res.body.data.pagination.total).toBe(1);
  });

  // TC-DOC-002
  it('TC-DOC-002: should filter doctors by specialtyId', async () => {
    const res = await request(app).get(`/api/doctors?specialtyId=${specialtyId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.doctors).toHaveLength(1);
  });

  // TC-DOC-003
  it('TC-DOC-003: should filter doctors by hospitalId', async () => {
    const res = await request(app).get(`/api/doctors?hospitalId=${hospitalId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.doctors).toHaveLength(1);
  });

  // TC-DOC-004
  it('TC-DOC-004: should paginate doctors list', async () => {
    const res = await request(app).get('/api/doctors?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.data.doctors.length).toBeLessThanOrEqual(5);
  });

  // TC-DOC-010
  it('TC-DOC-010: GET /api/doctors/:id should return doctor profile', async () => {
    const res = await request(app).get(`/api/doctors/${doctorId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.doctor.firstName).toBe('Paul');
    expect(res.body.data.doctor.lastName).toBe('Martin');
    expect(res.body.data.doctor.specialties).toBeDefined();
    expect(res.body.data.doctor.hospitals).toBeDefined();
    expect(res.body.data.doctor.consultationFee).toBe(15000);
  });

  // TC-DOC-011
  it('TC-DOC-011: should return 404 for non-existent doctor', async () => {
    const res = await request(app).get(`/api/doctors/000000000000000000000000`);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/introuvable/i);
  });

  // TC-DOC-020
  it('TC-DOC-020: GET /api/doctors/:id/availability should return time slots', async () => {
    // Get next Monday
    const today = new Date();
    const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysUntilMonday);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const startDate = monday.toISOString().split('T')[0];
    const endDate = friday.toISOString().split('T')[0];

    const res = await request(app).get(
      `/api/doctors/${doctorId}/availability?startDate=${startDate}&endDate=${endDate}`
    );
    expect(res.status).toBe(200);
    expect(res.body.data.slots).toBeDefined();
    expect(Array.isArray(res.body.data.slots)).toBe(true);
    // All returned slots must be in the future (at least 1h from now)
    const now = Date.now();
    res.body.data.slots.forEach((slot: any) => {
      expect(new Date(slot.datetime).getTime()).toBeGreaterThan(now);
    });
  });

  // TC-DOC-021
  it('TC-DOC-021: should return 400 if startDate/endDate are missing', async () => {
    const res = await request(app).get(`/api/doctors/${doctorId}/availability`);
    expect(res.status).toBe(400);
  });

  // TC-DOC-022
  it('TC-DOC-022: should return empty slots for doctor without availabilities', async () => {
    // Create a doctor with no availability
    const user2 = await User.create({ email: 'doc2@test.cm', password: 'Password123!', role: 'doctor', isEmailVerified: true });
    const doc2 = await Doctor.create({
      userId: user2._id,
      title: 'Dr.',
      firstName: 'Sans',
      lastName: 'Dispo',
      licenseNumber: 'CAM-9999',
      consultationFee: 5000,
      specialties: [],
      hospitals: [],
      isActive: true,
      isVerified: true,
    });
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setDate(nextWeek.getDate() + 5);

    const res = await request(app).get(
      `/api/doctors/${doc2._id}/availability?startDate=${nextWeek.toISOString().split('T')[0]}&endDate=${nextWeekEnd.toISOString().split('T')[0]}`
    );
    expect(res.status).toBe(200);
    expect(res.body.data.slots).toHaveLength(0);
  });
});
