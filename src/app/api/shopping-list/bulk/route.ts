/* eslint-disable import/prefer-default-export */
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import authOptions from '@/lib/authOptions';
import { markShoppingListItemsBoughtBulk, deleteShoppingListItemsBulk } from '@/lib/dbFunctions';

interface SessionWithUser {
  user: {
    id: string;
    name?: string;
    email?: string;
  };
}

export async function PATCH(req: Request) {
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = Number(session.user.id);

  try {
    const body = await req.json();
    const { action, ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No ids provided' }, { status: 400 });
    }

    if (action === 'mark-bought') {
      const result = await markShoppingListItemsBoughtBulk(userId, ids);
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error in bulk PATCH:', error);
    return NextResponse.json({ error: 'Failed to perform bulk action' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = Number(session.user.id);

  try {
    const body = await req.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No ids provided' }, { status: 400 });
    }

    const result = await deleteShoppingListItemsBulk(userId, ids);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error in bulk DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete items' }, { status: 500 });
  }
}
