import { z } from 'zod';

export const waitlistSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string()
    .min(10, { message: 'Mobile number must be at least 10 digits.' })
    .regex(/^[+]?[0-9\s-]{10,15}$/, { message: 'Invalid mobile number format.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  city: z.string().min(2, { message: 'City must be at least 2 characters.' }),
  societyName: z.string().min(2, { message: 'Society name must be at least 2 characters.' }),
  role: z.enum(['OWNER', 'RENTER', 'BOTH'], { message: 'Please select a valid role.' }),
  vehicleType: z.enum(['CAR', 'BIKE', 'OTHER']).nullable().optional(),
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  year: z.coerce.number().nullable().optional(),
  expectedRentalPrice: z.coerce.number().nullable().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'OWNER' || data.role === 'BOTH') {
    if (!data.vehicleType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vehicle type is required for owners.',
        path: ['vehicleType'],
      });
    }
    if (!data.brand || data.brand.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Brand is required for owners.',
        path: ['brand'],
      });
    }
    if (!data.model || data.model.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Model is required for owners.',
        path: ['model'],
      });
    }
    if (!data.year || data.year < 1980 || data.year > new Date().getFullYear() + 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Valid vehicle year (1980 onwards) is required for owners.',
        path: ['year'],
      });
    }
    if (!data.expectedRentalPrice || data.expectedRentalPrice <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Expected rental price must be greater than 0.',
        path: ['expectedRentalPrice'],
      });
    }
  }
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
