
import React, { useState } from 'react';
import { Card, Badge, Button, Form, Modal, Row, Col } from 'react-bootstrap';
import { LocalFoodCategory } from '@/lib/Units';

interface SuggestedItem {
  ingredientId: number;
  name: string;
  unit: string;
  status: string;
  price: number;
  storageId: number;
  storageName: string;
  storageType: string;
  houseName: string;
  suggestedPriority: string;
  currentQuantity: number;
  category: string;
}

interface SuggestedItemCardProps {
  item: SuggestedItem;
  onAdd: (item: SuggestedItem, category: string, quantity: string) => void;
}

const SuggestedItemCard: React.FC<SuggestedItemCardProps> = ({ item, onAdd }) => {
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState(item.category ?? 'OTHER');
  const [quantity, setQuantity] = useState('1');

  const handleAdd = () => {
    onAdd(item, category, quantity);
    setShowModal(false);
  };

  const statusBadgeVariant = item.status === 'OUT_OF_STOCK' ? 'danger' : 'warning';

  // const statusColorMap: Record<string, string> = {
  //   GOOD: 'bg-green-100 text-green-700',
  //   LOW_STOCK: 'bg-yellow-100 text-yellow-700',
  //   OUT_OF_STOCK: 'bg-red-100 text-red-700',
  //   EXPIRED: 'bg-red-100 text-red-700',
  // };

  return (
    <>
      <Card className="border">
        <Card.Body className="p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div className="fw-bold text-dark">{item.name}</div>
              <small className="text-muted">
                From: {item.storageName} ({item.houseName})
              </small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge className='me-12' bg={statusBadgeVariant}>
                {item.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Low Stock'}
              </Badge>
              {/* <Badge bg={item.suggestedPriority === 'High' ? 'danger' : 'warning'}>
                {item.suggestedPriority}
              </Badge> */}
              <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
                Add to List
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add {item.name} to Shopping List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., 2 lbs"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Category</Form.Label>
              <Form.Select value={category} onChange={(e) => setCategory(e.target.value as LocalFoodCategory)}>
                {/* {FOOD_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))} */}
                {Object.entries(LocalFoodCategory).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAdd}>
            Add to Shopping List
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SuggestedItemCard;
