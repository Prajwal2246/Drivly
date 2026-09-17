import 'dotenv/config';
import type { VehicleType } from '@prisma/client';
import { prisma } from '../src/lib/db';
import { hashPassword } from '../src/lib/auth';

async function main() {
  try {
    console.log('Clearing existing bookings, vehicles, and users...');
    await prisma.booking.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
    await prisma.society.deleteMany();

    console.log('Seeding demo sandbox users...');
    const demoPasswordHash = hashPassword('demo123');
    const society = await prisma.society.create({ data: { name: 'Greenwood Heights', city: 'Mumbai' } });

    // Create Demo Renter
    const renter = await prisma.user.create({
      data: {
        name: 'Demo Renter',
        phone: '5550001111',
        email: 'renter@drivly.demo',
        societyId: society.id,
        role: 'RENTER',
        password: demoPasswordHash,
        dlVerified: true,
      },
    });

    // Create Demo Owner
    const owner = await prisma.user.create({
      data: {
        name: 'Demo Owner',
        phone: '5550002222',
        email: 'owner@drivly.demo',
        societyId: society.id,
        role: 'OWNER',
        password: demoPasswordHash,
      },
    });

    console.log('Seeding 6 realistic vehicles tied to Demo Owner...');
    const vehiclesData: { type: VehicleType; brand: string; model: string; year: number; colorHex: string; pricePerHour: number }[] = [
      {
        type: 'CAR',
        brand: 'Honda',
        model: 'Civic',
        year: 2022,
        colorHex: '#8b0000', // Deep Red
        pricePerHour: 180,
      },
      {
        type: 'CAR',
        brand: 'Hyundai',
        model: 'Creta',
        year: 2021,
        colorHex: '#c0c0c0', // Silver
        pricePerHour: 150,
      },
      {
        type: 'CAR',
        brand: 'Tata',
        model: 'Harrier',
        year: 2023,
        colorHex: '#191970', // Midnight Blue
        pricePerHour: 220,
      },
      {
        type: 'CAR',
        brand: 'Honda',
        model: 'City',
        year: 2020,
        colorHex: '#556b2f', // Olive Green
        pricePerHour: 130,
      },
      {
        type: 'CAR',
        brand: 'Hyundai',
        model: 'i20',
        year: 2022,
        colorHex: '#3c3f41', // Carbon Grey
        pricePerHour: 110,
      },
      {
        type: 'BIKE',
        brand: 'Honda',
        model: 'CB350',
        year: 2023,
        colorHex: '#fcfaf2', // Pearl White
        pricePerHour: 70,
      },
    ];

    for (const vehicle of vehiclesData) {
      await prisma.vehicle.create({
        data: {
          ownerId: owner.id,
          ...vehicle,
          available: true,
        },
      });
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
