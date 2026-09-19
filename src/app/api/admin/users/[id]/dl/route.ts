import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';
import { apiError } from '@/lib/errors';
import { dlSignedUrl } from '@/lib/storage';

// Redirects the admin to a 5-minute signed URL for the user's DL.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdminSession(req)) return apiError('UNAUTHORIZED', 'Your session has expired. Please log in again.');
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { dlPath: true } });
  if (!user?.dlPath) return apiError('NOT_FOUND', "This user hasn't uploaded a driving licence yet.");
  return NextResponse.redirect(await dlSignedUrl(user.dlPath));
}
