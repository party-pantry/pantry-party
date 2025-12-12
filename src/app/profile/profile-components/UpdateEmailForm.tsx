'use client';

import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { useEffect } from 'react';
import { Form, Button, InputGroup, Container } from 'react-bootstrap';
import { Mail } from 'lucide-react';
import { changeEmail, fetchEmail } from '@/lib/dbProfileFunctions';

type UpdateEmailFormData = {
  newEmail: string;
};

const validationSchema = Yup.object().shape({
  newEmail: Yup.string().required('New Email is required').email('Email is invalid'),
});

const UpdateEmailForm: React.FC = () => {
  const { data: session, update } = useSession();
  const userId = parseInt(session?.user?.id, 10);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateEmailFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: { newEmail: '' },
    mode: 'onTouched', // Show errors on blur/touch
  });

  useEffect(() => {
    async function loadEmail() {
      if (!userId) return;
      try {
        const fetchedEmail = await fetchEmail({ id: userId });
        reset({ newEmail: fetchedEmail! });
      } catch (error) {
        console.error('Failed to fetch email', error);
      }
    }
    loadEmail();
  }, [userId, reset]);

  // Sync when session updates
  useEffect(() => {
    if (session?.user?.email !== undefined) {
      const emailFromSession = session.user.email;
      reset({ newEmail: emailFromSession });
    }
  }, [session?.user?.email, reset]);

  const onSubmit = async (data: UpdateEmailFormData) => {
    try {
      await changeEmail({ id: userId, newEmail: data.newEmail });

      await update({ email: data.newEmail });

      await swal('Success', 'Your username has been updated.', 'success', { timer: 2500 });
    } catch (error) {
      swal('Error', 'Failed to save email.', 'error');
    }
  };

  return (
    <Container style={{ width: '80%' }}>
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
                    // defaultValue={currentEmail}
                    placeholder="New email"
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
