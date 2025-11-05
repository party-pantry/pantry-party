/* eslint-disable import/prefer-default-export */
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/recipe/[id]
// get a specific recipe by ID with its ingredients, instructions, nutrition, user, and reviews
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // ✅ params is a Promise in Next 15, so await it first
  const { id } = await params;
  const recipeId = Number(id);

  if (!Number.isFinite(recipeId)) {
    return NextResponse.json(
      { error: 'Invalid recipe id' },
      { status: 400 },
    );
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      ingredients: { include: { ingredient: true } },
      instructions: true,
      nutrition: true,
      user: true,
      // include reviews so the page can show them if you want
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, username: true, image: true },
          },
        },
      },
    },
  });

  if (!recipe) {
    return NextResponse.json(
      { error: 'Recipe not found' },
      { status: 404 },
    );
  }

  // recipe already has rating + reviewCount fields from your Prisma model
  return NextResponse.json({ recipe }, { status: 200 });
}
