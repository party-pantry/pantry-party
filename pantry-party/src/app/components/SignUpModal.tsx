'use client';

import { Modal, Form, Button } from 'react-bootstrap';

interface Props {
    show: boolean;
    onHide: () => void;
}

const SignUpModal: React.FC<Props> = ({ show, onHide }) => {
    return (
        <>
            <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered contentClassName="custom-modal">
                <Modal.Header style={{ borderBottom: "none", paddingBottom: "0px" }} closeButton />
                <Modal.Body className="text-center">
                    <h4>Welcome To The Party!</h4>
                    <Form>
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Control className="text-center" type="username" placeholder="Username" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Control className="text-center" type="email" placeholder="Email" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Control className="text-center" type="password" placeholder="Password" />
                        </Form.Group>
                        <Button variant="primary" type="submit">Sign Up</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default SignUpModal;