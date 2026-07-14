import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import { Logger } from '@/lib/logger';
import { apiError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get('user_session')?.value;
    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';
    const userPayload = verifyJwt(session, secret);

    if (!userPayload) {
      return apiError('UNAUTHORIZED', 'Unauthorized');
    }

    // Find all vehicles in the user's society
    const vehicles = await prisma.vehicle.findMany({
      where: {
        owner: {
          societyName: userPayload.society,
        },
      },
      include: {
        owner: {
          select: {
            name: true,
            phone: true,
            societyName: true,
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
    const session = req.cookies.get('user_session')?.value;
    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';
    const userPayload = verifyJwt(session, secret);

    if (!userPayload) {
      return apiError('UNAUTHORIZED', 'Unauthorized');
    }

    const { type, brand, model, year, colorHex, pricePerHour } = await req.json();

    if (!type || !brand || !model || !year || !pricePerHour) {
      return apiError('BAD_REQUEST', 'Missing required parameters.');
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
        ownerId: userPayload.userId,
        type,
        brand,
        model,
        year: parseInt(year),
        colorHex: colorHex || '#000000',
        pricePerHour: parseFloat(pricePerHour),
      },
    });

    Logger.info('vehicle_listed', { vehicleId: newVehicle.id, ownerId: userPayload.userId, brand: newVehicle.brand, model: newVehicle.model });

    return NextResponse.json({ success: true, vehicle: newVehicle });
  } catch (error) {
    Logger.error('post_vehicle_api_exception', error);
    return apiError('INTERNAL_ERROR', 'Internal Server Error');
  }
}
