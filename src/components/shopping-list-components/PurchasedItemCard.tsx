import React from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { ShoppingItem } from '../../utils/shoppingListUtils';

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
  <Card className="h-100 shadow-sm border-0 bg-light" style={{ opacity: 0.7 }}>
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <Form.Check
          type="checkbox"
          checked={item.purchased}
          onChange={() => onTogglePurchased(item.id)}
          style={{ transform: 'scale(1.2)' }}
        />
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="rounded-circle"
          style={{ width: '28px', height: '28px', padding: 0 }}
        >
          ×
        </Button>
      </div>
      <h6 className="fw-bold mb-1 text-decoration-line-through">{item.name}</h6>
      <p className="text-muted small mb-2 text-decoration-line-through">{item.quantity}</p>
      {item.price && (
        <span className="fw-bold text-success small">${item.price.toFixed(2)}</span>
      )}
    </Card.Body>
  </Card>
);

export default PurchasedItemCard;
