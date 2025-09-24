import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// eslint-disable-next-line import/prefer-default-export
export async function GET() {
  try {
    const houses = await prisma.house.findMany({
      where: { userId: 1 }, // implement session userId when auth is added
      include: {
        storages: {
          include: { stocks: { include: { ingredient: true } } },
        },
      },
    });

    return NextResponse.json(houses);
  } catch (error) {
    console.error('Request error', error);
    return NextResponse.json({ error: 'Failed to fetching stocks' }, { status: 500 });
  }
}
