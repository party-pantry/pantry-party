import { NextResponse } from 'next/server';
import { deleteHouse, updateHouse } from '@/lib/dbFunctions';

// eslint-disable-next-line import/prefer-default-export
export async function DELETE(req: Request, { params }: { params: Promise<{ houseId: string }> }) {
  try {
    const { houseId: houseIdStr } = await params;
    const houseId = Number(houseIdStr);

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

export async function PATCH(req: Request, { params }: { params: Promise<{ houseId: string }> }) {
  try {
    const { houseId: houseIdStr } = await params;
    const houseId = Number(houseIdStr);
    const { name, address } = await req.json();

    if (!houseId) {
      return NextResponse.json({ error: 'Missing houseId' }, { status: 400 });
    }

    const updatedHouse = await updateHouse(houseId, { name, address });

    if (!updatedHouse) {
      return NextResponse.json({ error: 'House not found' }, { status: 404 });
    }
    return NextResponse.json(JSON.parse(JSON.stringify(updatedHouse)), { status: 200 });
  } catch (error) {
    console.error('Error updating house:', error);
    return NextResponse.json({ error: 'Failed to update house' }, { status: 500 });
  }
}
