'use client';

import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { Form, Button, InputGroup, Container } from 'react-bootstrap';
import { Mail } from 'lucide-react';
import { changeEmail } from '@/lib/dbActions';

type UpdateEmailFormData = {
  newEmail: string;
};

const UpdateEmailForm: React.FC = () => {
  const { data: session, update } = useSession();
  const userId = parseInt(session?.user?.id, 10);
  const currentEmail = session?.user?.email;

  const validationSchema = Yup.object().shape({
    newEmail: Yup.string().required('New Email is required').email('Email is invalid'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateEmailFormData>({
    resolver: yupResolver(validationSchema),
    mode: 'onTouched', // Show errors on blur/touch
  });

  const onSubmit = async (data: UpdateEmailFormData) => {
    await changeEmail({ id: userId, newEmail: data.newEmail });

    await update({ email: data.newEmail });

    await swal('Email Changed', 'Email has been changed', 'success', { timer: 2000 });
    reset();
  };

  return (
    <Container className="p-4" style={{ width: '50%' }}>
        <h5 className="text-center mb-4">
            <strong>Change Email</strong>
        </h5>
        <Form onSubmit={handleSubmit(onSubmit)} className="change-username-form">
            {/* Email */}
            <InputGroup className="mt-4 mb-3 custom-input-group">
                <InputGroup.Text className="custom-input-group-text">
                    <Mail size={18} />
                </InputGroup.Text>
                <Form.Control
                    defaultValue={currentEmail}
                    className={`form-control ${errors.newEmail ? 'is-invalid' : ''}`}
                    type="text"
                    {...register('newEmail')}
                />
                <div className="invalid-feedback d-block">{errors.newEmail?.message}</div>
            </InputGroup>
            {/* Save button */}
            <div className="d-flex justify-content-center">
                <Button variant="success" type="submit">
                    <strong>Update Email</strong>
                </Button>
            </div>
        </Form>
    </Container>
  );
};

export default UpdateEmailForm;
