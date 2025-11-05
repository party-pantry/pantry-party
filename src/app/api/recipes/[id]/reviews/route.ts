/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET: public – list reviews
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const recipeId = Number(params.id);
  if (!Number.isFinite(recipeId)) {
    return NextResponse.json({ error: 'Invalid recipe id' }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { recipeId },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, username: true } } },
  });

  return NextResponse.json(reviews, { status: 200 });
}

// POST: auth required – add/update a review, then refresh recipe avg/count
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = Number((session?.user as any)?.id);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const recipeId = Number(params.id);
  if (!Number.isFinite(recipeId)) {
    return NextResponse.json({ error: 'Invalid recipe id' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const rating = Number(body?.rating);
  const comment = typeof body?.comment === 'string' ? body.comment.trim() : undefined;

  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be 0–5' }, { status: 400 });
  }

  // create or update the user's review (no compound upsert needed)
  const existing = await prisma.review.findFirst({ where: { recipeId, userId } });
  if (existing) {
    await prisma.review.update({
      where: { id: existing.id },
      data: { rating, comment },
    });
  } else {
    await prisma.review.create({
      data: { recipeId, userId, rating, comment },
    });
  }

  // recompute recipe aggregate
  const agg = await prisma.review.aggregate({
    where: { recipeId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewCount: agg._count,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
