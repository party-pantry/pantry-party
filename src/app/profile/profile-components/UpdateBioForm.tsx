'use client';

import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { useEffect } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { changeBio, fetchBio } from '@/lib/dbProfileFunctions';

type UpdateBioFormData = {
  newBio: string | null;
};

const validationSchema = Yup.object().shape({
  newBio: Yup.string()
    .notRequired()
    .transform((value) => (value === '' ? null : value))
    .max(500, 'Bio must be 500 characters or less'),
});

const UpdateBioForm: React.FC = () => {
  const { data: session, update } = useSession();
  const userId = session?.user?.id ? parseInt(session.user.id, 10) : NaN;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UpdateBioFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: { newBio: null },
    mode: 'onTouched',
  });

  useEffect(() => {
    async function loadProfileBio() {
      if (!userId) return;
      try {
        const bioText = await fetchBio({ id: userId });
        const finalBio = bioText || '';
        reset({ newBio: finalBio });
      } catch (err) {
        console.error('Failed to fetch profile bio:', err);
        reset({ newBio: '' });
      }
    }
    loadProfileBio();
  }, [userId, reset]);

  useEffect(() => {
    if (session?.user?.bio !== undefined) {
      const bioFromSession = session.user.bio || '';
      reset({ newBio: bioFromSession });
    }
  }, [session?.user?.bio, reset]);

  const inputBio = watch('newBio');

  const onSubmit = async (data: UpdateBioFormData) => {
    const bioToSave = data.newBio === '' ? null : data.newBio;

    try {
      await changeBio({ id: userId, newBio: bioToSave });

      await update({ bio: bioToSave, unstable_revalidate: true });

      await swal('Success', 'Your bio has been updated.', 'success', { timer: 2500 });
      reset({ newBio: bioToSave || '' });
    } catch (error) {
      swal('Error', 'Failed to save bio.', 'error');
    }
  };

  return (
    <Container style={{ width: '80%' }}>
      <h5 className="text-center mb-4">
        <strong>Change Bio</strong>
      </h5>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group controlId="formNewBio" className="mb-3">
          <Form.Control
            as="textarea"
            rows={4}
            placeholder="Add a bio"
            className={`${errors.newBio ? 'is-invalid' : ''}`}
            {...register('newBio')}
          />
          <Form.Text className="text-muted">
            {errors.newBio
              ? <div className="text-danger">{errors.newBio.message}</div>
              : `${inputBio?.length || 0} / 500 characters`}
          </Form.Text>
        </Form.Group>

        <div className="d-flex justify-content-center mt-4">
          <Button
            variant="success"
            type="submit"
            // disabled={!isDirty || !!errors.newBio}
          >
            <strong>Update Bio</strong>
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default UpdateBioForm;
