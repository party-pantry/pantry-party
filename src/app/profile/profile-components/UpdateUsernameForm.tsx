'use client';

import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { useEffect } from 'react';
import { User } from 'lucide-react';
import { InputGroup, Form, Button, Container } from 'react-bootstrap';
import { changeUsername, fetchUsername } from '@/lib/dbProfileFunctions';

type UpdateUsernameFormData = {
  newUsername: string;
};

const validationSchema = Yup.object().shape({
  newUsername: Yup.string().required('Username is required'),
});

const UpdateUsernameForm: React.FC = () => {
  const { data: session, update } = useSession();
  const userId = parseInt(session?.user?.id, 10);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUsernameFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: { newUsername: '' },
    mode: 'onTouched', // Show errors on blur/touch
  });

  useEffect(() => {
    async function loadUsername() {
      if (!userId) return;
      try {
        const UsernameText = await fetchUsername({ id: userId });
        reset({ newUsername: UsernameText! });
      } catch (error) {
        console.error('Failed to fetch username', error);
      }
    }
    loadUsername();
  }, [userId, reset]);

  // Sync when session updates
  useEffect(() => {
    if (session?.user?.username !== undefined) {
      const usernameFromSession = session.user.username;
      reset({ newUsername: usernameFromSession });
    }
  }, [session?.user?.username, reset]);

  const onSubmit = async (data: UpdateUsernameFormData) => {
    try {
      await changeUsername({ id: userId, newUsername: data.newUsername });

      await update({ username: data.newUsername });

      await swal('Success', 'Your username has been updated.', 'success', { timer: 2500 });
    } catch (error) {
      console.error('Error saving username:', error);
      swal('Error', 'Failed to save username.', 'error');
    }
  };

  return (
    <Container style={{ width: '80%' }}>
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
                    placeholder="New username"
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
