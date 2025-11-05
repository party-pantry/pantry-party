import React, { useState } from 'react';
import { DropdownButton, Form, Button } from 'react-bootstrap';
import { Filter } from 'lucide-react';

const statusOptions = ['Good', 'Low Stock', 'Out of Stock', 'Expired'];

interface KitchenFilterButtonProps {
  onApply?: (filters: { search: string; quantity: number; status: string[] }) => void;
}

const KitchenFilterButton: React.FC<KitchenFilterButtonProps> = ({ onApply }) => {
  const [quantity, setQuantity] = useState(1000);
  const [status, setStatus] = useState<string[]>([]);

  const handleStatusChange = (option: string) => {
    setStatus((prev) => {
      if (prev.includes(option)) {
        return prev.filter((s) => s !== option);
      }
      return [...prev, option];
    });
  };

  const handleReset = () => {
    setQuantity(25);
    setStatus([]);
    if (onApply) onApply({ search: '', quantity: 1000, status: [] });
  };

  const handleApply = () => {
    if (onApply) onApply({ search: '', quantity, status });
  };

  return (
        <DropdownButton
          id="kitchen-filter-dropdown"
          title={
            <div className="d-flex align-items-center gap-1">
              <Filter size={18} />
              <span>Filter</span>
            </div>
          }
          variant="outline-dark"
          align="end"
          drop="down"
          flip={false}
          style={{ height: '38px' }}
          className="d-flex align-items-center"
        >
          <div className="px-3 pb-3 pt-2" style={{ minWidth: '250px' }}>
            <Form.Label className="d-block mb-1">Quantity {'<='} {quantity}</Form.Label>
            <Form.Range
              min={0}
              max={50}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mb-2"
            />
            <Form.Text className="d-block mb-1">Status</Form.Text>
            {statusOptions.map((option) => (
              <Form.Check
                key={option}
                type="checkbox"
                label={option}
                name="status"
                onChange={() => handleStatusChange(option)}
                checked={status.includes(option)}
                className="mb-1"
              />
            ))}
            <div className="mt-3 d-flex gap-2">
              <Button variant="outline-secondary" size="sm" onClick={handleReset} className="flex-fill">
                Reset
              </Button>
              <Button variant="success" size="sm" onClick={handleApply} className="flex-fill">
                Apply
              </Button>
            </div>
          </div>
        </DropdownButton>
  );
};

export default KitchenFilterButton;
