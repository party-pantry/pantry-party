'use client';

/* eslint-disable implicit-arrow-linebreak */

import { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

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
    setFieldErrors({});
    setError(null);
    // client-side validation
    const nextFieldErrors: Record<string, string> = {};
    if (!formData.name?.trim()) nextFieldErrors.name = 'Name is required';
    if (!formData.type) nextFieldErrors.type = 'Type is required';
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `/api/kitchen/houses/${pantry.houseId}/storages/${pantry.storageId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      );
      if (response.ok) {
        onSave(formData);
      } else {
        let apiError: any = { error: 'Failed to update pantry' };
        try {
          apiError = await response.json();
        } catch (parseErr) {
          // ignore
        }

        if (response.status === 400) {
          if (apiError?.error?.toString().toLowerCase().includes('missing')) {
            setFieldErrors({ name: apiError.error });
          } else {
            setError(apiError.error || 'Invalid input');
          }
        } else if (response.status === 409) {
          const storageName = apiError?.storageName || formData.name;
          setFieldErrors({ name: 'Storage already exists' });
          setError(`${storageName} already exists`);
        } else {
          const storageName = apiError?.storageName || formData.name;
          setError(apiError?.error ? `${formData.name} already in ${storageName}` : 'Failed to update pantry');
        }
      }
    } catch (err) {
      setError('Network error — please try again');
      // eslint-disable-next-line no-console
      console.error('Error updating pantry:', err);
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

      setShowDeleteConfirm(false);
      onDelete?.(pantry.storageId);
      onClose();

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
                className='no-arrow highlight-on-hover'
                style={{ cursor: 'pointer' }}
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
                isInvalid={!!fieldErrors.type}
              >
                {Object.entries(LocalCategory).map(([key, value]) => (
                  <option key={key} value={key} style={{ backgroundColor: 'white' }}>
                    {value}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {fieldErrors.type}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formPantryName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isInvalid={!!fieldErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.name}
              </Form.Control.Feedback>
            </Form.Group>
            {error ? <div className="text-danger small mb-2">{error}</div> : null}
            {showDeleteConfirm ? (
              <div className="mt-3">
                <Alert variant="warning">
                  <div className="mb-2">
                    Are you sure you want to permanently delete <strong>{pantry?.name ?? 'this pantry'}</strong>?
                  </div>
                  <div className="mb-2">
                    This will remove all items stored within it and cannot be undone.
                  </div>
                  {deleteError && <div className="text-danger small mb-2">{deleteError}</div>}
                  <div className="d-flex">
                    <Button variant="danger" onClick={handleDelete} disabled={loading} className="me-2">
                      {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                      Cancel
                    </Button>
                  </div>
                </Alert>
              </div>
            ) : null}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {/* 🔄 Delete first, then Save, then Close */}
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} disabled={deleting}>
            {deleting ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            {deleting ? ' Deleting...' : 'Delete Pantry'}
          </Button>
          <Button variant="primary" type="submit" form="editPantryForm" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            {loading ? ' Saving Changes...' : 'Save Changes'}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditPantryModal;
