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
      <Container fluid>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100vh',
            padding: '0 5%',
          }}
          id="home"
        >
          <div style={{ flex: "1 1 400px", minWidth: "300px", textAlign: "left" }}>
            <h1 style={{ marginBottom: '24px' }}>
              <strong>The Fun Way To Stock Your Pantry</strong>
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
              variant='success'
              size='lg'
              onClick={() => setShowSignIn(true)}
              style={{ marginRight: '12px' }}
            >
              Sign In
            </Button>
            <Button
              variant='success'
              size='lg'
              onClick={() => setShowSignUp(true)}
            >
              Sign Up
            </Button>
          </div>
          <div style={{ flex: "1 1 400px", minWidth: "300px", textAlign: "center" }}>
            <Image
              src='/landing.jpg'
              alt='Image of food items'
              width={1100}
              height={600}
              priority
              style={{ maxWidth: '100%', height: 'auto' }}
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
          id="features"
        >
          <h1>Features</h1>
          <FeaturesSection />
        </div>

        <SignInModal show={showSignIn} onHide={() => setShowSignIn(false)} />
        <SignUpModal show={showSignUp} onHide={() => setShowSignUp(false)} />
      </Container>
    </>
  );
}
