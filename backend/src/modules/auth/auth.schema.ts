import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Mot de passe: 8 caractères minimum').max(128),
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
