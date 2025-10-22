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
    <Row className="mb-4">
      <Col>
        <Card className="shadow-sm">
          <Card.Header className="bg-warning bg-opacity-10">
            <h5 className="mb-0">
              Suggested Items ({suggestions.length})
            </h5>
            <small className="text-muted">Low stock items from your inventory</small>
          </Card.Header>
          <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <div className="d-grid gap-3">
              {suggestions.map((item) => (
                <SuggestedItemCard key={item.ingredientId} item={item} onAdd={onAdd} />
              ))}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default SuggestedItemsSection;
