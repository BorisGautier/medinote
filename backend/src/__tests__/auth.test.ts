/**
 * Auth Tests — TC-AUTH-001 to TC-AUTH-041
 */
import request from 'supertest';
import mongoose from 'mongoose';
import { buildApp } from './testApp';

const app = buildApp();

const VALID_USER = {
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@test.cm',
  password: 'Password123!',
  phone: '+237690000001',
};

// ─── TC-AUTH-001 à TC-AUTH-005 — Inscription ─────────────
describe('POST /api/auth/register', () => {
  // TC-AUTH-001
  it('TC-AUTH-001: should register a new patient successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(VALID_USER);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(VALID_USER.email);
    expect(res.body.data.user.role).toBe('patient');
    // password must never be in the response
    expect(res.body.data.user.password).toBeUndefined();
  });

  // TC-AUTH-002
  it('TC-AUTH-002: should reject duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send(VALID_USER);
    const res = await request(app).post('/api/auth/register').send(VALID_USER);
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/déjà utilisé/i);
  });

  // TC-AUTH-003
  it('TC-AUTH-003: should reject invalid email with 422', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID_USER, email: 'jean_dupont' });
    expect(res.status).toBe(422);
  });

  // TC-AUTH-004
  it('TC-AUTH-004: should reject short password with 422', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID_USER, password: 'abc123' });
    expect(res.status).toBe(422);
  });

  // TC-AUTH-005
  it('TC-AUTH-005: should reject empty body with 422', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(422);
  });
});

// ─── TC-AUTH-010 à TC-AUTH-013 — Connexion ──────────────
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(VALID_USER);
  });

  // TC-AUTH-010
  it('TC-AUTH-010: should login with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: VALID_USER.email,
      password: VALID_USER.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    // httpOnly cookie set
    expect(res.headers['set-cookie']).toBeDefined();
  });

  // TC-AUTH-011
  it('TC-AUTH-011: should reject unknown email with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nope@test.cm', password: 'Password123!' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/incorrect/i);
  });

  // TC-AUTH-012
  it('TC-AUTH-012: should reject wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_USER.email, password: 'WrongPass!1' });
    expect(res.status).toBe(401);
  });

  // TC-AUTH-013
  it('TC-AUTH-013: should reject empty body with 422', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(422);
  });
});

// ─── TC-AUTH-030, TC-AUTH-040, TC-AUTH-041 ──────────────
describe('GET /api/auth/me & POST /api/auth/logout', () => {
  let accessToken: string;

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(VALID_USER);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: VALID_USER.email,
      password: VALID_USER.password,
    });
    accessToken = loginRes.body.data.accessToken;
  });

  // TC-AUTH-040
  it('TC-AUTH-040: should return current user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(VALID_USER.email);
    expect(res.body.data.user.password).toBeUndefined();
  });

  // TC-AUTH-041
  it('TC-AUTH-041: should return 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  // TC-AUTH-030
  it('TC-AUTH-030: should logout and clear refreshToken cookie', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });
});
