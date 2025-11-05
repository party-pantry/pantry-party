'use client';

/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable react/prop-types */

import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useState } from 'react';
import { Category } from '@prisma/client';
import { LocalCategory } from '@/lib/Units';

interface Props {
  show: boolean;
  onHide: () => void;
  onAddPantry: (pantry: { name: string; type: Category }) => void;
  houseId: number;
}

const AddPantryModal: React.FC<Props> = ({ show, onHide, onAddPantry, houseId }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'FRIDGE' as Category,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFieldErrors({});
    setError(null);
    setLoading(true);

    const nextFieldErrors: Record<string, string> = {};
    if (!formData.name?.trim()) nextFieldErrors.name = 'Name is required';
    if (!formData.type) nextFieldErrors.type = 'Type is required';
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    try {
      const res = await fetch('/api/kitchen/storages', {
        method: 'POST',
        body: JSON.stringify({ ...formData, houseId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        let apiError: any = { error: 'Failed to create storage' };
        try {
          apiError = await res.json();
        } catch (parseErr) {
          // ignore JSON parse errors
        }
        if (res.status === 400) {
          if (apiError?.error?.toString().toLowerCase().includes('missing')) {
            setFieldErrors({ name: apiError.error });
          } else {
            setError(apiError.error || 'Invalid input');
          }
        } else if (res.status === 409) {
          const storageName = apiError?.storageName || formData.name;
          setFieldErrors({ name: 'Storage already exists' });
          setError(`${storageName} already exists`);
        } else {
          const storageName = apiError?.storageName || formData.name;
          setError(apiError?.error ? `${formData.name} already in ${storageName}` : 'Failed to create storage');
        }

        setLoading(false);
        return;
      }

      const created = await res.json();
      onAddPantry({ name: created.name ?? formData.name, type: created.type ?? formData.type });
      setFormData({ name: '', type: 'FRIDGE' as Category });
      onHide();
    } catch (err) {
      setError('Network error — please try again');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="custom-modal"
    >
      <Modal.Header
        style={{ borderBottom: 'none', paddingBottom: '0px' }}
        closeButton
      />
      <Modal.Body className="text-center">
        <h4>Add New Pantry</h4>
        <Form autoComplete="off" onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="storageType">
              <Form.Select
                className='text-center no-arrow highlight-on-hover'
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

          <Row className="mb-3">
            <Col>
              <Form.Group controlId="storageName">
                <Form.Control
                  className="text-center"
                  placeholder="Storage Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  isInvalid={!!fieldErrors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.name}
                </Form.Control.Feedback>

              </Form.Group>
            </Col>
          </Row>

          <Button variant="success" type="submit">
            {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            {loading ? ' Adding...' : 'Add Pantry'}
          </Button>
          {error ? <div className="text-danger small mt-2">{error}</div> : null}
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddPantryModal;
