import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Logger } from '@/lib/logger';
import { apiError } from '@/lib/errors';
import { getSession } from '@/lib/session';
import { vehicleSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const userPayload = await getSession(req);

    if (!userPayload) {
      return apiError('UNAUTHORIZED', 'Unauthorized');
    }

    // Find all vehicles in the user's society
    const vehicles = await prisma.vehicle.findMany({
      where: {
        owner: {
          societyId: userPayload.societyId,
        },
        listed: true,
      },
      include: {
        owner: {
          select: {
            name: true,
            phone: true,
            society: { select: { name: true } },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, vehicles });
  } catch (error) {
    Logger.error('get_vehicles_api_exception', error);
    return apiError('INTERNAL_ERROR', 'Internal Server Error');
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = await getSession(req);

    if (!userPayload) {
      return apiError('UNAUTHORIZED', 'Unauthorized');
    }

    // The /dashboard/list-vehicle page hides the form from renters; the API has to enforce it too.
    if (userPayload.role === 'RENTER') {
      return apiError('FORBIDDEN', 'Renter accounts cannot list vehicles. Switch to Owner or Both in your profile.');
    }

    const result = vehicleSchema.safeParse(await req.json());
    if (!result.success) {
      return apiError('VALIDATION_ERROR', result.error.issues[0].message);
    }

    const newVehicle = await prisma.vehicle.create({
      data: { ...result.data, ownerId: userPayload.userId },
    });

    Logger.info('vehicle_listed', { vehicleId: newVehicle.id, ownerId: userPayload.userId, brand: newVehicle.brand, model: newVehicle.model });

    return NextResponse.json({ success: true, vehicle: newVehicle });
  } catch (error) {
    Logger.error('post_vehicle_api_exception', error);
    return apiError('INTERNAL_ERROR', 'Internal Server Error');
  }
}
