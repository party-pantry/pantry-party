"use client";

import { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";

interface Props {
    show: boolean;
    onHide: () => void;
    houses: { id: number, name: string }[];
    onAddStorage: (storage: {
        name: string;
        type: "FRIDGE" | "PANTRY" | "FREEZER" | "SPICE_RACK" | "OTHER";
    }) => void;
}

const AddStorageModal: React.FC<Props> = ({ show, onHide, houses, onAddStorage }) => {
    const [formData, setFormData] = useState({
        name: "",
        type: "FRIDGE" as "FRIDGE" | "PANTRY" | "FREEZER" | "SPICE_RACK" | "OTHER",
        houseId: 0,
    });

    useEffect(() => {
        if (houses.length > 0 && formData.houseId === 0) {
            setFormData((prev) => ({ ...prev, houseId: houses[0].id }));
        }
    }, [houses]);

    const handleChange = (field: string, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.name && formData.houseId) {
            onAddStorage(formData);
            setFormData({ name: "", type: "FRIDGE", houseId: houses[0]?.id || 0 });
            onHide();
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            backdrop="static"
            keyboard={false}
            centered
            contentClassName="custom-modal"
        >
            <Modal.Header
                style={{ borderBottom: "none", paddingBottom: "0px" }}
                closeButton
            />
        <Modal.Body className="text-center">
            <h4>Add New Storage</h4>
            <Form autoComplete="off" onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="storageName">
                <Form.Control
                    className="text-center"
                    placeholder="Storage Name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3" controlId="storageType">
                <Form.Select
                    className="text-center"
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    required
                >
                    <option value="FRIDGE">Fridge</option>
                    <option value="PANTRY">Pantry</option>
                    <option value="FREEZER">Freezer</option>
                    <option value="SPICE_RACK">Spice Rack</option>
                    <option value="OTHER">Other</option>
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                {houses.length > 0 ? (
                    <Form.Select
                        value={formData.houseId}
                        onChange={(e) => handleChange("houseId", Number(e.target.value))}
                        required
                    >
                        {houses.map((house) => (
                            <option key={house.id} value={house.id}>{house.name}</option>
                        ))}
                    </Form.Select>
                ) : (
                    <p/>
                )}
            </Form.Group>
            <Button variant="success" type="submit">Add Storage</Button>
            </Form>
        </Modal.Body>
        </Modal>
    );
}

export default AddStorageModal;