/* eslint-disable max-len */
/* eslint-disable no-tabs */
/* eslint-disable react/prop-types */

'use client';

import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { addItem } from '@/lib/dbFunctions';
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
  storages: {
    id: number;
    name: string;
  }[] | null;

}

const AddItemModal: React.FC<Props> = ({ show, onHide, onAddItem, storages }) => {
  const [formData, setFormData] = useState({
    name: '',
    // image: '',
    quantity: 0,
    status: Status.GOOD,
    storageId: storages && storages.length > 0 ? storages[0].id : 0,
    units: Unit.OUNCE,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.quantity) {
      onAddItem({
        ...formData,
      });
      setFormData({ name: '', quantity: 0, status: Status.GOOD, storageId: storages && storages.length > 0 ? storages[0].id : 0, units: Unit.OUNCE });
      addItem(formData);
      onHide();
    }
  };

  const handleChange = (field: string, value: string) => {
    // Convert storageId to number
    if (field === 'storageId') {
      setFormData((prev) => ({ ...prev, [field]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
		// backdrop="static"
		// keyboard={false}
      centered
      contentClassName="custom-modal"
    >
      <Modal.Header style={{ borderBottom: 'none', paddingBottom: '0px' }} closeButton />
      <Modal.Body className="text-center" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <h5 className="text-center"><strong>Add New Item!</strong></h5>
        <Form onSubmit={handleSubmit}>
          {/* Storage Location Name */}
          <Form.Group className="mb-3" controlId="storageName">
            <Form.Select
              className="text-center"
              value={formData.storageId}
              onChange={(e) => handleChange('storageId', e.target.value)}
              required
            >
              {storages?.map((storage) => (
                <option key={storage.id} value={storage.id}>{storage.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
          {/* Item Name */}
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
                />
              </Form.Group>
            </Col>
            <Col>
              {/* Item unit */}
              <Form.Group controlId="itemUnits">
                <Form.Select
                  className="text-center"
                  value={formData.units}
                  onChange={(e) => handleChange('units', e.target.value)}
                >
                  <option value="Ounce">Ounce</option>
                  <option value="Pound">Pound</option>
                  <option value="Gram">Gram</option>
                  <option value="Kilogram">Kilogram</option>
                  <option value="Milliliter">Milliliter</option>
                  <option value="Liter">Liter</option>
                  <option value="Fluid ounce">Fluid Ounce</option>
                  <option value="Cup">Cup</option>
                  <option value="Pint">Pint</option>
                  <option value="Quart">Quart</option>
                  <option value="Gallon">Gallon</option>
                  <option value="Teaspoon">Teaspoon</option>
                  <option value="Tablespoon">Tablespoon</option>
                  <option value="Bag">Bag</option>
                  <option value="Can">Can</option>
                  <option value="Bottle">Bottle</option>
                  <option value="Box">Box</option>
                  <option value="Piece">Piece</option>
                  <option value="Sack">Sack</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          {/* Item status */}
          <Form.Group className="mb-3" controlId="itemStatus">
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
          <Button className="mb-2" variant="success" type="submit">
            Add Item
          </Button>

        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddItemModal;
