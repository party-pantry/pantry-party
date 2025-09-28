import { prisma } from '@/lib/prisma';

// get all recipes with their ingredients
export const GET = async (req: Request) => {
    try {
        const recipes = await prisma.recipe.findMany({
            include: {
                ingredients: {
                    include: {
                        ingredient: true,
                    },
                },
            },
        });

        return new Response(JSON.stringify({ recipes }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to fetch recipes' }), { status: 500 });
  }
};
