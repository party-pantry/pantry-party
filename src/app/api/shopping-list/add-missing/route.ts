/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { ingredients } = await req.json();

    console.log('Received missing ingredients:', ingredients);

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const data = ingredients.map((i: any) => ({
      userId,
      name: i.name ?? i,
      quantity: String(i.quantity ?? '1'),
      purchased: false,
      category: i.category ?? 'Other',
      priority: i.priority ?? 'Medium',
      source: i.source ?? 'Recipe',
    }));

    await prisma.shoppingListItem.createMany({
      data,
      skipDuplicates: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding missing ingredients:', error);
    return NextResponse.json({ error: 'Failed to add ingredients' }, { status: 500 });
  }
}
