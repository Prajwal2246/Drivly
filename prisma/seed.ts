import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hashPassword } from '../src/lib/auth';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../src/lib/demo-accounts';

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
    const demoPasswordHash = hashPassword(DEMO_PASSWORD);

    // Create Demo Renter
    const renter = await prisma.user.create({
      data: {
        name: DEMO_ACCOUNTS.renter.name,
        phone: DEMO_ACCOUNTS.renter.phone,
        email: DEMO_ACCOUNTS.renter.email,
        city: 'Mumbai',
        societyName: 'Greenwood Heights',
        role: DEMO_ACCOUNTS.renter.role,
        password: demoPasswordHash,
        preVerifyDl: true,
        dlFileName: 'demo_license.pdf',
      },
    });

    // Create Demo Owner
    const owner = await prisma.user.create({
      data: {
        name: DEMO_ACCOUNTS.owner.name,
        phone: DEMO_ACCOUNTS.owner.phone,
        email: DEMO_ACCOUNTS.owner.email,
        city: 'Mumbai',
        societyName: 'Greenwood Heights',
        role: DEMO_ACCOUNTS.owner.role,
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
