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
  <Card className="h-100 shadow-sm border-0 hover-shadow" style={{ transition: 'all 0.2s' }}>
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div className="d-flex gap-2">
          <Badge bg="" className={getCategoryVariant(item.category)}>{item.category}</Badge>
          <Badge bg={getPriorityVariant(item.priority)}>{item.priority}</Badge>
        </div>
        <Form.Check
          type="checkbox"
          checked={item.purchased}
          onChange={() => onTogglePurchased(item.id)}
          style={{ transform: 'scale(1.2)' }}
        />
      </div>
      <h6 className="fw-bold mb-1">{item.name}</h6>
      <p className="text-muted small mb-2">{item.quantity}</p>
      {item.price && (
        <div className="d-flex justify-content-between align-items-center">
          <span className="fw-bold text-success">${item.price.toFixed(2)}</span>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="rounded-circle"
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            ×
          </Button>
        </div>
      )}
      {!item.price && (
        <div className="text-end">
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="rounded-circle"
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            ×
          </Button>
        </div>
      )}
    </Card.Body>
  </Card>
);

export default ShoppingItemCard;
