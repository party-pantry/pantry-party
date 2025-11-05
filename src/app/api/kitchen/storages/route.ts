import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Category } from '@prisma/client';

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: Request) {
  try {
    const { name, type, houseId } = await req.json();
    if (!name || !type || !houseId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      const newStorage = await prisma.storage.create({
        data: {
          name,
          // cast the incoming string to the Prisma Category enum
          type: type as Category,
          houseId: Number(houseId),
        },
      });

      return NextResponse.json(newStorage, { status: 201 });
    } catch (error: any) {
      // Handle unique constraint violation on name (duplicate storage)
      if (error?.code === 'P2002' && error?.meta?.target?.includes('name')) {
        return NextResponse.json({ error: 'Storage already exists', storageName: name }, { status: 409 });
      }
      // Fallback: return storageName so client can form friendly message
      return NextResponse.json({ error: 'Failed to create storage', storageName: name }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create storage' }, { status: 500 });
  }
}
