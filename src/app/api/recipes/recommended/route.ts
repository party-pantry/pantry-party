import { prisma } from '@/lib/prisma';

export const GET = async () => {
  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        OR: [
          { rating: { gte: 4.0 } },
          { reviewCount: { gte: 5 } },
        ],
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      take: 6,
    });

    return new Response(JSON.stringify({ recipes }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to fetch recommended recipes' }), { status: 500 });
  }
};
