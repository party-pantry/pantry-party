import React, { useState } from 'react';
import { Card, Badge, Button, Form, Modal, Row, Col } from 'react-bootstrap';

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
}

interface SuggestedItemCardProps {
  item: SuggestedItem;
  onAdd: (item: SuggestedItem, category: string, quantity: string) => void;
}

const SuggestedItemCard: React.FC<SuggestedItemCardProps> = ({ item, onAdd }) => {
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('Dairy');
  const [quantity, setQuantity] = useState('1');

  const handleAdd = () => {
    onAdd(item, category, quantity);
    setShowModal(false);
  };

  const statusBadgeVariant = item.status === 'OUT_OF_STOCK' ? 'danger' : 'warning';

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
              <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Produce">Produce</option>
                <option value="Meat">Meat</option>
                <option value="Dairy">Dairy</option>
                <option value="Frozen">Frozen</option>
                <option value="Other">Other</option>
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
