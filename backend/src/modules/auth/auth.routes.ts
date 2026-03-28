import { Router } from 'express';
import { register, login, refreshToken, logout, getMe } from './auth.controller';
import { validate } from '../../middlewares/validate';
import { registerSchema, loginSchema } from './auth.schema';
import { authenticate } from '../../middlewares/auth.middleware';
import { authLimiter, registerLimiter } from '../../middlewares/rateLimiter';

const router = Router();

router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
