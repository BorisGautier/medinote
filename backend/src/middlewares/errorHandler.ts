import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Une erreur interne est survenue.';
  let errors: unknown[] = [];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    if (statusCode < 500) {
      logger.warn(`[${req.method}] ${req.path} → ${statusCode}: ${message}`);
    } else {
      logger.error(`[${req.method}] ${req.path} → ${statusCode}: ${message}`, { stack: err.stack });
    }
  } else {
    // Erreurs Mongoose
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = 'Erreur de validation.';
      errors = Object.values((err as any).errors).map((e: any) => ({
        field: e.path,
        message: e.message,
      }));
    } else if (err.name === 'CastError') {
      statusCode = 400;
      message = 'Identifiant invalide.';
    } else if ((err as any).code === 11000) {
      statusCode = 409;
      const field = Object.keys((err as any).keyValue || {})[0];
      message = field ? `${field} déjà utilisé.` : 'Donnée en double.';
    } else {
      logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route ${req.originalUrl} introuvable.`, 404));
};
