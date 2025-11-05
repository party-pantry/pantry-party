'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Form, Button, InputGroup, Container, Card } from 'react-bootstrap';
import { User, Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createUser } from '@/lib/dbFunctions';
import Link from 'next/link';

type SignUpData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function AuthPage() {
  const router = useRouter();
  const [isSignIn, setIsSignIn] = useState(true);

  // Sign In State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Sign Up State
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);

  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    email: Yup.string().required('Email is required').email('Email is invalid'),
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('password'), ''], 'Password does not match'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpData>({
    resolver: yupResolver(validationSchema),
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signIn('credentials', {
      identifier,
      password,
      callbackUrl: '/my-kitchen',
      redirect: false,
    });

    if (result?.error) {
      setSignInError('Invalid username or password');
    } else {
      setSignInError('');
      router.push('/my-kitchen');
    }
  };

  const handleSignUp = async (data: SignUpData) => {
    await createUser(data);
    // Use email as identifier for immediate sign-in after registration
    await signIn('credentials', {
      identifier: data.email,
      password: data.password,
      callbackUrl: '/my-kitchen',
      redirect: false,
    });
    router.push('/my-kitchen');
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const togglePasswordConfirmVisibility = () => {
    setPasswordConfirmVisible(!passwordConfirmVisible);
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}
    >
      <Card
        style={{
          maxWidth: '500px',
          width: '100%',
          border: 'none',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Card.Body className="p-5">
          {/* Back to Home Link */}
          <div className="mb-4">
            <Link href="/" className="text-decoration-none" style={{ color: '#6c757d', fontSize: '0.9rem' }}>
              ← Back to Home
            </Link>
          </div>

          {/* Sign In Form */}
          {isSignIn ? (
            <>
              <h2 className="text-center mb-4 gradient-text">
                <strong>Welcome Back to the Party!</strong>
              </h2>
              <Form onSubmit={handleSignIn}>
                {/* Username or Email */}
                <InputGroup className="mb-3">
                  <InputGroup.Text className="custom-input-group-text">
                    <User />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Username or Email"
                    value={identifier}
                    type="text"
                    onChange={(e) => setIdentifier(e.target.value)}
                    isInvalid={!!signInError}
                  />
                </InputGroup>

                {/* Password */}
                <InputGroup className="mb-3">
                  <InputGroup.Text className="custom-input-group-text">
                    <Lock />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Password"
                    type={passwordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    isInvalid={!!signInError}
                  />
                  <InputGroup.Text className="custom-input-group-text toggle-icon" onClick={togglePasswordVisibility}>
                    {passwordVisible ? <EyeOff /> : <Eye />}
                  </InputGroup.Text>
                  <Form.Control.Feedback type="invalid" style={{ textAlign: 'left' }}>
                    {signInError}
                  </Form.Control.Feedback>
                </InputGroup>

                {/* Sign in button */}
                <Button className="sign-in-button w-100 mb-3" type="submit">
                  <strong>Sign In</strong>
                </Button>
              </Form>

              {/* Toggle to Sign Up */}
              <div className="text-center mt-4">
                <p className="mb-0">
                  Don&apos;t have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0"
                    style={{ textDecoration: 'none', fontWeight: 'bold' }}
                    onClick={() => {
                      setIsSignIn(false);
                      setSignInError('');
                      setIdentifier('');
                      setPassword('');
                    }}
                  >
                    Sign Up
                  </Button>
                </p>
              </div>
            </>
          ) : (
            /* Sign Up Form */
            <>
              <h2 className="text-center mb-4 gradient-text">
                <strong>Join the Party!</strong>
              </h2>
              <Form onSubmit={handleSubmit(handleSignUp)} className="sign-up-form">
                {/* Username */}
                <InputGroup className="mb-3">
                  <InputGroup.Text className="custom-input-group-text">
                    <User />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Username"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    type="text"
                    {...register('username')}
                  />
                  <div className="invalid-feedback">{errors.username?.message}</div>
                </InputGroup>

                {/* Email */}
                <InputGroup className="mb-3">
                  <InputGroup.Text className="custom-input-group-text">
                    <Mail />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    type="email"
                    {...register('email')}
                  />
                  <div className="invalid-feedback">{errors.email?.message}</div>
                </InputGroup>

                {/* Password */}
                <InputGroup className="mb-3">
                  <InputGroup.Text className="custom-input-group-text">
                    <Lock />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    type={passwordVisible ? 'text' : 'password'}
                    {...register('password')}
                  />
                  <InputGroup.Text className="custom-input-group-text toggle-icon" onClick={togglePasswordVisibility}>
                    {passwordVisible ? <EyeOff /> : <Eye />}
                  </InputGroup.Text>
                  <div className="invalid-feedback">{errors.password?.message}</div>
                </InputGroup>

                {/* Confirm Password */}
                <InputGroup className="mb-3">
                  <InputGroup.Text className="custom-input-group-text">
                    <Lock />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Confirm Password"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    type={passwordConfirmVisible ? 'text' : 'password'}
                    {...register('confirmPassword')}
                  />
                  <InputGroup.Text
                    className="custom-input-group-text toggle-icon"
                    onClick={togglePasswordConfirmVisibility}
                  >
                    {passwordConfirmVisible ? <EyeOff /> : <Eye />}
                  </InputGroup.Text>
                  <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
                </InputGroup>

                {/* Sign Up Button */}
                <Button className="sign-in-button w-100 mb-3" type="submit">
                  <strong>Create My Account</strong>
                </Button>
              </Form>

              {/* Toggle to Sign In */}
              <div className="text-center mt-4">
                <p className="mb-0">
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0"
                    style={{ textDecoration: 'none', fontWeight: 'bold' }}
                    onClick={() => setIsSignIn(true)}
                  >
                    Sign In
                  </Button>
                </p>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
