/**
 * Hospitals Tests — TC-HOSP-001 to TC-HOSP-020
 */
import request from 'supertest';
import Hospital from '../models/Hospital.model';
import { buildApp } from './testApp';

const app = buildApp();

const seed = async () => {
  await Hospital.insertMany([
    {
      name: 'Hôpital Général de Yaoundé',
      type: 'public',
      address: 'Quartier Ngousso',
      city: 'Yaoundé',
      region: 'Centre',
      phone: '+237222212121',
      email: 'contact@hgy.cm',
      isActive: true,
    },
    {
      name: 'Hôpital Laquintinie',
      type: 'public',
      address: 'Quartier Akwa',
      city: 'Douala',
      region: 'Littoral',
      phone: '+237233421540',
      email: 'info@laquintinie.cm',
      isActive: true,
    },
    {
      name: 'Clinique Idimed',
      type: 'clinic',
      address: 'Bonapriso',
      city: 'Douala',
      region: 'Littoral',
      phone: '+237233430101',
      email: 'contact@idimed.cm',
      isActive: true,
    },
  ]);
};

describe('Hospitals API', () => {
  beforeEach(seed);

  // TC-HOSP-001
  it('TC-HOSP-001: GET /api/hospitals should return all hospitals with pagination', async () => {
    const res = await request(app).get('/api/hospitals');
    expect(res.status).toBe(200);
    expect(res.body.data.hospitals).toHaveLength(3);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.total).toBe(3);
  });

  // TC-HOSP-002
  it('TC-HOSP-002: should filter hospitals by city', async () => {
    const res = await request(app).get('/api/hospitals?city=Douala');
    expect(res.status).toBe(200);
    expect(res.body.data.hospitals.every((h: any) => h.city === 'Douala')).toBe(true);
    expect(res.body.data.hospitals).toHaveLength(2);
  });

  // TC-HOSP-003
  it('TC-HOSP-003: should filter hospitals by type', async () => {
    const res = await request(app).get('/api/hospitals?type=clinic');
    expect(res.status).toBe(200);
    expect(res.body.data.hospitals.every((h: any) => h.type === 'clinic')).toBe(true);
    expect(res.body.data.hospitals).toHaveLength(1);
  });

  // TC-HOSP-004
  it('TC-HOSP-004: should paginate results', async () => {
    const res = await request(app).get('/api/hospitals?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data.hospitals.length).toBeLessThanOrEqual(2);
    expect(res.body.data.pagination.totalPages).toBeGreaterThanOrEqual(2);
  });

  // TC-HOSP-010
  it('TC-HOSP-010: GET /api/hospitals/:id should return hospital details', async () => {
    const hospitals = await Hospital.find();
    const id = hospitals[0]._id.toString();
    const res = await request(app).get(`/api/hospitals/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.hospital._id).toBe(id);
    expect(res.body.data.hospital.name).toBeDefined();
  });

  // TC-HOSP-011
  it('TC-HOSP-011: should return 404 for non-existent hospital ID', async () => {
    const fakeId = '000000000000000000000000';
    const res = await request(app).get(`/api/hospitals/${fakeId}`);
    expect(res.status).toBe(404);
  });

  // TC-HOSP-012
  it('TC-HOSP-012: should return 400/404 for invalid hospital ID format', async () => {
    const res = await request(app).get('/api/hospitals/invalid-id');
    expect([400, 404]).toContain(res.status);
  });
});
