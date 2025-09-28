import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

interface SessionWithUser {
  user: {
    id: string;
    name?: string;
    email?: string;
  };
}

// get all ingredient IDs associated with the authenticated user
export const GET = async (req: Request) => {
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const userId = Number(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      houses: {
        include: {
          storages: { include: { stocks: true } },
        },
      },
    },
  });

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }

  const ingredientIds = user.houses
    .flatMap(h => h.storages)
    .flatMap(s => s.stocks)
    .map(s => s.ingredientId);

  return new Response(JSON.stringify({ ingredientIds }), { status: 200 });
};