import React from 'react';
import { Card, CardBody, Badge, Button, Form } from 'react-bootstrap';

import {
  ShoppingItem,
  getCategoryVariant,
  getPriorityVariant,
} from '../../../utils/shoppingListUtils';

interface ShoppingItemCardProps {
  item: ShoppingItem;
  onRemove: (id: number) => void;
  // new props for multi-select
  selectable?: boolean;
  selected?: boolean;
  onSelectToggle?: (id: number) => void;
  onMarkBought?: (id: number) => void;
}

const ShoppingItemCard: React.FC<ShoppingItemCardProps> = ({
  item,
  onRemove,
  selectable = true,
  selected = false,
  onSelectToggle,
  onMarkBought,
}) => (
  <Card className="shopping-item-card h-100">
    <CardBody>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <Badge bg="" className={`${getCategoryVariant(item.category)} px-3 py-2`} style={{ borderRadius: '1rem' }}>
            {item.category}
          </Badge>
          <Badge bg={getPriorityVariant(item.priority)} className="px-3 py-2" style={{ borderRadius: '1rem' }}>
            {item.priority}
          </Badge>
        </div>
        {selectable && (
          <Form.Check
            type="checkbox"
            checked={selected}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              e.stopPropagation();
              e.preventDefault();
              if (onSelectToggle) {
                onSelectToggle(item.id);
              }
            }}
            style={{ transform: 'scale(1.3)' }}
            className="custom-checkbox"
          />
        )}
      </div>

      <div className="d-flex align-items-center mb-4 pb-4 pt-1">
        <h3 className="fw-bold text-dark mb-0 me-3 ps-1">{item.name}</h3>
        <p className="text-muted fw-medium mb-0">({item.quantity})</p>
      </div>

      <div className="d-flex flex-wrap justify-content-around text-center py-4 border-top border-bottom mt-4 mb-4">
        {[
          { label: 'Price', value: item.price ? `$${item.price.toFixed(2)}` : 'No Price' },
          { label: 'Status', value: item.purchased ? 'Purchased' : 'Pending' },
        ].map((stat) => (
          <div key={stat.label} className="flex-fill">
            <div className={`fw-bold fs-5 ${stat.label === 'Price' && item.price ? 'text-success' : 'text-muted'}`}>
              {stat.value}
            </div>
            <div className="text-muted small">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-center gap-2 pt-2">
        {/* Mark as Bought button (per-item) */}
        <Button
          variant="outline-success"
          size="sm"
          onClick={() => onMarkBought && onMarkBought(item.id)}
          className="px-3 py-2 fw-semibold"
          style={{ borderRadius: '0.5rem' }}
          disabled={item.purchased}
        >
          Mark as Bought
        </Button>

        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="px-4 py-2 fw-semibold"
          style={{ borderRadius: '0.5rem' }}
        >
          Remove Item
        </Button>
      </div>
    </CardBody>
  </Card>
);

export default ShoppingItemCard;
