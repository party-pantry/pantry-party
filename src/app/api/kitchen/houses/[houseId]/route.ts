import { NextResponse } from 'next/server';
import { deleteHouse } from '@/lib/dbFunctions';

// eslint-disable-next-line import/prefer-default-export
export async function DELETE(req: Request, { params }: { params: { houseId: string } }) {
  try {
    const houseId = Number(params.houseId);
    if (!houseId) {
      return NextResponse.json({ error: 'Missing houseId' }, { status: 400 });
    }

    await deleteHouse(houseId);
    return NextResponse.json({ message: 'House deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting house:', error);
    return NextResponse.json({ error: 'Failed to delete house' }, { status: 500 });
  }
}
