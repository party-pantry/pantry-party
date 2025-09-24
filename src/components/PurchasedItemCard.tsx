import React from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { ShoppingItem } from '../utils/shoppingListUtils';

interface PurchasedItemCardProps {
  item: ShoppingItem;
  onTogglePurchased: (id: number) => void;
  onRemove: (id: number) => void;
}

const PurchasedItemCard: React.FC<PurchasedItemCardProps> = ({
  item,
  onTogglePurchased,
  onRemove,
}) => (
  <Card className="border">
    <Card.Body className="p-2">
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <Form.Check
            type="checkbox"
            checked={item.purchased}
            onChange={() => onTogglePurchased(item.id)}
            className="me-2"
          />
          <div className="text-decoration-line-through opacity-75">
            <div className="fw-bold text-dark">{item.name}</div>
            <small className="text-dark">{item.quantity}</small>
          </div>
        </div>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => onRemove(item.id)}
          style={{ width: '28px', height: '28px' }}
        >
          ×
        </Button>
      </div>
    </Card.Body>
  </Card>
);

export default PurchasedItemCard;
