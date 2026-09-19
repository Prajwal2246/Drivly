// Fail at boot, not at first request. See docs/decisions.md #003.
function required(name: string, minLength = 1): string {
  const value = process.env[name];
  if (!value || value.length < minLength) {
    throw new Error(`Missing or too-short env var ${name} (min ${minLength} chars). See .env.example`);
  }
  return value;
}

export const SESSION_SECRET = required('ADMIN_SESSION_SECRET', 32);
export const ADMIN_PASSWORD = required('ADMIN_PASSWORD');
export const SUPABASE_URL = required('SUPABASE_URL').replace(/\/$/, '');
export const SUPABASE_SERVICE_ROLE_KEY = required('SUPABASE_SERVICE_ROLE_KEY');
// One URL for app + migrations + seed. Supabase: session pooler locally, transaction pooler on Vercel. See DEPLOYMENT.md, #018.
export const DATABASE_URL = required('DATABASE_URL');
