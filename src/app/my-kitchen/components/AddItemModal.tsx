'use client';

/* eslint-disable max-len */
/* eslint-disable no-tabs */
/* eslint-disable react/prop-types */

import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Unit, Status } from '@prisma/client';
import { LocalUnit, LocalStatus } from '@/lib/Units';

interface Props {
  show: boolean;
  onHide: () => void;
  onAddItem: (item: {
    name: string;
    // image: string; // Wait for image implementation
    quantity: number;
    status: Status;
    storageId: number;
    units: Unit;
  }) => void;
  storages:
  | {
    id: number;
    name: string;
  }[]
  | null;
}

const AddItemModal: React.FC<Props> = ({
  show,
  onHide,
  onAddItem,
  storages,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    // image: '',
    quantity: 0,
    status: Status.GOOD,
    storageId: storages && storages.length > 0 ? storages[0].id : 1,
    units: Unit.OUNCE,
  });

  useEffect(() => {
    if (storages && storages.length > 0) {
      setFormData((prev) => ({ ...prev, storageId: storages[0].id }));
    }
  }, [storages]);

  const resetForm = () => {
    setFormData({
      name: '',
      // image: '',
      quantity: 0,
      status: Status.GOOD,
      storageId: storages && storages.length > 0 ? storages[0].id : 1,
      units: Unit.OUNCE,
    });
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

    // clear previous errors
    setError(null);
    setFieldErrors({});
    setLoading(true);

    // client-side validation
    const errors: Record<string, string> = {};
    if (!formData.name || String(formData.name).trim() === '') {
      errors.name = 'Please enter an item name.';
      setLoading(false);
    }
    // treat 0 or empty as invalid quantity
    if (formData.quantity === null || formData.quantity === undefined || Number(formData.quantity) <= 0) {
      errors.quantity = 'Quantity must be greater than 0.';
      setLoading(false);
    }
    if (!formData.storageId) {
      errors.storageId = 'Please select a storage location.';
      setLoading(false);
    }
    if (!formData.units) {
      errors.units = 'Please select a unit.';
      setLoading(false);
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const res = await fetch('/api/kitchen/stocks', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
      });

      // If API returned non-2xx, try to parse the JSON error body
      if (!res.ok) {
        let apiError: any = null;
        try {
          apiError = await res.json();
        } catch (parseError) {
          // ignore json parse errors
        }

        const apiMessage = apiError?.error || apiError?.message || res.statusText || 'Unknown error from server';

        // Map known API messages/status to field-level messages where possible
        if (typeof apiMessage === 'string') {
          if (apiMessage.includes('Missing required fields')) {
            const missing: Record<string, string> = {};
            if (!formData.name) missing.name = 'Please enter an item name';
            if (!formData.quantity) missing.quantity = 'Please enter a quantity';
            if (!formData.storageId) missing.storageId = 'Please select a storage location';
            if (!formData.units) missing.units = 'Please select a unit';
            setFieldErrors(missing);
          } else if (apiMessage.includes('Storage with ID')) {
            setFieldErrors({ storageId: 'Selected storage location no longer exists. Please refresh and try again' });
          } else if (apiMessage.includes('Meat') || apiMessage.includes('Dairy') || apiMessage.includes('Frozen') || apiMessage.includes('Produce')) {
            // category/storage mismatch -> show under storage
            setFieldErrors({ storageId: apiMessage });
          } else if (res.status === 409) {
            setFieldErrors({ name: 'An item with that name may already exist.' });
          } else if (res.status === 500) {
            // Show friendly message using the item name and selected storage name
            const storageObj = storages?.find((s) => s.id === Number(formData.storageId));
            const storageName = storageObj?.name || `storage ${formData.storageId}`;
            const itemName = formData.name || 'Item';
            setError(`${itemName} is already in ${storageName}`);
          } else if (res.status === 400) {
            setError('Bad request. Please check the values and try again.');
          } else if (res.status === 401) {
            setError(apiMessage || 'Unauthorized for this storage type.');
          } else if (res.status === 404) {
            setError(apiMessage || 'Not found.');
          } else {
            setError(apiMessage);
          }
        } else {
          setError('Unexpected error from server.');
        }

        setLoading(false);
        return;
      }

      onAddItem({
        ...formData,
      });
      setFormData({
        name: '',
        quantity: 0,
        status: Status.GOOD,
        storageId: storages && storages.length > 0 ? storages[0].id : 1,
        units: Unit.OUNCE,
      });
      setError(null);
      setFieldErrors({});
      handleClose();
    } catch (err) {
      // network errors or unexpected exceptions
      const message = (err as Error)?.message || 'Network error. Please try again.';
      setError(message);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'storageId' || field === 'quantity') {
      setFormData((prev) => ({ ...prev, [field]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const statusColorMap: Record<string, string> = {
    GOOD: 'bg-green-100 text-green-700',
    LOW_STOCK: 'bg-yellow-100 text-yellow-700',
    OUT_OF_STOCK: 'bg-red-100 text-red-700',
    EXPIRED: 'bg-red-100 text-red-700',
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      // backdrop="static"
      // keyboard={false}
      centered
      contentClassName="custom-modal"
    >
      <Modal.Header
        style={{ borderBottom: 'none', paddingBottom: '0px' }}
        closeButton
      />
      <Modal.Body
        className="text-center"
        style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingTop: '0px' }}
      >
        <h5 className="text-center mt-4">
          <strong>Add New Item!</strong>
        </h5>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <Form onSubmit={handleSubmit}>
          {/* Storage Location Name */}
          <Form.Group className="mb-3" controlId="storageName">
            <Form.Select
              className="text-center no-arrow"
              value={formData.storageId}
              onChange={(e) => handleChange('storageId', e.target.value)}
              required
              isInvalid={!!fieldErrors.storageId}
            >
              {storages?.map((storage) => (
                <option key={storage.id} value={storage.id}>
                  {storage.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {fieldErrors.storageId}
            </Form.Control.Feedback>
          </Form.Group>
          {/* Item Name */}
          <Form.Group className="mb-3" controlId="itemName">
            <Form.Control
              className="text-center"
              type="text"
              placeholder="Item Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              isInvalid={!!fieldErrors.name}
            />
            <Form.Control.Feedback type="invalid">
              {fieldErrors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col>
              {/* Item Quantity */}
              <Form.Group className="mb-3" controlId="itemQuantity">
                <Form.Control
                  className="text-center"
                  type="number"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  min="0"
                  required
                  isInvalid={!!fieldErrors.quantity}
                />
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.quantity}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              {/* Item unit */}
              <Form.Group controlId="itemUnits">
                <Form.Select
                  className="text-center no-arrow"
                  value={formData.units}
                  onChange={(e) => handleChange('units', e.target.value)}
                  isInvalid={!!fieldErrors.units}
                >
                  {Object.entries(LocalUnit).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.units}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          {/* Item status */}
          <Form.Group className="mb-3" controlId="itemStatus">
            <div
              className={`rounded-md overflow-hidden border border-gray-300 ${statusColorMap[formData.status]}`}
            >
              <Form.Select
                className="text-center bg-transparent border-0 focus:ring-0 focus:outline-none shadow-none no-arrow"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {Object.entries(LocalStatus).map(([key, value]) => (
                  <option key={key} value={key} className={`${statusColorMap[formData.status]}`}>
                    {value}
                  </option>
                ))}
              </Form.Select>
            </div>
          </Form.Group>
          <Button className="mb-2" variant="success" type="submit">
            {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            {loading ? ' Adding...' : 'Add Item'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddItemModal;
