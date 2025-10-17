'use client';

/* eslint-disable implicit-arrow-linebreak */

import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { LocalCategory } from '@/lib/Units';
import { Category } from '@prisma/client';

export type StorageInfo = {
  houseId: number;
  storageId: number;
  name: string;
  type: string;
};

interface Props {
  show: boolean;
  onClose: () => void;
  onSave: (storage: { name: string, type: string }) => void;
  pantry: StorageInfo;
}
const EditPantryModal: React.FC<Props> = ({ show, onClose, onSave, pantry }) => {
  const [formData, setFormData] = useState({
    name: pantry?.name || '',
    type: pantry?.type || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && pantry) {
      setFormData({
        name: pantry.name,
        type: pantry.type,
      });
    }
  }, [show, pantry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pantry) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/kitchen/houses/${pantry.houseId}/storages/${pantry.storageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        onSave(formData);
      } else {
        console.error('Failed to update pantry');
      }
    } catch (error) {
      console.error('Error updating pantry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
        <Modal
            show={show}
            onHide={onClose}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>Edit Pantry</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form id="editPantryForm" autoComplete="off" onSubmit={handleSubmit}>
                     <Form.Group controlId="formPantryCategory">
                        <Form.Label>Type</Form.Label>
                        <Form.Select
                            className="text-center"
                            value={formData.type}
                            onChange={(e) =>
                              handleChange(
                                'type',
                                Object.keys(LocalCategory).includes(e.target.value)
                                  ? (e.target.value as Category)
                                  : '',
                              )
                            }
                            required
                        > {Object.entries(LocalCategory).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group controlId="formPantryName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" type="submit" form="editPantryForm" disabled={loading}>
                    Save Changes
                </Button>
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
  );
};

export default EditPantryModal;
