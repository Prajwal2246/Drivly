import { NextResponse } from 'next/server';

export type ErrorCode = 
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

const HTTP_STATUS_MAP: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_ERROR: 500
};

// ponytail: uniform structured JSON error response factory
export function apiError(code: ErrorCode, message: string) {
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
