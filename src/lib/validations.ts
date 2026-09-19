import { z } from 'zod';

// zod's defaults ("Invalid input: expected string, received undefined") are for developers. Any check without
// its own message gets a user-facing one instead; explicit messages below still win. See docs/decisions.md #019.
const FIELD_LABELS: Record<string, string> = { colorHex: 'colour', pricePerHour: 'price per hour', expectedRentalPrice: 'expected price' };
z.config({
  customError: (iss) => {
    const key = String(iss.path?.at(-1) ?? '');
    const label = FIELD_LABELS[key] ?? (key.replace(/([A-Z])/g, ' $1').toLowerCase() || 'value');
    const Label = label[0].toUpperCase() + label.slice(1);
    const numeric = iss.origin === 'number';
    if (iss.code === 'too_big') return numeric ? `${Label} must be at most ${iss.maximum}.` : `${Label} must be ${iss.maximum} characters or fewer.`;
    if (iss.code === 'too_small') return numeric ? `${Label} must be at least ${iss.minimum}.` : `${Label} is too short.`;
    return `Please enter a valid ${label}.`;
  },
});

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
  preVerifyDl: z.boolean().optional(),
  dlFileName: z.string().nullable().optional(),
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

export const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(10, { message: 'Mobile number must be at least 10 digits.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  city: z.string().trim().min(2, { message: 'City must be at least 2 characters.' }),
  societyName: z.string().trim().min(2, { message: 'Society name must be at least 2 characters.' }),
  role: z.enum(['OWNER', 'RENTER', 'BOTH'], { message: 'Please select a valid role.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

// PATCH /api/auth/profile
export const profileUpdateSchema = registerSchema.pick({ name: true, email: true, city: true, societyName: true, role: true });

export const loginSchema = z.object({
  phone: z.string().min(10, { message: 'Please enter a valid mobile number.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

// POST /api/vehicles; `.partial()` + `listed` for PATCH. See docs/decisions.md #013.
export const vehicleSchema = z.object({
  type: z.enum(['CAR', 'BIKE', 'OTHER'], { message: 'Vehicle type must be CAR, BIKE or OTHER.' }),
  brand: z.string().trim().min(1, { message: 'Brand is required.' }).max(50),
  model: z.string().trim().min(1, { message: 'Model is required.' }).max(50),
  year: z.coerce.number().int().min(1980, { message: 'Year must be 1980 or later.' }).max(new Date().getFullYear() + 1, { message: 'Year is in the future.' }),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: 'Colour must be a hex code like #3b82f6.' }).default('#000000'),
  pricePerHour: z.coerce.number().positive({ message: 'Price must be greater than 0.' }).max(100_000, { message: 'Price must be at most ₹1,00,000/hr.' }),
});
export const vehicleUpdateSchema = vehicleSchema.partial().extend({ listed: z.boolean().optional() });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;


// Upload limits — mime → storage extension. 4MB: Vercel route-handler body cap is 4.5MB.
export const PHOTO_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
export const DL_EXT: Record<string, string> = { ...PHOTO_EXT, 'application/pdf': 'pdf' };
export function validateUpload(type: string, size: number, allowed: Record<string, string>): string | null {
  if (!allowed[type]) return `Only ${Object.values(allowed).join(', ').toUpperCase()} files are accepted.`;
  if (size <= 0) return 'File is empty.';
  if (size > 4 * 1024 * 1024) return 'File must be 4MB or smaller.';
  return null;
}
