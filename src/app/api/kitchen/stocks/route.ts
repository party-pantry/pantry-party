import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fuzzySearchIngredients } from '@/lib/dbFunctions';

/* eslint-disable max-len */
// eslint-disable-next-line import/prefer-default-export
export async function POST(req: Request) {
  try {
    const { name, quantity, status, storageId, units } = await req.json();
    if (!name || !quantity || !status || !storageId || !units) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sterilizedItemName = await fuzzySearchIngredients(name);

    // Validate that the storage exists
    const storage = await prisma.storage.findUnique({ where: { id: storageId } });
    if (!storage) {
      return NextResponse.json({ error: `Storage with ID ${storageId} does not exist`, storageId }, { status: 404 });
    }

    // First try to find existing ingredient
    let ingredient = await prisma.ingredient.findFirst({ where: { name: sterilizedItemName } });

    // If not found, try to create it (handle race condition)
    if (!ingredient) {
      try {
        ingredient = await prisma.ingredient.create({ data: { name: sterilizedItemName, foodCategory: 'OTHER' } });
      } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
          ingredient = await prisma.ingredient.findFirst({ where: { name: sterilizedItemName } });
          if (!ingredient) {
            return NextResponse.json({ error: 'Failed to create ingredient' }, { status: 409 });
          }
        } else {
          return NextResponse.json({ error: 'Failed to create ingredient' }, { status: 409 });
        }
      }
    }

    const ingredientId = ingredient.id;

    // Validate that ingredient category matches pantry category (if needed)
    if (ingredient.foodCategory === 'MEAT' && (storage.type !== 'FREEZER' && storage.type !== 'FRIDGE')) {
      return NextResponse.json({ error: 'Meat ingredients must be stored in a Freezer or a Fridge', storageName: storage.name }, { status: 401 });
    }
    if (ingredient.foodCategory === 'DAIRY' && storage.type === 'SPICE_RACK') {
      return NextResponse.json({ error: 'Dairy ingredients cannot be stored in a Spice Rack', storageName: storage.name }, { status: 401 });
    }
    if (ingredient.foodCategory === 'FROZEN' && storage.type !== 'FREEZER') {
      return NextResponse.json({ error: 'Frozen ingredients must be stored in a Freezer', storageName: storage.name }, { status: 401 });
    }
    if (ingredient.foodCategory === 'PRODUCE' && (storage.type !== 'FRIDGE' && storage.type !== 'PANTRY')) {
      return NextResponse.json({ error: 'Produce ingredients must be stored in a Fridge or a Pantry', storageName: storage.name }, { status: 401 });
    }

    // Create new stock and return it
    const newStock = await prisma.stock.create({
      data: {
        ingredientId,
        displayName: name,
        storageId: Number(storageId),
        quantity: Number(quantity),
        unit: units,
        status,
      },
    });

    return NextResponse.json(newStock, { status: 201 });
  } catch (error) {
    // Attempt to include storage name if available
    const storageName = (error && (error as any)?.storageName) || undefined;
    return NextResponse.json({ error: 'Failed to create item', storageName }, { status: 500 });
  }
}
