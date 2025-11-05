/* eslint-disable import/prefer-default-export */
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// updates the isStarred status
export const PATCH = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const recipeId = parseInt(id, 10);

  if (Number.isNaN(recipeId)) {
    return NextResponse.json({ error: 'Invalid Recipe ID' }, { status: 400 });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { isStarred } = body;

  if (typeof isStarred !== 'boolean') {
    return NextResponse.json({ error: 'Missing or invalid isStarred value' }, { status: 400 });
  }

  try {
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: { isStarred },
    });

    return NextResponse.json(updatedRecipe, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update recipe star status' }, { status: 500 });
  }
};
