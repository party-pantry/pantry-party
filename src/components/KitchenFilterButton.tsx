import React, { useState } from 'react';
import { DropdownButton, Form, Button } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const statusOptions = ["Good", "Low Stock", "Out of Stock", "Expired"];

const KitchenFilterButton: React.FC<{ onApply?: (filters: { search: string, quantity: number, status: string[] }) => void }> = ({ onApply }) => {
    const [quantity, setQuantity] = useState(25);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string[]>([]);

    const handleStatusChange = (option: string) => {
        // If option is selected, remove it from array, else add it
        setStatus(prev =>
            prev.includes(option)
            ? prev.filter(s => s !== option)
            : [...prev, option]
        )
    }

  const handleReset = () => {
    setSearch("");
    setQuantity(25);
    setStatus([]);
    if (onApply) {
      onApply({ search: "", quantity: 25, status: [] });
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply({ search, quantity, status });
    }
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <Form.Control
        placeholder="Search..."
        value={search}
        style={{ maxWidth: "250px" }}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DropdownButton
        title={
          <>
            <i className="bi bi-filter me-2"></i>Filter
          </>
        }
        variant="outline-dark"
        align="end"
        drop="down"
        flip={false}
      >
        <Form.Label>Quantity {"<="} {quantity}</Form.Label>
        <Form.Range
          min={0}
          max={50}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <Form.Text>Status</Form.Text>
        {statusOptions.map((option) => (
          <Form.Check
            key={option}
            type="checkbox"
            label={option}
            name="status"
            onChange={() => handleStatusChange(option)}
            checked={status.includes(option)}
          />
        ))}
        <div className="mt-3 d-flex justify-content-between" style={{ gap: "10px" }}>
          <Button variant="danger" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="primary" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </DropdownButton>
    </div>
  );
};

export default KitchenFilterButton;