/* eslint-disable react/prop-types */

'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { Form, Button, InputGroup, Container } from 'react-bootstrap';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { changePassword } from '@/lib/dbActions';

type UpdatePasswordFormData = {
  oldpassword: string;
  password: string;
  confirmPassword: string;
};

const UpdatePasswordForm: React.FC = () => {
  const { data: session } = useSession();
  const email = session?.user?.email || '';

  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const toggleVisibility = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter((prev) => !prev);
  };

  const validationSchema = Yup.object().shape({
    oldpassword: Yup.string().required('Your old password is required'),
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('password'), ''], 'Password does not match'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>({
    resolver: yupResolver(validationSchema),
    mode: 'onTouched', // Show errors on blur/touch
  });

  const onSubmit = async (data: UpdatePasswordFormData) => {
    await changePassword({ email, ...data });
    await swal('Success', 'Your password has been changed', 'success', { timer: 2500 });
    reset();
  };

  return (
    <Container style={{ width: '80%' }}>
        <h5 className="text-center mb-4">
            <strong>Change Password</strong>
        </h5>
        <Form onSubmit={handleSubmit(onSubmit)} className="change-password-form">
            {/* Old Password */}
            <InputGroup className="mt-4 mb-3 custom-input-group">
                <InputGroup.Text className="custom-input-group-text">
                    <Lock size={18} />
                </InputGroup.Text>
                <Form.Control
                    placeholder="Current Password"
                    className={`form-control ${errors.oldpassword ? 'is-invalid' : ''}`}
                    type={oldPasswordVisible ? 'text' : 'password'}
                    {...register('oldpassword')}
                />
                <InputGroup.Text
                    className="custom-input-group-text toggle-icon"
                    onClick={() => toggleVisibility(setOldPasswordVisible)}
                >
                    {oldPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </InputGroup.Text>
                <div className="invalid-feedback d-block">{errors.oldpassword?.message}</div>
            </InputGroup>

            {/* New Password */}
            <InputGroup className="mb-3 custom-input-group">
                <InputGroup.Text className="custom-input-group-text">
                    <Lock size={18} />
                </InputGroup.Text>
                <Form.Control
                    placeholder="New Password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    type={newPasswordVisible ? 'text' : 'password'}
                    {...register('password')}
                />
                <InputGroup.Text
                    className="custom-input-group-text toggle-icon"
                    onClick={() => toggleVisibility(setNewPasswordVisible)}
                >
                    {newPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </InputGroup.Text>
                <div className="invalid-feedback d-block">{errors.password?.message}</div>
            </InputGroup>

            {/* Confirm New Password */}
            <InputGroup className="mb-4 custom-input-group">
                <InputGroup.Text className="custom-input-group-text">
                    <Lock size={18} />
                </InputGroup.Text>
                <Form.Control
                    placeholder="Confirm New Password"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    type={confirmPasswordVisible ? 'text' : 'password'}
                    {...register('confirmPassword')}
                />
                <InputGroup.Text
                    className="custom-input-group-text toggle-icon"
                    onClick={() => toggleVisibility(setConfirmPasswordVisible)}
                >
                    {confirmPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </InputGroup.Text>
                <div className="invalid-feedback d-block">{errors.confirmPassword?.message}</div>
            </InputGroup>

            <div className="d-flex justify-content-center">
                <Button variant="success" type="submit">
                    <strong>Update Password</strong>
                </Button>
            </div>
        </Form>
    </Container>
  );
};

export default UpdatePasswordForm;
