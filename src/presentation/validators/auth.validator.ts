import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  nom: z.string().min(2, 'Le nom est trop court'),
  prenom: z.string().min(2, 'Le prénom est trop court'),
  telephone: z.string().regex(/^\+?[0-9]{9,15}$/, 'Numéro de téléphone invalide'),
  typeUtilisateur: z.enum(['LOCATAIRE', 'PROPRIETAIRE', 'ETUDIANT']),
});

export const loginUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export type RegisterUserDTO = z.infer<typeof registerUserSchema>;
export type LoginUserDTO = z.infer<typeof loginUserSchema>;
