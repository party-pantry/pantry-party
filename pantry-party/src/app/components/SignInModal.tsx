'use client';

import { Modal, Form, Button } from 'react-bootstrap';

interface Props {
    show: boolean;
    onHide: () => void;
}

const SignInModal: React.FC<Props> = ({ show, onHide }) => {
    return (
        <>
            <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered contentClassName="custom-modal">
                <Modal.Header style={{ borderBottom: "none", paddingBottom: "0px" }} closeButton />
                <Modal.Body className="text-center">
                    <h4>Welcome Back To The Party!</h4>
                    <Form>
                        <Form.Group className="mb-3" controlId="identifier">
                            <Form.Control className="text-center" type="text" placeholder="Username/Email" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Control className="text-center" type="password" placeholder="Password" />
                        </Form.Group>
                        <Button variant="primary" type="submit">Sign In</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default SignInModal;