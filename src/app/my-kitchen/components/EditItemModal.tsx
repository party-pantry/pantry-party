'use client';

import { LocalStatus, LocalUnit } from '@/lib/Units';
import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';

interface Props {
  show: boolean;
  onHide: () => void;
  onUpdateItem: (item: { name: string; quantity: number; unit: LocalUnit; status: LocalStatus }) => void;
  item?: {
    id: number;
    ingredientId: number;
    storageId: number;
    name: string;
    quantity: number;
    unit: LocalUnit;
    status: LocalStatus;
  } | null;
}

const EditItemModal: React.FC<Props> = ({ show, onHide, onUpdateItem, item }) => {
  const [formData, setFormData] = useState<{
    name: string;
    quantity: number | null;
    unit: LocalUnit;
    status: LocalStatus;
  }>({
    name: '',
    quantity: null,
    unit: '' as LocalUnit,
    status: '' as LocalStatus,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Populate form with item
  useEffect(() => {
    if (item && show) {
      setFormData({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        status: item.status,
      });
    }
  }, [item, show]);

  const handleClose = () => {
    setErrors([]);
    // Reset form data after closing
    setFormData({
      name: '',
      quantity: 0,
      unit: '' as LocalUnit,
      status: '' as LocalStatus,
    });
    onHide();
  };

  const handleSave = async () => {
    if (!item) return;

    setErrors([]);
    setLoading(true);

    // Error handling with missing form fields
    const newErrors: string[] = [];

    const nameValue = String(formData.name ?? '').trim();
    if (!nameValue) newErrors.push('Name is required');

    const quantityValue = Number(formData.quantity);
    if (formData.quantity === null || formData.quantity <= 0) {
      newErrors.push('Quantity must be greater than zero');
    }

    const statusValue = String(formData.status ?? '').trim();
    if (!statusValue) newErrors.push('Status must be selected');

    // Normalize the typed unit
    const unitValue = String(formData.unit ?? '').trim();
    const allowedUnits = Object.values(LocalUnit).map((u) => String(u));
    if (!allowedUnits.includes(unitValue)) newErrors.push('Please choose a valid unit from the list');

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/kitchen/stocks/${item.ingredientId}/${item.storageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newName: nameValue,
          quantity: quantityValue,
          unit: unitValue,
          status: statusValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      onUpdateItem({
        name: nameValue,
        quantity: quantityValue,
        unit: unitValue as LocalUnit,
        status: statusValue as LocalStatus,
      });

      handleClose();
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColorMap: Record<LocalStatus, string> = {
    [LocalStatus.GOOD]: 'bg-green-100 text-green-700',
    [LocalStatus.LOW_STOCK]: 'bg-yellow-100 text-yellow-700',
    [LocalStatus.OUT_OF_STOCK]: 'bg-red-100 text-red-700',
    [LocalStatus.EXPIRED]: 'bg-red-100 text-red-700',
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={true}
      centered
      size="lg" 
    >
      <Modal.Header closeButton>
        <Modal.Title>Edit Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={7}>
              <Form.Group controlId="formItemName">
              <Form.Label>Name</Form.Label>
              <Form.Control
               type="text"
               value={formData.name}
               placeholder={item?.name || 'Enter item name'}
               onChange={(e) => {
                 setFormData({ ...formData, name: e.target.value });
                 setErrors([]);
               }}
              />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId="formItemQuantity">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.quantity ?? ''}
                  placeholder={String(item?.quantity ?? '')}
                  onChange={(e) => {
                    const { value } = e.target;
                    setFormData({ ...formData,
                      quantity: value === '' ? null : Number(value) });
                    setErrors([]);
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formItemUnit">
                <Form.Label>Unit</Form.Label>
                {/* dropdown: user can pick from suggestions */}
                <Form.Select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value as LocalUnit })
                  }
                >
                  {Object.values(LocalUnit).map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col className="mt-3 mb-2">
              <Form.Group controlId="formItemStatus">
                <Form.Label>Status</Form.Label>
                <div 
                  className={`transition-colors duration-400 rounded-md overflow-hidden border border-gray-300 ${statusColorMap[formData.status]}`}
                >
                  {/* <Form.Select
                    value={formData.status}
                    onChange={(e) => {
                      setFormData({ ...formData, status: e.target.value as LocalStatus });
                      setErrors([]);
                    }}
                  >
                    {Object.entries(LocalStatus).map(([key, value]) => (
                      <option key={key} value={value} className={`${statusColorMap[formData.status]}`}>
                        {value}
                      </option>
                    ))}
                  </Form.Select> */}
                  <Form.Select
                    className="text-center bg-transparent border-0 focus:ring-0 focus:outline-none shadow-none"
                    value={formData.status}
                    onChange={(e) => {
                      setFormData({ ...formData, status: e.target.value as LocalStatus });
                      setErrors([]);
                    }}
                  >
                    {Object.values(LocalStatus).map((statusValue) => (
                      <option key={statusValue} value={statusValue}>
                        {statusValue}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Form.Group>
            </Col>
          </Row>
          {/* display all validation errors below the last row */}
          {errors.length > 0 && (
            <Row className="mt-3">
              <Col>
                <ul className="mb-0 text-danger">
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </Col>
            </Row>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={loading}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditItemModal;
