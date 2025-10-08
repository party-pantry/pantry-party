/* eslint-disable import/prefer-default-export */
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import authOptions from '@/lib/authOptions';
import {
  updateShoppingListItem,
  toggleShoppingListItemPurchased,
  deleteShoppingListItem,
} from '@/lib/dbFunctions';

interface SessionWithUser {
  user: {
    id: string;
    name?: string;
    email?: string;
  };
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const itemId = Number(params.id);

  try {
    const body = await req.json();
    const { action, ...updateData } = body;

    if (action === 'toggle-purchased') {
      const item = await toggleShoppingListItemPurchased(itemId);
      return NextResponse.json(item);
    }

    const item = await updateShoppingListItem(itemId, updateData);
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating shopping list item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const itemId = Number(params.id);

  try {
    await deleteShoppingListItem(itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shopping list item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
