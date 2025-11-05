'use client';

import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { useEffect, useState } from 'react';
import { Form, Button, InputGroup, Container, Image as BootstrapImage } from 'react-bootstrap';
import { Link } from 'lucide-react';
import { changeProfileImageUrl, fetchProfileImageUrl } from '@/lib/dbProfileFunctions';

type UpdateImageFormData = {
  newImageUrl: string;
};

const validationSchema = Yup.object().shape({
  newImageUrl: Yup.string()
    .required('Image URL is required')
    .url('Must be a valid URL')
    .matches(/\.(jpeg|jpg|gif|png|webp)$/, {
      message: 'URL image must end in .jpeg, .jpg, .gif, .png, or .webp',
      excludeEmptyString: true,
    }),
});

const DEFAULT_PHOTO_URL = '/defaultProfileImage.png';

const ProfilePictureUploader: React.FC = () => {
  const { data: session, update } = useSession();
  const userId = parseInt(session?.user?.id as string, 10);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UpdateImageFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: { newImageUrl: '' },
    mode: 'onTouched',
  });

  // Fetch the image
  useEffect(() => {
    async function loadProfileImage() {
      if (!userId) return;
      try {
        const imageUrl = await fetchProfileImageUrl({ id: userId });
        setCurrentPhotoUrl(imageUrl || '');
        reset({ newImageUrl: imageUrl || '' });
      } catch (err) {
        console.error('Failed to fetch profile image:', err);
      }
    }
    loadProfileImage();
  }, [userId, reset]);

  // Sync when session updates
  useEffect(() => {
    if (session?.user?.image) {
      setCurrentPhotoUrl(session.user.image);
      reset({ newImageUrl: session.user.image });
    }
  }, [session?.user?.image, reset]);

  // Watches the current value in the input field
  const inputUrl = watch('newImageUrl');
  const displayUrl = inputUrl || currentPhotoUrl || DEFAULT_PHOTO_URL;

  const onSubmit = async (data: UpdateImageFormData) => {
    const urlToSave = data.newImageUrl || null;
    try {
      await changeProfileImageUrl({ id: userId, newImage: urlToSave });
      await update({ image: urlToSave, unstable_revalidate: true });

      setCurrentPhotoUrl(data.newImageUrl);
      await swal('Profile image updated', 'Profile image has been updated', 'success', { timer: 2000 });

      reset({ newImageUrl: data.newImageUrl });
    } catch (error) {
      console.error('Error saving URL:', error);
      swal('Error', 'Failed to save image URL.', 'error');
    }
  };

  return (
    <Container className="p-4" style={{ width: '50%' }}>
      <h5 className="text-center mb-4">
        <strong>Change Profile Icon</strong>
      </h5>

      {/* Image Preview Area */}
      <div className="d-flex justify-content-center mb-4">
        <BootstrapImage
          src={displayUrl}
          alt="Profile Preview"
          style={{
            width: '150px',
            // keeps it perfectly square
            aspectRatio: '1 / 1',
            objectFit: 'cover',
          }}
          className="d-block mx-auto rounded-circle border border-secondary"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_PHOTO_URL;
          }}
        />
      </div>

      {/* Form */}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <InputGroup className="mt-4 mb-3 custom-input-group">
          <InputGroup.Text className="custom-input-group-text">
            <Link size={18} />
          </InputGroup.Text>
          <Form.Control
            placeholder="New image URL (must end in .jpeg, .jpg, .gif, .png, or .webp)"
            className={`form-control ${errors.newImageUrl ? 'is-invalid' : ''}`}
            type="text"
            {...register('newImageUrl')}
          />
          <div className="invalid-feedback d-block">{errors.newImageUrl?.message}</div>
        </InputGroup>

        <div className="d-flex justify-content-center mt-4">
          <Button variant="success" type="submit">
            <strong>Save Profile Image</strong>
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default ProfilePictureUploader;
