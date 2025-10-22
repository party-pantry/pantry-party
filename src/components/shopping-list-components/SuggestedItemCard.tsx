import React, { useState } from 'react';
import { Card, CardBody, Badge, Button, Form, Modal, Row, Col } from 'react-bootstrap';

interface SuggestedItem {
  ingredientId: number;
  name: string;
  unit: string;
  status: string;
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
      <Card className="h-100">
        <CardBody>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <Badge bg={statusBadgeVariant} className="px-3 py-2" style={{ borderRadius: '1rem' }}>
              {item.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Low Stock'}
            </Badge>
            <Badge bg={item.suggestedPriority === 'High' ? 'danger' : 'warning'} className="px-3 py-2" style={{ borderRadius: '1rem' }}>
              {item.suggestedPriority}
            </Badge>
          </div>
          
          <div className="mb-3">
            <h6 className="fw-bold text-dark mb-2">{item.name}</h6>
            <p className="text-muted small mb-0">
              From: {item.storageName} ({item.houseName})
            </p>
          </div>

          <div className="d-flex justify-content-center">
            <Button 
              variant="success" 
              size="sm" 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 fw-semibold"
              style={{ backgroundColor: '#3A5B4F', borderColor: '#3A5B4F', borderRadius: '0.5rem' }}
            >
              Add to List
            </Button>
          </div>
        </CardBody>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Add {item.name} to Shopping List</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Row className="g-3">
            <Col md={6}>
              <Form.Label className="fw-bold text-dark">Quantity</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., 2 lbs"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border-2"
              />
            </Col>
            <Col md={6}>
              <Form.Label className="fw-bold text-dark">Category</Form.Label>
              <Form.Select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="border-2"
              >
                <option value="Produce">Produce</option>
                <option value="Meat">Meat</option>
                <option value="Dairy">Dairy</option>
                <option value="Frozen">Frozen</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-0 p-4">
          <Button variant="outline-secondary" onClick={() => setShowModal(false)} className="px-4">
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleAdd}
            className="px-4 fw-semibold"
            style={{ backgroundColor: '#3A5B4F', borderColor: '#3A5B4F' }}
          >
            Add to Shopping List
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SuggestedItemCard;
