'use client';

import { useForm } from 'react-hook-form';
// import { useSession } from 'next-auth/react';
import swal from 'sweetalert';
import { Form, Button, InputGroup, Container, Image as BootstrapImage } from 'react-bootstrap';
// import { changeEmail } from '@/lib/dbActions';

type UpdateImageFormData = {
  newImage: string;
};

const ProfilePictureUploader: React.FC = () => {
  // const { data: session, update } = useSession();
  // const userId = parseInt(session?.user?.id, 10);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateImageFormData>({
    mode: 'onTouched', // Show errors on blur/touch
  });

  const onSubmit = async () => {
    // await changeImage({ id: userId, newImage: data.newImage });

    // await update({ email: data.newImage });

    await swal('Image Changed', 'Image has been changed', 'success', { timer: 2000 });
    reset();
  };

  return (
    <Container className="p-4" style={{ width: '50%' }}>
      <BootstrapImage
            // eslint-disable-next-line max-len
            src="https://fiverr-res.cloudinary.com/images/q_auto,f_auto/gigs/149197250/original/e91f8ca9de6e762865d3c20959e544f07bb760cc/create-a-simple-professional-profile-picture-for-you.png"
            alt="profile picture"
            style={{ width: '200px', height: '200px', objectFit: 'cover' }}
            className="d-block mx-auto rounded-circle"
      />
      <Form onSubmit={handleSubmit(onSubmit)} className="change-username-form">
        {/* Image */}
        <InputGroup className="mt-4 mb-3 custom-input-group">
          <Form.Control
              placeholder="New image address"
              className={`form-control ${errors.newImage ? 'is-invalid' : ''}`}
              type="text"
              {...register('newImage')}
          />
          <div className="invalid-feedback d-block">{errors.newImage?.message}</div>
        </InputGroup>
        {/* Save button */}
        <div className="d-flex justify-content-center">
          <Button variant="success" type="submit">
            <strong>Update Picture</strong>
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default ProfilePictureUploader;
