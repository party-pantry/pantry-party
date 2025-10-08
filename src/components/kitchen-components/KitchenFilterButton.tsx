import React, { useState } from 'react';
import { DropdownButton, Form, Button } from 'react-bootstrap';
import { Search, Filter } from 'lucide-react';

const statusOptions = ['Good', 'Low Stock', 'Out of Stock', 'Expired'];

interface KitchenFilterButtonProps {
  onApply?: (filters: { search: string; quantity: number; status: string[] }) => void;
}

const KitchenFilterButton: React.FC<KitchenFilterButtonProps> = ({ onApply }) => {
  const [quantity, setQuantity] = useState(1000);
  const [search, setSearch] = useState('');
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
    setSearch('');
    setQuantity(25);
    setStatus([]);
    if (onApply) onApply({ search: '', quantity: 1000, status: [] });
  };

  const handleApply = () => {
    if (onApply) onApply({ search, quantity, status });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '20px',
        marginRight: '120px',
        paddingTop: '20px',
        marginTop: '10px',
        marginBottom: '-58px',
        marginLeft: '20px',
      }}
    >
      <div className="d-flex align-items-center gap-2">
        <div className="position-relative" style={{ maxWidth: '250px' }}>
          <Search
            size={18}
            className="position-absolute top-50 translate-middle-y ms-2 text-muted"
          />
          <Form.Control
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApply();
              }
            }}
            style={{ paddingLeft: '2rem' }}
          />
        </div>
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
        >
          <div style={{
            paddingLeft: '30px',
            paddingRight: '30px',
            paddingBottom: '15px',
          }}>
            <Form.Label className="d-block mt-2 mb-1">Quantity {'<='} {quantity}</Form.Label>
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
            <div className="mt-3 d-flex justify-content-between" style={{ gap: '10px' }}>
              <Button variant="danger" onClick={handleReset}>
                Reset
              </Button>
              <Button variant="primary" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </DropdownButton>
      </div>
    </div>
  );
};

export default KitchenFilterButton;
