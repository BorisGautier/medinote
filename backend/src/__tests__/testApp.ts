/**
 * Helper shared across all tests — creates a fresh app instance
 * without starting the HTTP server (no port binding).
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import authRoutes from '../modules/auth/auth.routes';
import hospitalsRoutes from '../modules/hospitals/hospitals.routes';
import doctorsRoutes from '../modules/doctors/doctors.routes';
import specialtiesRoutes from '../modules/specialties/specialties.routes';
import appointmentsRoutes from '../modules/appointments/appointments.routes';
import { errorHandler } from '../middlewares/errorHandler';

export function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(helmet());
  app.use(cors({ origin: '*', credentials: true }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/hospitals', hospitalsRoutes);
  app.use('/api/doctors', doctorsRoutes);
  app.use('/api/specialties', specialtiesRoutes);
  app.use('/api/appointments', appointmentsRoutes);

  app.use(errorHandler);
  return app;
}
