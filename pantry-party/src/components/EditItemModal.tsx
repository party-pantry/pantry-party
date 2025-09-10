"use client";

import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";

interface Item {
  id: number;
  name: string;
  image: string;
  quantity: string;
  updated: string;
  status: "Good" | "Low Stock" | "Out of Stock" | "Expired";
}

interface Props {
  show: boolean;
  onHide: () => void;
  itemToEdit: Item | null;
  onUpdateItem: (item: Item) => void;
}

const EditItemModal: React.FC<Props> = ({ show, onHide, itemToEdit, onUpdateItem }) => {
  const [formData, setFormData] = useState<Item | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setFormData(itemToEdit);
    }
  }, [itemToEdit]);

  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.quantity) {
      onUpdateItem({
        ...formData,
        updated: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      });
    }
  };

  const handleChange = (field: keyof Item, value: string) => {
    // if previous state exists, copy existing fields and overwrite changed field, else null
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
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
        style={{ borderBottom: "none", paddingBottom: "0px" }}
        closeButton
      />
      <Modal.Body className="text-center">
        <h4>Edit Item</h4>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="itemName">
            <Form.Control
              className="text-center"
              type="text"
              placeholder="Item Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
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
                  onChange={(e) => handleChange("quantity", e.target.value)}
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
                  onChange={(e) => handleChange("status", e.target.value)}
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
            Save Changes
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditItemModal;
