'use client';

import { Container, Navbar, Nav } from 'react-bootstrap';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import ChangePasswordModal from './auth-components/ChangePasswordModal';
import SignInModal from './auth-components/SignInModal';
import SignUpParentModal from './auth-components/SignUpParentModal';
import SignOutModal from './auth-components/SignOutModal';

const TopBar: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user;
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  // Get display name - prioritize name, then email username, then fallback
  const getDisplayName = () => {
    if (!currentUser) return null;

    if (currentUser.name) {
      return currentUser.name;
    }

    if (currentUser.email) {
      return currentUser.email.split('@')[0];
    }

    return 'User';
  };

  getDisplayName();

  return (
    <>
      <Navbar className="sticky top-0 w-full bg-transparent z-5">
        <Container>
          <Nav className="ms-auto flex items-center gap-3">
            {/* Notification bell and profile dropdown removed */}
          </Nav>
        </Container>
      </Navbar>

      <ChangePasswordModal show={showChangePassword} onHide={() => setShowChangePassword(false)} />
      <SignInModal show={showSignIn} onHide={() => setShowSignIn(false)} />
      <SignUpParentModal showSignUp={showSignUp} setShowSignUp={setShowSignUp} />
      <SignOutModal show={showSignOut} onHide={() => setShowSignOut(false)} />
    </>
  );
};

export default TopBar;
