/* eslint-disable max-len */
import { NextResponse } from 'next/server';
import { deleteStock, updateStock } from '@/lib/dbFunctions';
import { Unit, Status } from '@prisma/client';
import { LocalUnit, LocalStatus } from '@/lib/Units';

// eslint-disable-next-line import/prefer-default-export
export async function PATCH(
  req: Request,
  context: { params: Promise<{ ingredientId: number; storageId: number }> },
) {
  try {
    const { params } = context;
    const resolvedParams = await params;

    const { newName, quantity, unit, status } = await req.json();
    const ingredientId = Number(resolvedParams.ingredientId);
    const storageId = Number(resolvedParams.storageId);

    if (!newName || quantity === undefined || !unit || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dbUnit = Object.keys(LocalUnit).find(key => LocalUnit[key as keyof typeof LocalUnit] === unit) || unit.toUpperCase();
    const dbStatus = Object.keys(LocalStatus).find(key => LocalStatus[key as keyof typeof LocalStatus] === status) || status.toUpperCase();

    const updatedStock = await updateStock({
      ingredientId,
      storageId,
      newName,
      quantity,
      unit: dbUnit as Unit,
      status: dbStatus as Status,
    });

    if (!updatedStock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    return NextResponse.json(JSON.parse(JSON.stringify(updatedStock)));
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.error();
  }
}

export async function DELETE(req: Request, { params }: { params: { ingredientId: number, storageId: number } }) {
  try {
    const ingredientId = Number(params.ingredientId);
    const storageId = Number(params.storageId);

    await deleteStock(ingredientId, storageId);

    return NextResponse.json({ message: 'Stock deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock:', error);
    return NextResponse.error();
  }
}
