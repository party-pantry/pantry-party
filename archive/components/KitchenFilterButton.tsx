import React, { useState } from 'react';
import { DropdownButton, Form, Button } from 'react-bootstrap';
import { Search, Filter } from 'lucide-react';

const statusOptions = ['Good', 'Low Stock', 'Out of Stock', 'Expired'];

const KitchenFilterButton: React.FC<{
  onApply?: (filters: { search: string; quantity: number; status: string[] }) => void;
}> = ({ onApply }) => {
  const [quantity, setQuantity] = useState(25);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string[]>([]);

  const handleStatusChange = (option: string) => {
    setStatus((prev) => (
      prev.includes(option)
        ? prev.filter((s) => s !== option)
        : [...prev, option]
    ));
  };

  const handleReset = () => {
    setSearch('');
    setQuantity(25);
    setStatus([]);
    if (onApply) onApply({ search: '', quantity: 25, status: [] });
  };

  const handleApply = () => {
    if (onApply) onApply({ search, quantity, status });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission reload
      handleApply(); // Trigger filtering
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '20px',
        marginRight: '120px',
        paddingTop: '5px',
        marginTop: '-10px',
      }}
    >
      <div className="d-flex align-items-center gap-2">
        {/* Search Bar */}
        <div className="position-relative" style={{ maxWidth: '250px' }}>
          <Search
            size={18}
            className="position-absolute top-50 translate-middle-y ms-2 text-muted"
          />
          <Form.Control
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown} // 👈 Handles Enter key
            style={{ paddingLeft: '2rem' }}
          />
        </div>

        {/* Filter Dropdown */}
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
          <Form.Label className="d-block mt-2 mb-1">
            Quantity {'<='} {quantity}
          </Form.Label>
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
          <div
            className="mt-3 d-flex justify-content-between"
            style={{ gap: '10px' }}
          >
            <Button variant="danger" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="primary" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </DropdownButton>
      </div>
    </div>
  );
};

export default KitchenFilterButton;
