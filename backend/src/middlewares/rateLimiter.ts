import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient } from '../config/redis';
import { Request, Response } from 'express';

const createLimiter = (
  windowMs: number,
  max: number,
  message: string,
  prefix: string
) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: async (...args: string[]) => {
        const redisClient = getRedisClient();
        return redisClient.call(args[0], ...args.slice(1)) as any;
      },
      prefix: `rl:${prefix}:`,
    }),
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000 / 60),
      });
    },
  });
};

// 🌐 Global : toutes les routes
export const globalLimiter = createLimiter(
  15 * 60 * 1000,       // 15 minutes
  200,                   // 200 requêtes
  'Trop de requêtes. Veuillez patienter 15 minutes.',
  'global'
);

// 🔑 Auth : anti brute-force login
export const authLimiter = createLimiter(
  15 * 60 * 1000,       // 15 minutes
  10,                    // 10 tentatives
  'Trop de tentatives de connexion. Compte temporairement bloqué.',
  'auth'
);

// 📅 RDV : anti-spam prise de rendez-vous
export const appointmentLimiter = createLimiter(
  60 * 60 * 1000,       // 1 heure
  5,                     // 5 RDV par heure par IP
  'Trop de prises de rendez-vous. Réessayez dans 1 heure.',
  'appointment'
);

// 🔍 Public : recherche et listing
export const publicLimiter = createLimiter(
  15 * 60 * 1000,       // 15 minutes
  100,                   // 100 requêtes
  'Limite de requêtes publiques atteinte. Veuillez patienter.',
  'public'
);

// 📝 Register : anti-spam inscription
export const registerLimiter = createLimiter(
  60 * 60 * 1000,       // 1 heure
  5,                     // 5 inscriptions par heure par IP
  'Trop de tentatives d\'inscription. Réessayez dans 1 heure.',
  'register'
);
