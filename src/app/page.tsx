'use client';

import { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import Image from 'next/image';
import FeaturesSection from '../components/FeaturesSection';
import SignInModal from '../components/SignInModal';
import SignUpModal from '../components/SignUpModal';

export default function Home() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <>
      <SignInModal show={showSignIn} onHide={() => setShowSignIn(false)} />
      <SignUpModal show={showSignUp} onHide={() => setShowSignUp(false)} />
      <Container fluid>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100vh',
            padding: '0 5%',
          }}
        >
          <div style={{ flex: 1, textAlign: 'left' }}>
            <h1 style={{ marginBottom: '24px' }}>
              The Fun Way To Stock Your Pantry
            </h1>
            <h5 style={{ marginBottom: '24px' }}>
              Easily track and manage your pantry items across multiple kitchens
              and storage spaces
            </h5>
            <Button
              variant='outline-primary'
              size='sm'
              onClick={() => setShowSignIn(true)}
              style={{ marginRight: '12px' }}
            >
              Sign In
            </Button>
            <Button
              variant='primary'
              size='sm'
              onClick={() => setShowSignUp(true)}
            >
              Sign Up
            </Button>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <Image
              src='/landing.jpg'
              alt='Image of food items'
              width={1100}
              height={600}
              priority
            />
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
          className='mb-5'
        >
          <h1>Features</h1>
          <FeaturesSection />
        </div>
      </Container>
    </>
  );
}
