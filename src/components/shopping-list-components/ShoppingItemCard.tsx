import React from 'react';
import { Card, Badge, Button, Form } from 'react-bootstrap';
import {
  ShoppingItem,
  getCategoryVariant,
  getPriorityVariant,
} from '../../utils/shoppingListUtils';

interface ShoppingItemCardProps {
  item: ShoppingItem;
  onTogglePurchased: (id: number) => void;
  onRemove: (id: number) => void;
}

const ShoppingItemCard: React.FC<ShoppingItemCardProps> = ({
  item,
  onTogglePurchased,
  onRemove,
}) => (
  <Card className="border">
    <Card.Body className="p-3">
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <Form.Check
            type="checkbox"
            checked={item.purchased}
            onChange={() => onTogglePurchased(item.id)}
            className="me-3"
          />
          <div>
            <div className="fw-bold text-dark">{item.name}</div>
            <small className="text-dark">{item.quantity}</small>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Badge bg={getCategoryVariant(item.category)}>{item.category}</Badge>
          <Badge bg={getPriorityVariant(item.priority)}>{item.priority}</Badge>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onRemove(item.id)}
            style={{ width: '32px', height: '32px' }}
          >
            ×
          </Button>
        </div>
      </div>
    </Card.Body>
  </Card>
);

export default ShoppingItemCard;
