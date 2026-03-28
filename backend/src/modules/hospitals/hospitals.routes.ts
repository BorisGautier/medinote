import { Router } from 'express';
import * as controller from './hospitals.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { publicLimiter } from '../../middlewares/rateLimiter';

const router = Router();

router.get('/', publicLimiter, controller.getHospitals);
router.get('/:id', publicLimiter, controller.getHospital);
router.get('/:id/doctors', publicLimiter, controller.getHospitalDoctors);

router.post('/', authenticate, authorize('super_admin', 'hospital_admin'), controller.createHospital);
router.put('/:id', authenticate, authorize('super_admin', 'hospital_admin'), controller.updateHospital);
router.delete('/:id', authenticate, authorize('super_admin'), controller.deleteHospital);

export default router;
