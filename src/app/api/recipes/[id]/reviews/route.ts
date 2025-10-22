import { NextResponse } from 'next/server';
import { addRecipeReview, listRecipeReviews } from '@/lib/dbFunctions';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const recipeId = Number(params.id);
  if (!Number.isFinite(recipeId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const reviews = await listRecipeReviews(recipeId);
  return NextResponse.json(reviews, { status: 200 });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const recipeId = Number(params.id);
  if (!Number.isFinite(recipeId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await req.json();
  const rating = Number(body?.rating);
  const comment = typeof body?.comment === 'string' ? body.comment : undefined;

  // TODO: replace with real auth-derived userId
  const userId = Number(body?.userId);
  if (!Number.isFinite(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await addRecipeReview({ recipeId, userId, rating, comment });
  return NextResponse.json({ ok: true }, { status: 201 });
}
