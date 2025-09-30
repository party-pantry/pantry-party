/* eslint-disable react/prop-types */

'use client';

import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { Category } from '@prisma/client';
import { LocalCategory } from '@/lib/Units';
import { addStorage } from '@/lib/dbFunctions';


interface Props {
  show: boolean;
  onHide: () => void;
  onAddPantry: (pantry: { name: string; type: Category }) => void;
  houseId: number;
}

const AddPantryModal: React.FC<Props> = ({ show, onHide, onAddPantry, houseId }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '' as Category,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.type) {
      try {
        await addStorage({ name: formData.name, type: formData.type, houseId });
        onAddPantry({ ...formData });
        setFormData({ name: '', type: '' as Category });
        onHide();
      } catch (error) {
        // Handle error appropriately
        console.error(error);
      }
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
          <Form.Group className="mb-3" controlId="storageType">
            <Form.Select
              className="text-center"
              value={formData.type}
              onChange={(e) => handleChange('type', Object.keys(LocalCategory).includes(e.target.value) ? e.target.value as Category : '')}
              required
            > {Object.entries(LocalCategory).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Row className="mb-3">
            <Col>
              <Form.Group controlId="storageName">
                <Form.Control
                  className="text-center"
                  placeholder="Storage Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
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
