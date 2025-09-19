'use client';

import { Modal, Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { createUser } from '@/lib/dbActions';

type SignUpForm = {
	email: string;
	username: string;
	password: string;
	confirmPassword: string;
}

interface Props {
    show: boolean;
    onHide: () => void;
}

const SignUpModal: React.FC<Props> = ({ show, onHide }) => {
	// For validating form data
	const validationSchema = Yup.object().shape({
		email: Yup.string().required('Email is required').email('Email is invalid'),
		username: Yup.string().required('Username is required'),
		password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
		confirmPassword: Yup.string().required('Confirm Password is required').oneOf([Yup.ref('password'), ''], 'Confirm Password does not match'),
	});

	const {
    	register,
    	handleSubmit,
    	// reset,
    	formState: { errors },
  	} = useForm<SignUpForm>({
    	resolver: yupResolver(validationSchema),
  	});

	const onSubmit = async (data: SignUpForm) => {
    	await createUser(data);
    	// await signIn('credentials', { callbackUrl: '/profile', ...data });
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
      		<Modal.Header closeButton className="border-0 pb-0" />
			<Modal.Body className="text-center">
				<h4>Welcome To The Party!</h4>
				<Form onSubmit={handleSubmit(onSubmit)}>


					{/* Email */}
                  	<Form.Group className="mb-3 form-group">
                    	<Form.Label>Email</Form.Label>
                    	<input
                      		type="text"
                      		{...register('email')}
                      		className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    	/>
                    	<div className="invalid-feedback">{errors.email?.message}</div>
                  	</Form.Group>


					{/* Username */}
					<Form.Group className="mb-3 form-group">
						<Form.Label>Username</Form.Label>
						<input
						type="text"
						{...register('username')}
						className={`form-control ${errors.username ? 'is-invalid' : ''}`}
						/>
						<div className="invalid-feedback">{errors.username?.message}</div>
					</Form.Group>


					{/* Password */}
					<Form.Group className="mb-3 form-group">
						<Form.Label>Password</Form.Label>
						<input
						type="password"
						{...register('password')}
						className={`form-control ${errors.password ? 'is-invalid' : ''}`}
						/>
						<div className="invalid-feedback">{errors.password?.message}</div>
					</Form.Group>

					{/* Confirm Password */}
					<Form.Group className="mb-3 form-group">
						<Form.Label>Confirm Password</Form.Label>
						<input
						type="password"
						{...register('confirmPassword')}
						className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
						/>
						<div className="invalid-feedback">{errors.confirmPassword?.message}</div>
					</Form.Group>

                  




					<Form.Group className="form-group py-3">

						<Button variant="primary" type="submit">Sign Up</Button>

						{/* <Row>
						<Col>
							<Button type="submit" className="btn btn-primary">
							Register
							</Button>
						</Col>
						</Row> */}
                  	</Form.Group>



					{/* <Form.Group className="mb-3" controlId="username">
						<Form.Control className="text-center" type="username" placeholder="Username" />
					</Form.Group>
					<Form.Group className="mb-3" controlId="email">
						<Form.Control className="text-center" type="email" placeholder="Email" />
					</Form.Group>
					<Form.Group className="mb-3" controlId="password">
						<Form.Control className="text-center" type="password" placeholder="Password" />
					</Form.Group>
					<Button variant="primary" type="submit">Sign Up</Button> */}
				</Form>
			</Modal.Body>
		</Modal>
    );
};

export default SignUpModal;