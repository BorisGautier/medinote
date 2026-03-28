import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.model';
import { AppError } from './errorHandler';
import logger from '../config/logger';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Non authentifié. Token manquant.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

    const user = await User.findById(decoded.userId).select('+isActive');
    if (!user || !user.isActive) {
      throw new AppError('Utilisateur non trouvé ou désactivé.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Token invalide.', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expiré. Veuillez vous reconnecter.', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Non authentifié.', 401));
      return;
    }
    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`);
      next(new AppError('Accès refusé. Permissions insuffisantes.', 403));
      return;
    }
    next();
  };
};
