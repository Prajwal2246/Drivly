import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Logger } from '@/lib/logger';
import { apiError } from '@/lib/errors';
import { getSession } from '@/lib/session';
import { vehicleUpdateSchema } from '@/lib/validations';

// Owner-only edit / unlist. See docs/decisions.md #014.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession(req);
    if (!user) return apiError('UNAUTHORIZED', 'Your session has expired. Please log in again.');
    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({ where: { id }, select: { ownerId: true } });
    if (!vehicle) return apiError('NOT_FOUND', 'Vehicle not found.');
    if (vehicle.ownerId !== user.userId) return apiError('FORBIDDEN', 'Only the owner can edit this vehicle.');

    const result = vehicleUpdateSchema.safeParse(await req.json());
    if (!result.success) return apiError('VALIDATION_ERROR', result.error.issues[0].message);

    const updated = await prisma.vehicle.update({ where: { id }, data: result.data });
    Logger.info('vehicle_updated', { vehicleId: id, ownerId: user.userId, fields: Object.keys(result.data) });
    return NextResponse.json({ success: true, vehicle: updated });
  } catch (error) {
    Logger.error('patch_vehicle_api_exception', error);
    return apiError('INTERNAL_ERROR', 'Internal error');
  }
}

// Hard delete only while the vehicle has no bookings: the Booking FK cascades, which would erase
// payment, challan and review history. Anything with history gets unlisted instead.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession(req);
    if (!user) return apiError('UNAUTHORIZED', 'Your session has expired. Please log in again.');
    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({ where: { id }, select: { ownerId: true, _count: { select: { bookings: true } } } });
    if (!vehicle) return apiError('NOT_FOUND', 'Vehicle not found.');
    if (vehicle.ownerId !== user.userId) return apiError('FORBIDDEN', 'Only the owner can delete this vehicle.');
    if (vehicle._count.bookings > 0) return apiError('CONFLICT', 'This vehicle has booking history. Unlist it instead.');

    // ponytail: count-then-delete can race a new booking; the cascade would then drop it. Lock the row (#011) if that's ever seen.
    await prisma.vehicle.delete({ where: { id } });
    Logger.info('vehicle_deleted', { vehicleId: id, ownerId: user.userId });
    return NextResponse.json({ success: true });
  } catch (error) {
    Logger.error('delete_vehicle_api_exception', error);
    return apiError('INTERNAL_ERROR', 'Internal error');
  }
}
