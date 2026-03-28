import { Router } from 'express';
import * as controller from './appointments.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { appointmentLimiter } from '../../middlewares/rateLimiter';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

router.post('/', appointmentLimiter, controller.createAppointment);
router.get('/me', controller.getMyAppointments);
router.get('/doctor/:doctorId', authorize('doctor', 'super_admin', 'hospital_admin'), controller.getDoctorAppointments);
router.patch('/:id/cancel', controller.cancelAppointment);

export default router;
