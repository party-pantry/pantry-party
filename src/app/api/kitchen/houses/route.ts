import { NextResponse } from 'next/server';
import { addHouse } from '@/lib/dbFunctions';

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: Request) {
  try {
    const { name, address, userId } = await req.json();
    if (!name || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newHouse = await addHouse({ name, address, userId });
    return NextResponse.json(newHouse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create house' }, { status: 500 });
  }
}
