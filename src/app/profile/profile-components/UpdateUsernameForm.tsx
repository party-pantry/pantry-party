'use client';

import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { Form, Button, InputGroup, Container } from 'react-bootstrap';
import { User } from 'lucide-react';
import { changeUsername } from '@/lib/dbActions';

type UpdateUsernameFormData = {
  newUsername: string;
};

const UpdateUsernameForm: React.FC = () => {
  const { data: session, update } = useSession();
  const userId = parseInt(session?.user?.id, 10);

  const validationSchema = Yup.object().shape({
    newUsername: Yup.string().required('Username is required'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUsernameFormData>({
    resolver: yupResolver(validationSchema),
    mode: 'onTouched', // Show errors on blur/touch
  });

  const onSubmit = async (data: UpdateUsernameFormData) => {
    await changeUsername({ id: userId, newUsername: data.newUsername });

    await update({ email: data.newUsername });

    await swal('Username Changed', 'Username has been changed', 'success', { timer: 2000 });
    reset();
  };

  return (
    <Container className="p-4" style={{ width: '50%' }}>
        <h5 className="text-center mb-4">
            <strong>Change Username</strong>
        </h5>
        <Form onSubmit={handleSubmit(onSubmit)} className="change-username-form">
            {/* Username */}
            <InputGroup className="mt-4 mb-3 custom-input-group">
                <InputGroup.Text className="custom-input-group-text">
                    <User size={20} />
                </InputGroup.Text>
                <Form.Control
                    placeholder="New Username"
                    className={`form-control ${errors.newUsername ? 'is-invalid' : ''}`}
                    type="text"
                    {...register('newUsername')}
                />
                <div className="invalid-feedback d-block">{errors.newUsername?.message}</div>
            </InputGroup>
            {/* Save button */}
            <div className="d-flex justify-content-center">
                <Button variant="success" type="submit">
                    <strong>Update Username</strong>
                </Button>
            </div>
        </Form>
    </Container>
  );
};

export default UpdateUsernameForm;
