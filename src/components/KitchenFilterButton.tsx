import React, { useState } from 'react';
import { DropdownButton, Form, Button } from 'react-bootstrap';

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
    }

    const handleApply = () => {
        if (onApply) {
            onApply({ search, quantity, status });
        }
    }

    return (
        <DropdownButton title={<strong>Filter</strong>} variant="outline-dark" 
            style={{ width: "125px" }} align="end" drop='down' flip={false}
        >
            <Form style={{ width: "250px"}} onSubmit={(e) => { e.preventDefault(); handleApply(); }}>
                <Form.Group className="m-3">
                    <Form.Control
                        placeholder="Search..."
                        className="mx-auto mb-3"
                        value={search}
                        style={{ width: "90%" }}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Form.Label>Quantity {'<='} {quantity}</Form.Label>
                    <Form.Range
                        min={0}
                        max={50}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                    <Form.Text> Status </Form.Text>
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
                    <div className="mt-3" style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}>
                        <Button 
                            variant="danger"
                            style={{ width: "100px"}}
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                        <Button 
                            variant="primary" 
                            style={{ width: "100px"}} 
                            onClick={handleApply}
                        >
                            Apply
                        </Button>
                    </div>
                </Form.Group>
            </Form>
        </DropdownButton>
    )
}

export default KitchenFilterButton;