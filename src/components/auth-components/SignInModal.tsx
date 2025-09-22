'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Modal, Form, Button, InputGroup } from 'react-bootstrap';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';


interface Props {
    show: boolean;
    onHide: () => void;
}

const SignInModal: React.FC<Props> = ({ show, onHide }) => {
    const router = useRouter();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await signIn("credentials", {
            identifier,
            password,
            callbackUrl: '/my-kitchen',
            redirect: false,
        });

        if (result?.error){
            setError("Invalid username or password");
        } else {
            setError('');
            onHide();
            router.push('/my-kitchen');
        }

    }

    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <>
            <Modal show={show} onHide={onHide} centered>
                <Modal.Header style={{ borderBottom: "none", paddingBottom: "0px" }} closeButton />
                <Modal.Body className="text-center">
                    <h5 className="text-center mb-4"><strong>Welcome Back to the Party!</strong></h5>
                    <Form onSubmit={handleSubmit}>

                        {/* Username or Email */}
                        <InputGroup className="mt-4 mb-3 custom-input-group pl-10 pr-10" >
                            <InputGroup.Text className="custom-input-group-text">
                                <FaUser />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Username or Email"
                                value={identifier} 
                                type="text"
                                onChange={(e) => setIdentifier(e.target.value)}
                                isInvalid={!!error}
                            />
                        </InputGroup>

                        {/* Password */}
                        <InputGroup className="mb-7 custom-input-group pl-10 pr-10">
                            <InputGroup.Text className="custom-input-group-text">
                                <FaLock />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Password"
                                type={passwordVisible ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                isInvalid={!!error}
                            />
                            <InputGroup.Text 
                                className="custom-input-group-text toggle-icon" 
                                onClick={togglePasswordVisibility}
                            >
                                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                            </InputGroup.Text>

                            {/* Error message */}
                            <Form.Control.Feedback type="invalid" style={{ textAlign: "left" }}>
                                {error}
                            </Form.Control.Feedback>
                        </InputGroup>


                        {/* Sign in button */}
                        <Button variant="dark" type="submit"><strong>Sign in</strong></Button>
                        { /* error message */ }
                        {/* {error && <p className="text-red-500 text-sm">{error}</p>} */}
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default SignInModal;