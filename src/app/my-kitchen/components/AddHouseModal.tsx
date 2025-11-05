'use client';

import { useSession } from 'next-auth/react';
import React from 'react';
import { Form, Modal, Spinner } from 'react-bootstrap';

interface Props {
  show: boolean;
  onHide: () => void;
  onAddHouse: (house: { name: string; address?: string; userId: number }) => void;
}

const AddHouseModal: React.FC<Props> = ({ show, onHide, onAddHouse }) => {
  const userId = (useSession().data?.user as { id: number }).id;
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [formData, setFormData] = React.useState<{ name: string; address?: string; userId: number }>({
    name: '',
    address: '',
    userId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (formData.name) {
      try {
        await fetch('/api/kitchen/houses', {
          method: 'POST',
          body: JSON.stringify(formData),
          headers: { 'Content-Type': 'application/json' },
        });
        onAddHouse(formData);
        setFormData({ name: '', address: '', userId });
        setError(null);
        onHide();
      // eslint-disable-next-line @typescript-eslint/no-shadow
      } catch (error) {
        setError('Error adding house.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header style={{ borderBottom: 'none', paddingBottom: '0px' }} closeButton />
      <Modal.Body>
        <Modal.Title className="text-center" >Add House</Modal.Title>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="houseName" className="mb-3">
            <Form.Label>House Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter house name"
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
            />
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
