'use client';

import { useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createUser } from '../lib/dbFunctions';
import { signIn } from 'next-auth/react';
// Component imports
import { Modal, Form, Button, InputGroup } from 'react-bootstrap';
// Icon imports
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

interface Props {
    show: boolean;
    onHide: () => void;
}

type SignUpData = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const SignUpModal: React.FC<Props> = ({ show, onHide }) => {
    const validationSchema = Yup.object().shape({
        username: Yup.string().required('Username is required'),
        email: Yup.string().required('Email is required').email('Email is invalid'),
        password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
        confirmPassword: Yup.string().required('Confirm Password is required').oneOf([Yup.ref('password'), ''], 'Password does not match'),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpData>({
        resolver: yupResolver(validationSchema),
    });

    const onSubmit = async (data: SignUpData) => {
        await createUser(data);
        // Use email as identifier for immediate sign-in after registration
        await signIn('credentials', {
            identifier: data.email,
            password: data.password,
            callbackUrl: '/my-kitchen',
            redirect: true,
        });
    };

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const togglePasswordConfirmVisibility = () => {
        setPasswordConfirmVisible(!passwordConfirmVisible)
    }

    return (
            <Modal show={show} onHide={onHide} centered>
                <Modal.Header style={{ borderBottom: "none", paddingBottom: "0px" }} closeButton />
                <Modal.Body className="text-center">
                    <h5 className="text-center mb-4"><strong>Join the Party!</strong></h5>
                    <Form onSubmit={handleSubmit(onSubmit)} className="sign-up-form">

                        {/* Username */}
                        <InputGroup className="mt-4 mb-3 custom-input-group pl-10 pr-10" >
                            <InputGroup.Text className="custom-input-group-text">
                                <FaUser />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Username"
                                // className="custom-input-control"
                                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                type="text"
                                {...register('username')}
                            />
                            <div className="invalid-feedback">{errors.username?.message}</div>
                        </InputGroup>

                        {/* Email */}
                        <InputGroup className="mb-3 custom-input-group pl-10 pr-10">
                            <InputGroup.Text className="custom-input-group-text">
                                <FaEnvelope />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Email"
                                // className="custom-input-control"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                type="email"
                                {...register('email')}
                            />
                            <div className="invalid-feedback">{errors.email?.message}</div>
                        </InputGroup>

                        {/* Password */}
                        <InputGroup className="mb-3 custom-input-group pl-10 pr-10">
                            <InputGroup.Text className="custom-input-group-text">
                                <FaLock />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Password"
                                // className="custom-input-control"
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                type={passwordVisible ? 'text' : 'password'}
                                {...register('password')}
                            />
                            <InputGroup.Text 
                                className="custom-input-group-text toggle-icon" 
                                onClick={togglePasswordVisibility}
                            >
                                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                            </InputGroup.Text>
                            <div className="invalid-feedback">{errors.password?.message}</div>
                        </InputGroup>

                        {/* Confirm Password */}
                        <InputGroup className="mb-7 custom-input-group pl-10 pr-10">
                            <InputGroup.Text className="custom-input-group-text">
                                <FaLock />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Confirm Password"
                                // className="custom-input-control"
                                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                type={passwordConfirmVisible ? 'text' : 'password'}
                                {...register('confirmPassword')}
                            />
                            <InputGroup.Text 
                                className="custom-input-group-text toggle-icon" 
                                onClick={togglePasswordConfirmVisibility}
                            >
                                {passwordConfirmVisible ? <FaEyeSlash /> : <FaEye />}
                            </InputGroup.Text>
                            <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
                        </InputGroup>

                        {/* Sign Up Button */}
                        <Button variant="dark" type="submit"><strong>Create My Account</strong></Button>
                    </Form>
                </Modal.Body>
            </Modal>
    );
};

export default SignUpModal;
