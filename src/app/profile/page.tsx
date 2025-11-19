import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { Container, Row, Col } from 'react-bootstrap';
import UpdateBioForm from './profile-components/UpdateBioForm';
import UpdateUsernameForm from './profile-components/UpdateUsernameForm';
import UpdatePasswordForm from './profile-components/UpdatePasswordForm';
import UpdateEmailForm from './profile-components/UpdateEmailForm';
import ProfilePictureUploader from './profile-components/ProfilePictureUploader';
import ProfileRecipes from './profile-components/ProfileRecipes';

const ProfilePage = async () => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  return (
    <Container className="py-5 mb-5 bg-white rounded shadow" style={{ width: '90%' }}>
      <Row>
        <Col className="ps-5">
          <div className="pb-5">
            <ProfilePictureUploader />
          </div>
          <div className="pb-5">
            <UpdateBioForm />
          </div>
        </Col>
        <Col className="pe-5">
          <div className="pb-5">
            <UpdateUsernameForm />
          </div>
          <div className="pb-5">
            <UpdateEmailForm />
          </div>
          <div className="pb-5">
            <UpdatePasswordForm />
          </div>
        </Col>
      </Row>
      <ProfileRecipes />
    </Container>
  );
};

export default ProfilePage;
