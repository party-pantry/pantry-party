'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Loader2 } from 'lucide-react';

const UpdateDetailsForm: React.FC = () => {
  const { data: session, update: updateSession } = useSession();
  const [name, setName] = useState(session?.user?.name || '');
  const [email, setEmail] = useState(session?.user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!session) {
      setError('You must be logged in to update your profile.');
      setIsLoading(false);
      return;
    }

    try {
      // **NOTE:** Replace this with your actual API endpoint for updating user details
      const res = await fetch('/api/user/update-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update details.');
      }

      // If successful, update the session data client-side
      await updateSession({
        name: data.user.name,
        email: data.user.email,
      });

      setSuccess('Profile details updated successfully!');
      setName(data.user.name);
      setEmail(data.user.email);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header as="h5">Update Profile Details</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <Form.Text className="text-muted">
              Changing your email may require re-verification.
            </Form.Text>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            disabled={isLoading || (name === session?.user?.name && email === session?.user?.email)}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin me-2" /> Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default UpdateDetailsForm;
