import { NextResponse } from 'next/server';
import { addStock } from '@/lib/dbFunctions';

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: Request) {
  try {
    const { name, quantity, status, storageId, units } = await req.json();
    if (!name || !quantity || !status || !storageId || !units) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newItem = await addStock({ name, quantity, status, storageId, units });
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
