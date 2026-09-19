import { NextResponse } from 'next/server';

export type ErrorCode = 
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_ERROR';

const HTTP_STATUS_MAP: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500
};

// ponytail: uniform structured JSON error response factory
// `message` is shown to users as-is (see src/lib/api-client.ts) — write it for them, not for developers.
// 500s never carry detail: the real error goes to Logger.error at the call site. See docs/decisions.md #019.
export function apiError(code: ErrorCode, message: string) {
  if (code === 'INTERNAL_ERROR') message = 'Something went wrong on our side. Please try again in a moment.';
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message
      }
    },
    { status: HTTP_STATUS_MAP[code] }
  );
}
