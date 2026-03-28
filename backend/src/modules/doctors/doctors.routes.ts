import { Router } from 'express';
import * as controller from './doctors.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { publicLimiter } from '../../middlewares/rateLimiter';

const router = Router();

router.get('/', publicLimiter, controller.getDoctors);
router.get('/:id', publicLimiter, controller.getDoctor);
router.get('/:id/availability', publicLimiter, controller.getDoctorAvailability);

router.post('/', authenticate, authorize('super_admin', 'hospital_admin'), controller.createDoctor);
router.put('/:id', authenticate, authorize('super_admin', 'hospital_admin', 'doctor'), controller.updateDoctor);
router.post('/:id/availability', authenticate, authorize('super_admin', 'doctor'), controller.setAvailability);

export default router;
