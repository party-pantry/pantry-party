import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { Container, Row } from 'react-bootstrap';
import UpdateUsernameForm from './components/UpdateUsernameForm';
import UpdatePasswordForm from './components/UpdatePasswordForm';
import UpdateEmailForm from './components/UpdateEmailForm';
import ProfilePictureUploader from './components/ProfilePictureUploader';
import ProfileRecipes from './components/ProfileRecipes';

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
      <Row>
        {/* displays all of the user's recipes */}
        <ProfileRecipes />
      </Row>
    </Container>
  );
};

export default ProfilePage;
