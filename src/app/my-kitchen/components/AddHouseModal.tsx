'use client';

import { useSession } from 'next-auth/react';
import React from 'react';
import { Alert, Form, Modal, Spinner } from 'react-bootstrap';

interface Props {
  show: boolean;
  onHide: () => void;
  onAddHouse: (house: { name: string; address?: string; userId: number }) => void;
}

const AddHouseModal: React.FC<Props> = ({ show, onHide, onAddHouse }) => {
  const userId = (useSession().data?.user as { id: number }).id;
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [formData, setFormData] = React.useState<{ name: string; address?: string; userId: number }>({
    name: '',
    address: '',
    userId,
  });

  const resetForm = () => {
    setFormData({ name: '', address: '', userId });
    setFieldErrors({});
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFieldErrors({});
    setError(null);
    setLoading(true);

    const nextFieldErrors: Record<string, string> = {};
    if (!formData.name) nextFieldErrors.name = 'Please enter a house name.';
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/kitchen/houses', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        let apiError: any = { error: 'Failed to create house' };
        try {
          apiError = await res.json();
        } catch (parseErr) {
          // ignore
        }

        if (res.status === 400) {
          if (apiError?.error?.toString().toLowerCase().includes('missing')) {
            setFieldErrors({ name: apiError.error });
          } else {
            setError(apiError.error || 'Invalid input');
          }
        } else if (res.status === 409) {
          const houseName = apiError?.houseName || formData.name;
          setFieldErrors({ name: 'House already exists' });
          setError(`${houseName} already exists`);
        } else {
          setError(apiError?.error || 'Failed to create house');
        }

        setLoading(false);
        return;
      }

      await res.json();
      onAddHouse(formData);
      // close and reset
      handleClose();
    } catch (err) {
      setError('Network error — please try again');
      // eslint-disable-next-line no-console
      console.error('Error adding house:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header style={{ borderBottom: 'none', paddingBottom: '0px' }} closeButton />
      <Modal.Body>
        <Modal.Title className="text-center" >Add House</Modal.Title>
        {error && (
          <Alert variant="danger">{error}</Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="houseName" className="mb-3">
            <Form.Label>House Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter house name"
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              isInvalid={!!fieldErrors.name}
            />
            <Form.Control.Feedback type="invalid">
              {fieldErrors.name}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="houseAddress" className="mb-3">
            <Form.Label>House Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter house address (optional)"
              value={formData.address}
              onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
              required={false}
            />
          </Form.Group>
          <button
            className="btn btn-success"
            style={{ margin: '0 auto', display: 'block' }}
            type="submit"
          >
            {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            {loading ? ' Adding...' : 'Add House'}
          </button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddHouseModal;
