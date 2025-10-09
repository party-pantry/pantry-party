/* eslint-disable react/prop-types */

'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { Modal, Form, Button, InputGroup } from 'react-bootstrap';
import { Lock, Eye, EyeOff } from 'lucide-react';
import changePassword from '@/lib/dbActions';
// import LoadingSpinner from '../LoadingSpinner';

interface Props {
  show: boolean;
  onHide: () => void;
}

type ChangePasswordForm = {
  oldpassword: string;
  password: string;
  confirmPassword: string;
};

const ChangePasswordModal: React.FC<Props> = ({ show, onHide }) => {
  const { data: session, status } = useSession();
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
  } = useForm<ChangePasswordForm>({
    resolver: yupResolver(validationSchema),
    mode: 'onTouched', // Show errors on blur/touch
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    await changePassword({ email, ...data });
    await swal('Password Changed', 'Your password has been changed', 'success', { timer: 2000 });
    reset();
    onHide();
  };

//   if (status === 'loading') {
//     return <LoadingSpinner />;
//   }

  return (
    <Modal show={show} onHide={onHide} centered>
        <Modal.Header style={{ borderBottom: 'none', paddingBottom: '0px' }} closeButton />
        <Modal.Body className="text-center">
            <h5 className="text-center mb-4">
                <strong>Change Password</strong>
            </h5>
            <Form onSubmit={handleSubmit(onSubmit)} className="change-password-form">
                {/* Old Password */}
                <InputGroup className="mt-4 mb-3 custom-input-group">
                    <InputGroup.Text className="custom-input-group-text">
                        <Lock />
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
                        {oldPasswordVisible ? <EyeOff /> : <Eye />}
                    </InputGroup.Text>
                    <div className="invalid-feedback d-block">{errors.oldpassword?.message}</div>
                </InputGroup>

                {/* New Password */}
                <InputGroup className="mb-3 custom-input-group">
                    <InputGroup.Text className="custom-input-group-text">
                        <Lock />
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
                        {newPasswordVisible ? <EyeOff /> : <Eye />}
                    </InputGroup.Text>
                    <div className="invalid-feedback d-block">{errors.password?.message}</div>
                </InputGroup>

                {/* Confirm New Password */}
                <InputGroup className="mb-4 custom-input-group">
                    <InputGroup.Text className="custom-input-group-text">
                        <Lock />
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
                        {confirmPasswordVisible ? <EyeOff /> : <Eye />}
                    </InputGroup.Text>
                    <div className="invalid-feedback d-block">{errors.confirmPassword?.message}</div>
                </InputGroup>

                <Button variant="success" type="submit">
                    <strong>Update Password</strong>
                </Button>
            </Form>
        </Modal.Body>
    </Modal>
  );
};

export default ChangePasswordModal;
