import React, { useState } from 'react';
import { DropdownButton, Form, Button } from 'react-bootstrap';

const KitchenFilterButton: React.FC = () => {
    const [value, setValue] = useState("");
    const [quantity, setQuantity] = useState(50);

    return (
        <DropdownButton title="Filter" variant="success" style={{ width: "125px" }} align="end">
            <Form style={{ width: "250px"}}>
                <Form.Group className="m-3">
                    <Form.Control
                        placeholder="Search..."
                        className="mx-auto mb-3"
                        style={{ width: "90%" }}
                    />
                    <Form.Label>Quantity: {quantity}</Form.Label>
                    <Form.Range
                        min={0}
                        max={100}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                    <Form.Text>
                        Status
                    </Form.Text>
                    <Form.Check
                        type="checkbox"
                        label="Good"
                    />
                    <Form.Check
                        type="checkbox"
                        label="Low Stock"
                    />
                    <Form.Check
                        type="checkbox"
                        label="Out of Stock"
                    />
                    <Form.Check
                        type="checkbox"
                        label="Expired"
                    />
                    <div className="mt-3" style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}>
                        <Button variant="danger" style={{ width: "100px"}}>Reset</Button>
                        <Button variant="primary" style={{ width: "100px"}}>Apply</Button>
                    </div>
                </Form.Group>
            </Form>
        </DropdownButton>
    )
}

export default KitchenFilterButton;