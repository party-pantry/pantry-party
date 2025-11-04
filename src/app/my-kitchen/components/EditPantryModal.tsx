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
  onSave: (storage: { name: string; type: string }) => void;
  onDelete?: (storageId: number) => void;
  pantry: StorageInfo;
}

const EditPantryModal: React.FC<Props> = ({ show, onClose, onSave, onDelete, pantry }) => {
  const [formData, setFormData] = useState({
    name: pantry?.name || '',
    type: pantry?.type || '',
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (show && pantry) {
      setFormData({
        name: pantry.name,
        type: pantry.type,
      });
    }
  }, [show, pantry]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pantry) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/kitchen/houses/${pantry.houseId}/storages/${pantry.storageId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      );
      if (response.ok) onSave(formData);
      else console.error('Failed to update pantry');
    } catch (error) {
      console.error('Error updating pantry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!pantry) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(
        `/api/kitchen/houses/${pantry.houseId}/storages/${pantry.storageId}`,
        { method: 'DELETE' },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Failed to delete pantry');
      }

      // ✅ Close modal + call parent update if provided
      setShowDeleteConfirm(false);
      onDelete?.(pantry.storageId);
      onClose();

      // ✅ Hard refresh like AddItemModal
      window.location.reload();
    } catch (err: any) {
      setDeleteError(err.message ?? 'Failed to delete pantry');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Edit Modal */}
      <Modal show={show} onHide={onClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Pantry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="editPantryForm" autoComplete="off" onSubmit={handleSubmit}>
            <Form.Group controlId="formPantryCategory" className="mb-3">
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
              >
                {Object.entries(LocalCategory).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="formPantryName" className="mb-3">
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
          {/* 🔄 Delete first, then Save, then Close */}
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} disabled={loading}>
            Delete Pantry
          </Button>
          <Button variant="primary" type="submit" form="editPantryForm" disabled={loading}>
            Save Changes
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Pantry?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to permanently delete{' '}
            <strong>{pantry?.name ?? 'this pantry'}</strong>?
          </p>
          <p>This will remove all items stored within it and cannot be undone.</p>
          {deleteError && <p className="text-danger mt-2">{deleteError}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditPantryModal;
