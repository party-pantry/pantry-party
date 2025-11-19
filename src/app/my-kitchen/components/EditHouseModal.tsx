'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';

interface Props {
  show: boolean;
  onClose: () => void;
  onSave: (house: { name: string; address?: string }) => void;
  house: {
    houseId: number;
    name: string;
    address?: string;
  };
}
const EditHouseModal: React.FC<Props> = ({ show, onClose, onSave, house }) => {
  const [formData, setFormData] = useState({
    name: house?.name || '',
    address: house?.address || '',
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && house) {
      setFormData({
        name: house.name,
        address: house.address || '',
      });
    }
  }, [show, house]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!house) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/kitchen/houses/${house.houseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update house');
      }

      onSave(formData);
    // eslint-disable-next-line @typescript-eslint/no-shadow
    } catch (submitErr) {
      console.error('Error updating house:', submitErr);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!house) return;
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/kitchen/houses/${house.houseId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        try {
          const body = await res.json();
          setError(body?.error || 'Failed to delete house');
        } catch (e) {
          setError('Failed to delete house');
        }
        return;
      }

      // reuse onSave to close modal and let parent refresh list
      onSave(formData);
    } catch (err) {
      // network or other
      setError('Failed to delete house');
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
    >
      <Modal.Header>
        <Modal.Title>Edit House</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error ? <Alert variant="danger">{error}</Alert> : null}
        <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formHouseName" className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={formData.name}
            placeholder="Enter house name"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="formHouseAddress" className="mb-3">
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            value={formData.address}
              placeholder={house?.address || '2500 Campus Road...'}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
          />
        </Form.Group>
      </Form>
        {showConfirmDelete ? (
          <div className="mt-3">
            <Alert variant="warning">
              <div>
                Are you sure you want to delete <strong>{house?.name}</strong>? This cannot be undone.
              </div>
              <div className="mt-2 d-flex">
                <Button variant="danger" onClick={handleDelete} disabled={loading} className="me-2">
                  {loading ? 'Deleting...' : 'Delete'}
                </Button>
                <Button variant="secondary" onClick={() => setShowConfirmDelete(false)} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </Alert>
          </div>
        ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowConfirmDelete(true)} disabled={deleting}>
            {deleting ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            {deleting ? ' Deleting...' : 'Delete House'}
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            {loading ? ' Saving...' : 'Save Changes'}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Close
          </Button>
        </Modal.Footer>
    </Modal>
  );
};

export default EditHouseModal;
