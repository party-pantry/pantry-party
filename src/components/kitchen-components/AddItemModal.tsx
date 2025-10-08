'use client';

/* eslint-disable max-len */
/* eslint-disable no-tabs */
/* eslint-disable react/prop-types */

import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
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
  const [formData, setFormData] = useState({
    name: '',
    // image: '',
    quantity: 0,
    status: Status.GOOD,
    storageId: storages && storages.length > 0 ? storages[0].id : 1,
    units: Unit.OUNCE,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.quantity) {
      try {
        await fetch('/api/kitchen/stocks', {
          method: 'POST',
          body: JSON.stringify({ ...formData }),
          headers: { 'Content-Type': 'application/json' },
        });
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
        onHide();
      // eslint-disable-next-line @typescript-eslint/no-shadow
      } catch (error) {
        let message = 'Error adding item.';
        const errMsg = (error as Error).message;
        if (errMsg.includes('Unique constraint failed')) {
          message = 'This item already exists in your pantry.';
        }
        setError(message);
      }
    }
  };

  const handleChange = (field: string, value: string) => {
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
      <Modal.Header
        style={{ borderBottom: 'none', paddingBottom: '0px' }}
        closeButton
      />
      <Modal.Body
        className="text-center"
        style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
      >
        <h5 className="text-center">
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
              className="text-center"
              value={formData.storageId}
              onChange={(e) => handleChange('storageId', e.target.value)}
              required
            >
              {storages?.map((storage) => (
                <option key={storage.id} value={storage.id}>
                  {storage.name}
                </option>
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
                  {Object.entries(LocalUnit).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
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
              {/* {Object.values(LocalStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))} */}
              {Object.entries(LocalStatus).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
              ))}
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
