import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// eslint-disable-next-line import/prefer-default-export
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id  = searchParams.get('userId');

  if (!id) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const houses = await prisma.house.findMany({
      where: { userId: Number(id) },
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
