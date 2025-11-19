// For cooking/[id]/[link]/page.tsx
// Loading Skeleton Component (cooking/components/CookingSkeleton.tsx)
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const CookingSkeleton: React.FC = () => (
  <Container className="min-h-screen py-5" style={{ width: '95%' }}>
    {/* Back button */}
    <div className="skeleton-box mb-1" style={{ width: '6%', height: '30px', margin: '' }}></div>
    {/* Title skeleton */}
    <div className="skeleton-box mb-4" style={{ width: '50%', height: '48px', margin: '0 auto' }}></div>

    {/* Progress bar skeleton */}
    <div className="skeleton-box mt-5 pt-1 mb-5" style={{ width: '100%', height: '24px' }}></div>

    <Row className="gap-4 mt-2">
      {/* Timer column skeleton */}
      <Col md={4} lg={3}>
        <div className="sticky-top top-5" style={{ zIndex: 1 }}>
          <div className="skeleton-box mb-3" style={{ width: '100%', height: '325px' }}></div>
        </div>
      </Col>

      {/* Ingredients checker skeleton */}
      <Col>
          <Card
                className="mb-3 skeleton-box"
                style={{
                  minHeight: '40vh',
                  maxHeight: '60vh',
                }}
            >
                {/* Header skeleton */}
                <Card.Header className="skeleton-box py-3 top-5">
                <div className="skeleton-box mb-1" style={{ width: '150px', height: '24px' }}></div>
                <div className="skeleton-box" style={{ width: '200px', height: '16px' }}></div>
                </Card.Header>
                <Card.Body
                className="d-flex flex-column flex-grow-1 overflow-hidden"
                style={{ height: 'calc(60vh - 56px)' }}
                >
                {/* Badge skeleton */}
                <div className="mb-3 pr-5 align-self-end">
                    <div className="skeleton-box" style={{ width: '80px', height: '24px' }}></div>
                </div>
                {/* Ingredients list skeleton */}
                <div
                    className="flex-grow-1 border rounded p-3 overflow-y-auto"
                    style={{ minHeight: 0 }}
                >
                    {[...Array(6)].map((_, idx) => (
                    <div
                        key={idx}
                        className="mb-2 p-2 d-flex align-items-center gap-3 border rounded"
                    >
                        <div className="d-flex align-items-center gap-3 flex-grow-1">
                        <div className="skeleton-box" style={{ width: '20px', height: '20px' }}></div>
                        <div className="flex-1">
                            <div className="skeleton-box mb-1" style={{ width: '120px', height: '16px' }}></div>
                            <div className="skeleton-box" style={{ width: '180px', height: '16px' }}></div>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                {/* Button skeleton */}
                <div className="d-flex justify-content-end mt-3">
                    <div className="skeleton-box" style={{ width: '120px', height: '40px' }}></div>
                </div>
                </Card.Body>
            </Card>
      </Col>
    </Row>
  </Container>
);

export default CookingSkeleton;
