// Supabase Storage over plain fetch — no SDK. See docs/decisions.md #006, #015.
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env';
import { DL_EXT, PHOTO_EXT } from '@/lib/validations';

const headers = { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` };

async function upload(bucket: string, key: string, file: File): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${key}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': file.type, 'x-upsert': 'true' },
    body: file,
  });
  if (!res.ok) throw new Error(`Storage upload failed: ${res.status} ${await res.text()}`);
  return key;
}

/** Private `dl` bucket: overwrites `<userId>.<ext>`. */
export const uploadDl = (userId: string, file: File) => upload('dl', `${userId}.${DL_EXT[file.type]}`, file);

/**
 * Public `vehicles` bucket. Timestamped key so a replaced photo gets a new URL (CDN caches the old one).
 * ponytail: replaced photos are orphaned in the bucket; delete the old key on replace if storage cost ever matters.
 */
export const uploadVehiclePhoto = (vehicleId: string, file: File) =>
  upload('vehicles', `${vehicleId}-${Date.now()}.${PHOTO_EXT[file.type]}`, file);

export const vehiclePhotoUrl = (key: string | null) => (key ? `${SUPABASE_URL}/storage/v1/object/public/vehicles/${key}` : null);

/** 5-minute signed URL for a private object. */
export async function dlSignedUrl(key: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/dl/${key}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn: 300 }),
  });
  if (!res.ok) throw new Error(`Storage sign failed: ${res.status} ${await res.text()}`);
  const { signedURL } = await res.json();
  return `${SUPABASE_URL}/storage/v1${signedURL}`;
}
