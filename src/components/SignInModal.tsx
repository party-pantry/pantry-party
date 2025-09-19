'use client';

import { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { signIn } from 'next-auth/react';

interface Props {
    show: boolean;
    onHide: () => void;
}

const SignInModal: React.FC<Props> = ({ show, onHide }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await signIn("credentials", {
            identifier,
            password,
            callbackUrl: '/my-kitchen',
            redirect: true,
        });

        if (result?.error){
            setError("Invalid username or password");
        } else {
            setError('');
            onHide();
        }
    }
    return (
        <>
            <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered contentClassName="custom-modal">
                <Modal.Header style={{ borderBottom: "none", paddingBottom: "0px" }} closeButton />
                <Modal.Body className="text-center">
                    <h4>Welcome Back To The Party!</h4>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="identifier">
                            <Form.Control
                                className="text-center" 
                                type="text" 
                                placeholder="Username or Email"
                                value={identifier} 
                                onChange={(e) => setIdentifier(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Control
                                className="text-center" 
                                type="password" 
                                placeholder="Password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} />
                        </Form.Group>
                        <Button variant="primary" type="submit">Sign In</Button>
                        { /* error message */ }
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default SignInModal;