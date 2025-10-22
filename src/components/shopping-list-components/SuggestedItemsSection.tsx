import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import SuggestedItemCard from './SuggestedItemCard';

interface SuggestedItem {
  ingredientId: number;
  name: string;
  unit: string;
  status: string;
  storageId: number;
  storageName: string;
  price: number;
  storageType: string;
  houseName: string;
  suggestedPriority: string;
  currentQuantity: number;
  category: string;
}

interface SuggestedItemsSectionProps {
  suggestions: SuggestedItem[];
  onAdd: (item: SuggestedItem, category: string, quantity: string) => void;
}

const SuggestedItemsSection: React.FC<SuggestedItemsSectionProps> = ({
  suggestions,
  onAdd,
}) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-sm border-0" style={{ borderRadius: '1rem' }}>
      <Card.Header
        className="fs-5 fw-bold text-white"
        style={{ backgroundColor: '#3A5B4F', borderRadius: '1rem 1rem 0 0' }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Suggested Items ({suggestions.length})</h5>
            <small className="text-white-50">Low stock items from your inventory</small>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <Row className="g-3">
          {suggestions.map((item) => (
            <Col key={item.ingredientId} md={6} lg={4}>
              <SuggestedItemCard item={item} onAdd={onAdd} />
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default SuggestedItemsSection;
