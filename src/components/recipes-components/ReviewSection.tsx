'use client';

import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import StarRating from '@/components/recipes-components/StarRating';

type Review = {
  id: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: { id: number; username: string };
};

export default function ReviewSection({
  recipeId,
  currentUserId,
}: {
  recipeId: number;
  /** optional; if your API pulls user from session you can omit it */
  currentUserId?: number;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/recipes/${recipeId}/reviews`);
    const data = await res.json();
    setReviews(data ?? []);
  };

  useEffect(() => {
    load();
  }, [recipeId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload: any = { rating, comment };
      if (typeof currentUserId === 'number') payload.userId = currentUserId;

      const res = await fetch(`/api/recipes/${recipeId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error ?? 'Failed to post review');
      }

      setComment('');
      await load(); // refresh review list
      window.location.reload(); // refresh page summary (avg + count)
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-5">
      <h3 className="mb-3">Reviews</h3>

      <Form onSubmit={submit} className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          <strong>Rating:</strong>
          {/* simple clickable stars for selection */}
          <div>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                style={{ cursor: 'pointer', fontSize: 22, lineHeight: 1 }}
                onClick={() => setRating(n)}
                aria-hidden
                title={`${n} star${n > 1 ? 's' : ''}`}
              >
                {n <= rating ? '★' : '☆'}
              </span>
            ))}
          </div>
          <span className="text-muted ms-2">{rating}/5</span>
        </div>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Write your review…"
          className="mb-2"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button type="submit" disabled={busy}>
          {busy ? 'Submitting…' : 'Leave Review'}
        </Button>
      </Form>

      {reviews.length === 0 ? (
        <p className="text-muted">No reviews yet.</p>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="border rounded p-3 mb-2">
            <div className="d-flex justify-content-between">
              <strong>@{r.user.username}</strong>
              <small className="text-muted">{new Date(r.createdAt).toLocaleString()}</small>
            </div>
            <div className="mt-1">
              <StarRating rating={r.rating} size={18} />
            </div>
            {r.comment && <p className="mb-0 mt-2">{r.comment}</p>}
          </div>
        ))
      )}
    </div>
  );
}
