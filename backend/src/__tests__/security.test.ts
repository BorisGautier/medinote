/**
 * Security Tests — TC-SEC-001 to TC-SEC-005
 */
import request from 'supertest';
import User from '../models/User.model';
import { buildApp } from './testApp';
import { generateAccessToken } from '../utils/jwt.utils';

const app = buildApp();

const VALID_USER = {
  firstName: 'Security',
  lastName: 'Test',
  email: 'security@test.cm',
  password: 'Password123!',
};

describe('Security Tests', () => {
  // TC-SEC-001 — Route protégée sans token
  it('TC-SEC-001: should return 401 on protected route without token', async () => {
    const res = await request(app).get('/api/appointments/me');
    expect(res.status).toBe(401);
  });

  // TC-SEC-002 — JWT expiré
  it('TC-SEC-002: should return 401 with expired JWT', async () => {
    // Manually create an expired token
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign(
      { userId: '000000000000000000000001', role: 'patient' },
      process.env.JWT_SECRET as string,
      { expiresIn: '-1s' } // expired 1 second ago
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });

  // TC-SEC-003 — JWT falsifié
  it('TC-SEC-003: should return 401 with tampered JWT', async () => {
    await request(app).post('/api/auth/register').send(VALID_USER);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_USER.email, password: VALID_USER.password });
    const token = loginRes.body.data.accessToken as string;

    // Tamper the payload (middle part)
    const parts = token.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({ userId: 'hacked', role: 'super_admin' })
    ).toString('base64');
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tamperedToken}`);
    expect(res.status).toBe(401);
  });

  // TC-SEC-004 — Headers de sécurité (Helmet)
  it('TC-SEC-004: should include security headers via Helmet', async () => {
    const res = await request(app).get('/api/specialties');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    // Helmet uses 'SAMEORIGIN' by default for x-frame-options
    expect(res.headers['x-frame-options']).toMatch(/sameorigin|deny/i);
  });

  // TC-SEC-005 — Champ password masqué
  it('TC-SEC-005: should never expose password in API responses', async () => {
    await request(app).post('/api/auth/register').send(VALID_USER);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_USER.email, password: VALID_USER.password });
    const token = loginRes.body.data.accessToken;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.password).toBeUndefined();

    // Also check login response
    expect(loginRes.body.data.user.password).toBeUndefined();
  });
});
