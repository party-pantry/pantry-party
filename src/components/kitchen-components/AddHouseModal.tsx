"use client";

import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";

interface Props {
    show: boolean;
    onHide: () => void;
    onAddHouse: (house: { name: string }) => void;
}

const AddHouseModal: React.FC<Props> = ({ show, onHide, onAddHouse }) => {
    const [name, setName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        onAddHouse({ name });
        setName("");
        onHide();
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
            <h4>Add New House</h4>
            <Form autoComplete="off" onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="storageName">
                <Form.Control
                    className="text-center"
                    placeholder="House Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </Form.Group>
            <Button variant="success" type="submit">Add House</Button>
            </Form>
        </Modal.Body>
        </Modal>
    );
}

export default AddHouseModal;