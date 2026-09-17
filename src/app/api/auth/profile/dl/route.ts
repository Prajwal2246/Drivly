import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { apiError } from '@/lib/errors';
import { Logger } from '@/lib/logger';
import { uploadDl } from '@/lib/storage';
import { validateUpload, DL_EXT } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const user = await getSession(req);
    if (!user) return apiError('UNAUTHORIZED', 'Unauthorized');

    const file = (await req.formData()).get('file');
    if (!(file instanceof File)) return apiError('BAD_REQUEST', 'No file provided.');

    const invalid = validateUpload(file.type, file.size, DL_EXT);
    if (invalid) return apiError('VALIDATION_ERROR', invalid);

    const dlPath = await uploadDl(user.userId, file);
    // Re-upload always resets verification
    await prisma.user.update({ where: { id: user.userId }, data: { dlPath, dlVerified: false } });

    Logger.info('dl_uploaded', { userId: user.userId, dlPath });
    return NextResponse.json({ success: true, dlPath });
  } catch (error) {
    Logger.error('dl_upload_exception', error);
    return apiError('INTERNAL_ERROR', 'Internal Server Error');
  }
}
