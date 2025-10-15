'use client';

import Link from 'next/link';
import { Container, Navbar, Nav, NavDropdown, Button } from 'react-bootstrap';
import {
  User,
  Settings,
  Bell,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import ChangePasswordModal from '../auth-components/ChangePasswordModal';
import SignInModal from '../auth-components/SignInModal';
import SignUpParentModal from '../auth-components/SignUpParentModal';
import SignOutModal from '../auth-components/SignOutModal';

const TopBar: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user;
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const displayName = getDisplayName();

  return (
    <>
      <Navbar 
        expand="lg" 
        className="top-0 w-100" 
        style={{ 
          backgroundColor: 'transparent',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto d-flex align-items-center gap-3">
              <Button
                variant="link"
                className="p-2 text-dark"
                style={{ 
                  border: 'none',
                  background: 'none',
                }}
                aria-label="Settings"
              >
                <Settings size={20} />
              </Button>

              <Button
                variant="link"
                className="p-2 text-dark"
                style={{ 
                  border: 'none',
                  background: 'none',
                }}
                aria-label="Notifications"
              >
                <Bell size={20} />
              </Button>

              <NavDropdown
                id="login-dropdown"
                renderMenuOnMount
                show={dropdownOpen}
                onToggle={(isOpen) => setDropdownOpen(isOpen)}
                align="end"
                title={
                  <Button
                    variant="outline-success"
                    className="d-flex align-items-center gap-2"
                    style={{
                      borderRadius: '20px',
                      padding: '8px 16px',
                    }}
                  >
                    <User size={18} />
                    {session && displayName ? (
                      <span>{displayName}</span>
                    ) : (
                      <span>Account</span>
                    )}
                    {dropdownOpen ? (
                      <ChevronUp size={15} />
                    ) : (
                      <ChevronDown size={15} />
                    )}
                  </Button>
                }
              >
                {session ? (
                  <>
                    <NavDropdown.Item onClick={() => setShowChangePassword(true)}>
                      Change Password
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={() => setShowSignOut(true)}>
                      Sign Out
                    </NavDropdown.Item>
                  </>
                ) : (
                  <>
                    <NavDropdown.Item onClick={() => setShowSignIn(true)}>
                      Sign In
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={() => setShowSignUp(true)}>
                      Sign Up
                    </NavDropdown.Item>
                  </>
                )}
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
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