/* eslint-disable react/prop-types */

'use client';

import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { useState } from 'react';

interface Props {
  show: boolean;
  onHide: () => void;
  onAddPantry: (pantry: { name: string; type: string }) => void;
}

const AddPantryModal: React.FC<Props> = ({ show, onHide, onAddPantry }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.type) {
      onAddPantry({ ...formData });
      setFormData({ name: '', type: '' });
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
        <h4>Add New Pantry</h4>
        <Form autoComplete="off" onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="storageName">
            <Form.Control
              className="text-center"
              placeholder="Storage Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </Form.Group>

          <Row className="mb-3">
            <Col>
              <Form.Group controlId="storageType">
                <Form.Control
                  className="text-center"
                  placeholder="Storage Type"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Button variant="success" type="submit">
            Add Pantry
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddPantryModal;
