import { z } from 'zod';

export const papeisUsuario = ['SUPER_ADMIN', 'PROFISSIONAL', 'ALUNO', 'PACIENTE'] as const;

export type PapelUsuario = (typeof papeisUsuario)[number];

export const esquemaEmail = z.string().trim().email().max(255).toLowerCase();

export const esquemaCadastroProfissional = z.object({
  nome: z.string().trim().min(2).max(120),
  email: esquemaEmail,
  senha: z.string().min(8).max(120),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export type CadastroProfissional = z.infer<typeof esquemaCadastroProfissional>;
