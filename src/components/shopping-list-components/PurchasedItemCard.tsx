import React from 'react';
import { Card, CardBody, Button, Form } from 'react-bootstrap';
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
  <Card className="purchased-item-card h-100" style={{ opacity: 0.8, backgroundColor: '#f8f9fa' }}>
    <CardBody>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Check
          type="checkbox"
          checked={item.purchased}
          onChange={() => onTogglePurchased(item.id)}
          style={{ transform: 'scale(1.3)' }}
          className="custom-checkbox"
        />
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="px-3 py-1 fw-semibold"
          style={{ borderRadius: '0.5rem' }}
        >
          Remove
        </Button>
      </div>
      <div className="mb-3">
        <h5 className="fw-bold mb-2 text-decoration-line-through text-muted">{item.name}</h5>
        <p className="text-muted mb-0 fw-medium text-decoration-line-through">{item.quantity}</p>
      </div>

      <div className="d-flex flex-wrap justify-content-around text-center py-3 border-top border-bottom mb-3">
        {[
          { label: 'Price', value: item.price ? `$${item.price.toFixed(2)}` : 'No Price' },
          { label: 'Status', value: 'Purchased' },
        ].map((stat) => (
          <div key={stat.label} className="flex-fill">
            <div className={`fw-bold fs-5 ${stat.label === 'Price' && item.price
              ? 'text-success' : 'text-muted'} text-decoration-line-through`}>
              {stat.value}
            </div>
            <div className="text-muted small">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <span className="badge bg-success px-3 py-2" style={{ borderRadius: '1rem' }}>
          ✓ Purchased
        </span>
      </div>
    </CardBody>
  </Card>
);

export default PurchasedItemCard;
