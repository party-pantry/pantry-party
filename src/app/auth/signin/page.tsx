'use client';

import { Row } from 'react-bootstrap';

// Rerouted page if user tries to access a protected page without being logged in
// (unauthroized access)
const NotFoundPage = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '80vh',
        margin: 0,
      }}
    >
      {/* Custom Error 404 message */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Row>
            <h1 style={{ fontSize: '3rem' }}>Oops! Page Not Found.</h1>
        </Row>
        <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '8vh',
              margin: 0,
            }}
        />
        <Row className="text-center" style={{ fontSize: '1.1rem' }}>
            <p>The page you are looking for does not exist.</p>
            <p>Please double check the URL or sign-in to view the page.</p>
        </Row>
      </main>

    </div>
);

export default NotFoundPage;
