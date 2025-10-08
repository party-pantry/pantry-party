/* eslint-disable import/prefer-default-export */
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import authOptions from '@/lib/authOptions';
import { getSuggestedItems } from '@/lib/dbFunctions';

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
    const suggestions = await getSuggestedItems(userId);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
