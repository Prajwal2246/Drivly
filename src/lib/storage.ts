// Supabase Storage over plain fetch — no SDK. See docs/decisions.md #006.
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env';
import { DL_EXT } from '@/lib/validations';

const BUCKET = 'dl';

const headers = { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` };

/** Uploads (overwriting) `<userId>.<ext>` and returns the storage key. */
export async function uploadDl(userId: string, file: File): Promise<string> {
  const key = `${userId}.${DL_EXT[file.type]}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${key}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': file.type, 'x-upsert': 'true' },
    body: file,
  });
  if (!res.ok) throw new Error(`Storage upload failed: ${res.status} ${await res.text()}`);
  return key;
}

/** 5-minute signed URL for a private object. */
export async function dlSignedUrl(key: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/${key}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn: 300 }),
  });
  if (!res.ok) throw new Error(`Storage sign failed: ${res.status} ${await res.text()}`);
  const { signedURL } = await res.json();
  return `${SUPABASE_URL}/storage/v1${signedURL}`;
}
