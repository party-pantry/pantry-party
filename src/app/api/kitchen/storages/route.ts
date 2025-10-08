import { NextResponse } from 'next/server';
import { addStorage } from '@/lib/dbFunctions';

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: Request) {
  try {
    const { name, type, houseId } = await req.json();
    if (!name || !type || !houseId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newStorage = await addStorage({ name, type, houseId });
    return NextResponse.json(newStorage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create storage' }, { status: 500 });
  }
}
