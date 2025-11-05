'use client';

import { useEffect, useState } from 'react';
import { Button, Form, Card, Row, Col } from 'react-bootstrap';
import StarRating from '@/components/recipes-components/StarRating';

type Review = {
  id: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: { id: number; username: string };
};

export default function ReviewSection({ recipeId }: { recipeId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  // Load all reviews for this recipe
  const loadReviews = async () => {
    try {
      const res = await fetch(`/api/recipes/${recipeId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data ?? []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [recipeId]);

  // Submit review handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch(`/api/recipes/${recipeId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });

      // Handle unauthorized users
      if (res.status === 401) {
        alert('Please sign in to leave a review.');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Failed to post review');
      }

      setComment('');
      setRating(5);
      await loadReviews();
      window.location.reload(); // refresh recipe avg/count
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-5 w-100">
      <Card className="p-4 shadow-sm">
        <h3 className="mb-3">Leave a Review</h3>

        <Form onSubmit={handleSubmit} className="mb-4">
          <Row className="align-items-center mb-3">
            <Col md="auto" className="fw-bold">Rating:</Col>
            <Col>
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  onClick={() => setRating(n)}
                  style={{
                    cursor: 'pointer',
                    color: n <= rating ? 'gold' : '#ccc',
                    fontSize: '1.9rem',
                    marginRight: 4,
                  }}
                  aria-hidden
                  title={`${n} star${n > 1 ? 's' : ''}`}
                >
                  ★
                </span>
              ))}
              <span className="ms-2 text-muted">{rating}/5</span>
            </Col>
          </Row>

          <Form.Control
            as="textarea"
            rows={4}
            placeholder="Share your thoughts about this recipe..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-3"
          />

          <Button
            type="submit"
            disabled={busy}
            variant="primary"
            style={{ width: '180px' }}
          >
            {busy ? 'Submitting…' : 'Post Review'}
          </Button>
        </Form>

        <hr />

        <h4 className="mb-3">All Reviews</h4>
        {reviews.length === 0 ? (
          <p className="text-muted mb-0">
            No reviews yet — be the first to share your thoughts!
          </p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {reviews.map((r) => (
              <Card
                key={r.id}
                className="p-3 border-0 border-bottom bg-light-subtle"
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong>@{r.user.username}</strong>
                  <small className="text-muted">
                    {new Date(r.createdAt).toLocaleString()}
                  </small>
                </div>
                <StarRating rating={r.rating} size={20} />
                {r.comment && <p className="mt-2 mb-0">{r.comment}</p>}
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
