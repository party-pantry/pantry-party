'use client';

import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

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
    } catch (error) {
      console.error('Error updating house:', error);
    } finally {
      setLoading(false);
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
            placeholder={house?.address || 'Enter house address (optional)'}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </Form.Group>
      </Form>
        </Modal.Body>
        <Modal.Footer>
        <Button type="submit" onClick={handleSubmit} disabled={loading}>Save</Button>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditHouseModal;
