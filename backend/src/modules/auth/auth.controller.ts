import { Request, Response, NextFunction } from 'express';
import { registerService, loginService, refreshTokenService, logoutService } from './auth.service';
import { AuthRequest } from '../../middlewares/auth.middleware';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await registerService(req.body);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.status(201).json({
      success: true,
      message: 'Inscription réussie.',
      data: { user: result.user, accessToken: result.accessToken },
    });
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await loginService(req.body);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      data: { user: result.user, accessToken: result.accessToken },
    });
  } catch (err) { next(err); }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ success: false, message: 'Refresh token manquant.' });
      return;
    }
    const result = await refreshTokenService(token);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      data: { accessToken: result.accessToken },
    });
  } catch (err) { next(err); }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user) await logoutService(req.user.id);
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Déconnexion réussie.' });
  } catch (err) { next(err); }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ success: true, data: { user: req.user } });
  } catch (err) { next(err); }
};
