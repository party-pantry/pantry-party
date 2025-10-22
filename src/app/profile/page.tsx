import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { Container, Row } from 'react-bootstrap';
import UpdateUsernameForm from './profile-components/UpdateUsernameForm';
import UpdatePasswordForm from './profile-components/UpdatePasswordForm';
import UpdateEmailForm from './profile-components/UpdateEmailForm';
import ProfilePictureUploader from './profile-components/ProfilePictureUploader';

const ProfilePage = async () => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  return (
    <Container className="py-5">
      <Row>
        <ProfilePictureUploader />
      </Row>
      <Row>
        {/* Update email form */}
        <UpdateEmailForm />
      </Row>
      <Row>
        {/* Update username form */}
        <UpdateUsernameForm />
      </Row>
      <Row>
        {/* Update password form */}
        <UpdatePasswordForm />
      </Row>
    </Container>
  );
};

export default ProfilePage;
