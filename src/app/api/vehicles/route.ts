import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get('user_session')?.value;
    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';
    const userPayload = verifyJwt(session, secret);

    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    console.error('GET Vehicles API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = req.cookies.get('user_session')?.value;
    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-drivly-admin-session-secret-key-9988';
    const userPayload = verifyJwt(session, secret);

    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, brand, model, year, colorHex, pricePerHour } = await req.json();

    if (!type || !brand || !model || !year || !pricePerHour) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
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

    return NextResponse.json({ success: true, vehicle: newVehicle });
  } catch (error) {
    console.error('POST Vehicles API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
