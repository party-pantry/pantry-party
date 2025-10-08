/* eslint-disable import/prefer-default-export */
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import authOptions from '@/lib/authOptions';
import { getShoppingListItems, addShoppingListItem } from '@/lib/dbFunctions';

interface SessionWithUser {
  user: {
    id: string;
    name?: string;
    email?: string;
  };
}

export async function GET() {
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = Number(session.user.id);

  try {
    const items = await getShoppingListItems(userId);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return NextResponse.json({ error: 'Failed to fetch shopping list' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = Number(session.user.id);

  try {
    const body = await req.json();
    const { ingredientId, name, quantity, category, priority, source, sourceStockIngredientId, sourceStorageId } = body;

    if (!name || !quantity || !category || !priority || !source) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const item = await addShoppingListItem({
      userId,
      ingredientId,
      name,
      quantity,
      category,
      priority,
      source,
      sourceStockIngredientId,
      sourceStorageId,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error adding shopping list item:', error);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}
