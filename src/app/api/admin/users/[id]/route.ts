import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';
import { apiError } from '@/lib/errors';
import { Logger } from '@/lib/logger';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdminSession(req)) return apiError('UNAUTHORIZED', 'Unauthorized');
  const { id } = await params;
  const { dlVerified } = await req.json();
  if (typeof dlVerified !== 'boolean') return apiError('BAD_REQUEST', 'dlVerified must be a boolean.');

  const user = await prisma.user.update({ where: { id }, data: { dlVerified }, select: { id: true, dlVerified: true } });
  Logger.info('admin_dl_verified', { userId: id, dlVerified });
  return NextResponse.json({ success: true, user });
}
