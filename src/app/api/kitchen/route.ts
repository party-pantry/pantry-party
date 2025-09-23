import { prisma } from '../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
      const userId = req.headers.get('userId');
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }

      const houses = await prisma.house.findMany({
      where: { userId: Number(userId) }, 
        include: {
          storages: {
            include: { stocks: { include: { ingredient: true } } }
          }
        }
      });

      return NextResponse.json(houses);

    } catch (error) {
      console.error('Request error', error);
      return NextResponse.json({ error: 'Failed to fetching stocks' }, { status: 500 });
    }
}

  