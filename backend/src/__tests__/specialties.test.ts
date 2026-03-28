/**
 * Specialties Tests — TC-SPEC-001
 */
import request from 'supertest';
import Specialty from '../models/Specialty.model';
import { buildApp } from './testApp';

const app = buildApp();

const SPECIALTIES = [
  { name: 'Cardiologie', slug: 'cardiologie', icon: '🫀', description: 'Maladies du cœur' },
  { name: 'Neurologie', slug: 'neurologie', icon: '🧠', description: 'Système nerveux' },
  { name: 'Pédiatrie', slug: 'pediatrie', icon: '👶', description: 'Enfants' },
  { name: 'Dentisterie', slug: 'dentisterie', icon: '🦷', description: 'Soins dentaires' },
  { name: 'Ophtalmologie', slug: 'ophtalmologie', icon: '👁️', description: 'Yeux' },
  { name: 'Orthopédie', slug: 'orthopedie', icon: '🦴', description: 'Locomoteur' },
  { name: 'Médecine Générale', slug: 'medecine-generale', icon: '🩺', description: 'Généraliste' },
  { name: 'Dermatologie', slug: 'dermatologie', icon: '🧬', description: 'Peau' },
];

describe('Specialties API', () => {
  beforeEach(async () => {
    await Specialty.insertMany(SPECIALTIES);
  });

  // TC-SPEC-001
  it('TC-SPEC-001: GET /api/specialties should return all 8 specialties', async () => {
    const res = await request(app).get('/api/specialties');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(8);
    const names = res.body.data.map((s: any) => s.name);
    expect(names).toContain('Cardiologie');
    expect(names).toContain('Neurologie');
    expect(names).toContain('Médecine Générale');
  });
});
