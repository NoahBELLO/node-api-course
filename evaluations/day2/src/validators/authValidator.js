const { z } = require('zod');

const passwordSchema = z.string()
  .min(8, 'Minimum 8 caractères')
  .regex(/[A-Z]/, 'Doit contenir une majuscule')
  .regex(/[a-z]/, 'Doit contenir une minuscule')
  .regex(/[0-9]/, 'Doit contenir un chiffre')
  .regex(/[\W_]/, 'Doit contenir un caractère spécial');

const registerSchema = z.object({
  nom: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  password: passwordSchema,
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

module.exports = { registerSchema, loginSchema };
