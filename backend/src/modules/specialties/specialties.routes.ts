import { Router } from 'express';
import Specialty from '../../models/Specialty.model';
import { createSpecialtyService, updateSpecialtyService, deleteSpecialtyService } from './specialties.service';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { publicLimiter } from '../../middlewares/rateLimiter';
import { Request, Response, NextFunction } from 'express';

const router = Router();

router.get('/', publicLimiter, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const specialties = await Specialty.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: { specialties } });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const specialty = await createSpecialtyService(req.body);
    res.status(201).json({ success: true, data: { specialty } });
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, authorize('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const specialty = await updateSpecialtyService(req.params.id as string, req.body);
    res.status(200).json({ success: true, data: { specialty } });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, authorize('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteSpecialtyService(req.params.id as string);
    res.status(200).json({ success: true, message: 'Spécialité supprimée.' });
  } catch (err) { next(err); }
});

export default router;
