/* eslint-disable import/prefer-default-export */
import { prisma } from '@/lib/prisma';

// get a specific recipe by ID with its ingredients, instructions, nutrition, and user
export const GET = async (req: Request, { params }: { params: { id: string } }) => {
  const id = Number(await params.id);

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { include: { ingredient: true } },
      instructions: true,
      nutrition: true,
      user: true,
    },
  });

  if (!recipe) {
    return new Response(JSON.stringify({ error: 'Recipe not found' }), { status: 404 });
  }

  return new Response(JSON.stringify({ recipe }), { status: 200 });
};
