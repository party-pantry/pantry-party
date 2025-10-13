'use client';

import { LocalStatus, LocalUnit } from '@/lib/Units';
import { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';

interface Props {
  show: boolean;
  onHide: () => void;
  item: {
    name: string;
    quantity: number;
    unit: LocalUnit;
    status: LocalStatus;
  };
  onUpdateItem: (item: { name: string; quantity: number; unit: LocalUnit; status: LocalStatus }) => void;
}

const EditItemModal: React.FC<Props> = ({ show, onHide, onUpdateItem, item }) => {
  const [formData, setFormData] = useState({
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    status: item.status,
  });
  const [errors, setErrors] = useState<string[]>([]);

  function handleClose() {
    setErrors([]);
    onHide();
  }

  function handleSave() {
    setErrors([]);

    const newErrors: string[] = [];

    const nameValue = String(formData.name ?? '').trim();
    if (!nameValue) newErrors.push('Name is required');

    const quantityValue = Number(formData.quantity);
    if (Number.isNaN(quantityValue) || quantityValue <= 0) newErrors.push('Quantity must be greater than zero');

    const statusValue = String(formData.status ?? '').trim();
    if (!statusValue) newErrors.push('Status must be selected');

    // Normalize the typed unit
    const unitValue = String(formData.unit ?? '').trim();
    const allowedUnits = Object.values(LocalUnit).map((u) => String(u));
    if (!allowedUnits.includes(unitValue)) newErrors.push('Please choose a valid unit from the list');

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // All good — clear errors and close
    onUpdateItem({
      name: nameValue,
      quantity: quantityValue,
      unit: unitValue as LocalUnit,
      status: statusValue as LocalStatus,
    });

    handleClose();
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={true}
      centered
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
               onChange={(e) => {
                 setFormData({ ...formData, name: e.target.value });
                 setErrors([]);
               }}
              />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formItemQuantity">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => {
                    setFormData({ ...formData, quantity: Number(e.target.value) });
                    setErrors([]);
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId="formItemUnit">
                <Form.Label>Unit</Form.Label>
                {/* editable dropdown using datalist: user can type or pick from suggestions */}
                <Form.Control
                  type="text"
                  list="unit-list"
                  value={formData.unit}
                  onChange={(e) => {
                    setFormData({ ...formData, unit: e.target.value as LocalUnit });
                    setErrors([]);
                  }}
                />
                <datalist id="unit-list">
                  {Object.values(LocalUnit).map((unit) => (
                    <option key={unit} value={unit} />
                  ))}
                </datalist>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group controlId="formItemStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={(e) => {
                    setFormData({ ...formData, status: e.target.value as LocalStatus });
                    setErrors([]);
                  }}
                >
                  <option value="">Select Status</option>
                  {Object.values(LocalStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Form.Select>
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
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditItemModal;
