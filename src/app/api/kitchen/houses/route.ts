import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: Request) {
  try {
    const { name, address, userId } = await req.json();
    if (!name || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Check for existing house with same name for this user (case-insensitive)
    const existing = await prisma.house.findFirst({
      where: { userId: Number(userId), name: { equals: name, mode: 'insensitive' } },
      select: { id: true, name: true },
    });
    if (existing) {
      return NextResponse.json({ error: 'House already exists', houseName: existing.name }, { status: 409 });
    }

    const newHouse = await prisma.house.create({
      data: { name, address, userId: Number(userId) },
    });

    return NextResponse.json(newHouse, { status: 201 });
  } catch (error) {
    // Try to surface Prisma unique constraint info if present
    // eslint-disable-next-line no-console
    console.error('Error creating house:', error);
    return NextResponse.json({ error: 'Failed to create house' }, { status: 500 });
  }
}
