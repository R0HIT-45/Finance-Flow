import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const CreateRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().datetime('Invalid date'),
  notes: z.string().optional(),
});

export const UpdateRecordSchema = CreateRecordSchema.partial();

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateRecordInput = z.infer<typeof CreateRecordSchema>;
export type UpdateRecordInput = z.infer<typeof UpdateRecordSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
