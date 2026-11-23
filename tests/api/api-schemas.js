import { z } from 'zod';

const uuid = z.string().uuid();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const dateTime = z.string().datetime({ offset: true });

export const UserResponseSchema = z.object({
  userId: uuid,
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['CLAIMANT', 'ADMIN']),
  createdAt: dateTime,
});

export const ClaimStatusSchema = z.enum([
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'CLOSED',
]);

export const ClaimResponseSchema = z.object({
  claimId: uuid,
  userId: uuid,
  incidentDate: isoDate,
  incidentLocation: z.string(),
  description: z.string(),
  claimAmount: z.number(),
  status: ClaimStatusSchema,
  createdAt: dateTime,
  updatedAt: dateTime,
});

export const ClaimSummaryResponseSchema = z.object({
  claimId: uuid,
  incidentDate: isoDate,
  description: z.string().max(100),
  claimAmount: z.number(),
  status: ClaimStatusSchema,
  createdAt: dateTime,
});

export const ProblemDetailSchema = z.object({
  type: z.string().url(),
  title: z.string().min(1),
  status: z.number().int(),
  detail: z.string().min(1),
  instance: z.string().optional(),
});
