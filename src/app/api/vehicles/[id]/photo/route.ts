import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Logger } from '@/lib/logger';
import { apiError } from '@/lib/errors';
import { getSession } from '@/lib/session';
import { uploadVehiclePhoto, vehiclePhotoUrl } from '@/lib/storage';
import { validateUpload, PHOTO_EXT } from '@/lib/validations';

// Owner uploads/replaces the listing photo. See docs/decisions.md #015.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession(req);
    if (!user) return apiError('UNAUTHORIZED', 'Unauthorized');
    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({ where: { id }, select: { ownerId: true } });
    if (!vehicle) return apiError('NOT_FOUND', 'Vehicle not found.');
    if (vehicle.ownerId !== user.userId) return apiError('FORBIDDEN', 'Only the owner can change this photo.');

    const file = (await req.formData()).get('file');
    if (!(file instanceof File)) return apiError('BAD_REQUEST', 'No file provided.');
    const invalid = validateUpload(file.type, file.size, PHOTO_EXT);
    if (invalid) return apiError('VALIDATION_ERROR', invalid);

    const photoPath = await uploadVehiclePhoto(id, file);
    await prisma.vehicle.update({ where: { id }, data: { photoPath } });

    Logger.info('vehicle_photo_uploaded', { vehicleId: id, photoPath });
    return NextResponse.json({ success: true, photoUrl: vehiclePhotoUrl(photoPath) });
  } catch (error) {
    Logger.error('vehicle_photo_upload_exception', error);
    return apiError('INTERNAL_ERROR', 'Internal Server Error');
  }
}
