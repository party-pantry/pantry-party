import React, { useState } from 'react';
import { Card, CardBody, Badge, Button, Form, Modal, Row, Col } from 'react-bootstrap';
import { getCategoryVariant } from '../../../utils/shoppingListUtils';
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

  const getFoodColorClass = (cat: string) => {
    const colorMap: Record<string, string> = {
      Dairy: 'category-dairy',
      Produce: 'category-produce',
      Frozen: 'category-frozen',
      Meat: 'category-meat',
      Other: 'category-other',
    };

    // Find matching enum value ignoring case
    const match = Object.values(LocalFoodCategory).find(
      (val) => val.toLowerCase() === cat.toLowerCase()
    );

    return match ? colorMap[match] : colorMap['Other'];
  };

  return (
    <>
      <Card className="h-100">
        <CardBody>
          <div className="d-flex justify-content-between align-items-start mb-3">
            {/* <Badge bg={item.suggestedPriority === 'High' ? 'danger' : 'warning'}
            className="px-3 py-2" style={{ borderRadius: '1rem' }}>
              {item.suggestedPriority}
            </Badge> */}
          </div>
          <div className="mb-5 align-items-stretch">
            <Row>
              <Col sm={6} className="d-flex align-items-end">
                <h6 className="fw-bold text-dark mb-1">{item.name}</h6>
              </Col>
              <Col sm={6} className="text-end">
                <Badge bg={statusBadgeVariant} className="px-3 py-2" style={{ borderRadius: '1rem' }}>
                {item.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Low Stock'}
                            </Badge>
              </Col>
            </Row>
            <p className="text-muted small mb-0">
              From: {item.storageName} ({item.houseName})
            </p>
          </div>
          <div className="d-flex justify-content-center pt-3">
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
                className="border-1"
              />
            </Col>
            <Col md={6}>
              <Form.Label className="fw-bold text-dark">Category</Form.Label>
              <div 
                className={`transition-colors duration-400 rounded-md overflow-hidden  border-gray-300 ${getFoodColorClass(category)}`}>
                <Form.Select
                  className="text-center bg-transparent border-1 focus:ring-0 focus:outline-none shadow-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LocalFoodCategory)}>
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
              </div>
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
