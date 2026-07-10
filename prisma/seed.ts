import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hashPassword } from '../src/lib/auth';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('Clearing existing bookings, vehicles, and users...');
    await prisma.booking.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();

    console.log('Seeding demo sandbox users...');
    const demoPasswordHash = hashPassword('demo123');

    // Create Demo Renter
    const renter = await prisma.user.create({
      data: {
        name: 'Demo Renter',
        phone: '5550001111',
        email: 'renter@drivly.demo',
        city: 'Mumbai',
        societyName: 'Greenwood Heights',
        role: 'RENTER',
        password: demoPasswordHash,
        preVerifyDl: true,
        dlFileName: 'demo_license.pdf',
      },
    });

    // Create Demo Owner
    const owner = await prisma.user.create({
      data: {
        name: 'Demo Owner',
        phone: '5550002222',
        email: 'owner@drivly.demo',
        city: 'Mumbai',
        societyName: 'Greenwood Heights',
        role: 'OWNER',
        password: demoPasswordHash,
      },
    });

    console.log('Seeding 6 realistic vehicles tied to Demo Owner...');
    const vehiclesData = [
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
    await pool.end();
  }
}

main();
