'use client';

import { Modal, Form, Button } from 'react-bootstrap';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createUser } from '../lib/dbFunctions';
import { signIn } from 'next-auth/react';

interface Props {
    show: boolean;
    onHide: () => void;
}

type SignUpData = {
    username: string;
    email: string;
    password: string;
}

const SignUpModal: React.FC<Props> = ({ show, onHide }) => {
    const validationSchema = Yup.object().shape({
        username: Yup.string().required('Username is required'),
        email: Yup.string().required('Email is required').email('Invalid email format'),
        password: Yup.string().min(6).required('Password is required'),
    });

    const {
        register,
        handleSubmit,
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

    return (
        <>
            <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered contentClassName="custom-modal">
                <Modal.Header style={{ borderBottom: "none", paddingBottom: "0px" }} closeButton />
                <Modal.Body className="text-center">
                    <h4>Welcome To The Party!</h4>
                    <Form onSubmit={handleSubmit(onSubmit)} className="sign-up-form">
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Control className="text-center" type="text" placeholder="Username" {...register("username")} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Control className="text-center" type="email" placeholder="Email" {...register("email")} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Control className="text-center" type="password" placeholder="Password" {...register("password")} />
                        </Form.Group>
                        <Button variant="primary" type="submit">Sign Up</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default SignUpModal;
