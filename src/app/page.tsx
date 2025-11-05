'use client';

import { useSession } from 'next-auth/react';
import { Container, Button } from 'react-bootstrap';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import FeaturesSection from '@/components/FeaturesSection';

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUser = session?.user;

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
          <div style={{ flex: '1 1 400px', minWidth: '300px', textAlign: 'left' }}>
            <h1 className= 'gradient-text' style={{ marginBottom: '24px' }}>
              <strong>The Fun Way To Stock Your Pantry</strong>
            </h1>
            <h5 style={{ marginBottom: '24px' }}>
              Easily track and manage your pantry items across multiple kitchens and storage spaces
            </h5>
            {!currentUser && (
              <>
                <Button className= "front-button"
                  size="lg" onClick={() => router.push('/auth')}
                  style={{ marginRight: '12px' }}>
                  Sign In
                </Button>
                <Button className= "front-button" size="lg" onClick={() => router.push('/auth')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
          <div style={{ flex: '1 1 400px', minWidth: '300px', textAlign: 'center' }}>
            <Image
              src="/landing.jpg"
              alt="Image of food items"
              width={1100}
              height={600}
              priority
              style={{ maxWidth: '100%', height: 'auto', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)' }}
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
          className="mb-5"
          id="features"
        >
          <h1 style={{ marginBottom: '24px' }}>
              <strong>Features</strong>
            </h1>
          <FeaturesSection />
        </div>
      </Container>
    </>
  );
}
