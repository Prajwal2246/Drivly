// Every client-side API call goes through `api()` so users only ever see messages written for them.
// See docs/decisions.md #019.
export const GENERIC_ERROR = 'Something went wrong on our side. Please try again in a moment.';
export const NETWORK_ERROR = "Couldn't reach Drivly. Check your internet connection and try again.";

/** apiError() messages (4xx) are written for users; anything else — 5xx, an HTML error page, no body — is not. */
export function userMessage(status: number, data: unknown): string {
  const message = (data as { error?: { message?: unknown } } | null)?.error?.message;
  return status < 500 && typeof message === 'string' && message ? message : GENERIC_ERROR;
}

/** Throws an Error whose `message` is safe to show and whose `status` is the HTTP status (0 = network failure). */
export async function api<T = any>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw Object.assign(new Error(NETWORK_ERROR), { status: 0 });
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw Object.assign(new Error(userMessage(res.status, data)), { status: res.status });
  return data;
}
