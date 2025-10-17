/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { updateStorage } from '@/lib/dbFunctions';

export async function PATCH(request: Request, { params }: { params: { houseId: string; storageId: string } }) {
  const { houseId, storageId } = params;
  const { name, type } = await request.json();

  if (!houseId || !storageId) {
    return new NextResponse(JSON.stringify({ error: 'Invalid house or storage ID' }), { status: 400 });
  }

  try {
    const updatedStorage = await updateStorage(Number(houseId), Number(storageId), { name, category: type });
    return new NextResponse(JSON.stringify(updatedStorage), { status: 200 });
  } catch (error) {
    console.error('Error updating storage:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update storage' }), { status: 500 });
  }
}
