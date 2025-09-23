/* eslint-disable react/prop-types */

'use client';

import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { useState } from 'react';

interface Props {
  show: boolean;
  onHide: () => void;
  onAddItem: (item: {
    name: string;
    image: string;
    quantity: string;
    status: 'Good' | 'Low Stock' | 'Out of Stock' | 'Expired';
    category: 'fridge' | 'pantry' | 'freezer' | 'spice rack' | 'other';
  }) => void;
}

const AddItemModal: React.FC<Props> = ({ show, onHide, onAddItem }) => {
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    quantity: '',
    status: 'Good' as const,
    category: 'fridge' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.quantity) {
      onAddItem({
        ...formData,
        image: formData.image || '🍽️',
      });
      setFormData({ name: '', image: '', quantity: '', status: 'Good', category: 'fridge' });
      onHide();
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      centered
      contentClassName="custom-modal"
    >
      <Modal.Header
        style={{ borderBottom: 'none', paddingBottom: '0px' }}
        closeButton
      />
      <Modal.Body className="text-center">
        <h4>Add New Item</h4>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="itemName">
            <Form.Control
              className="text-center"
              type="text"
              placeholder="Item Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </Form.Group>

          <Row className="mb-3">
            <Col>
              <Form.Group controlId="itemQuantity">
                <Form.Control
                  className="text-center"
                  type="number"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  min="0"
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="itemStatus">
                <Form.Select
                  className="text-center"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="Good">Good</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Expired">Expired</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Button variant="success" type="submit">
            Add Item
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddItemModal;
