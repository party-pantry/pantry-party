// components/recipes-components/RecipeSkeleton.tsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const RecipeSkeleton: React.FC = () => (
    <Container className="min-h-screen py-10 pt-0" style={{ width: '95%' }}>
      <div className="flex flex-col items-start gap-1">
        {/* Back button */}
        <div className="skeleton-box mb-4" style={{ width: '6%', height: '30px' }}></div>
        {/* Title and badges skeleton */}
        <div className="flex items-center gap-4 w-100">
          <div className="skeleton-box" style={{ width: '400px', height: '48px' }}></div>
          <div className="skeleton-box" style={{ width: '80px', height: '32px' }}></div>
          <div className="skeleton-box" style={{ width: '180px', height: '24px' }}></div>
        </div>

        {/* Rating skeleton */}
        <div className="d-flex align-items-center gap-2 mt-1 mb-1">
          <div className="skeleton-box" style={{ width: '120px', height: '24px' }}></div>
          <div className="skeleton-box" style={{ width: '40px', height: '24px' }}></div>
        </div>

        {/* Author info skeleton */}
        <div className="skeleton-box" style={{ width: '300px', height: '20px' }}></div>

        <hr className="my-4 w-100" />

        <Row className="gap-5 w-100">
          <Col>
            {/* Description skeleton */}
            <div className="mb-3">
              <div className="skeleton-box mb-2" style={{ width: '100%', height: '20px' }}></div>
              <div className="skeleton-box mb-2" style={{ width: '90%', height: '20px' }}></div>
              <div className="skeleton-box" style={{ width: '70%', height: '20px' }}></div>
            </div>

            {/* Time stats skeleton */}
            <div className="flex justify-between w-full max-w-xl mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="skeleton-box" style={{ width: '60px', height: '28px' }}></div>
                  <div className="skeleton-box" style={{ width: '80px', height: '16px' }}></div>
                </div>
              ))}
            </div>

            {/* Ingredients heading skeleton */}
            <div className="skeleton-box mb-3" style={{ width: '150px', height: '32px' }}></div>

            <Row className="w-100 mb-3">
              <Col md={6} sm={12}>
                <div className="skeleton-box mb-2" style={{ width: '100px', height: '24px' }}></div>
                <div className="ps-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton-box mb-2" style={{ width: '100%', height: '20px' }}></div>
                  ))}
                </div>
              </Col>

              <Col md={6} sm={12}>
                <div className="skeleton-box mb-2" style={{ width: '100px', height: '24px' }}></div>
                <div className="ps-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-box mb-2" style={{ width: '100%', height: '20px' }}></div>
                  ))}
                </div>
              </Col>
            </Row>

            {/* Button skeleton */}
            <div className="skeleton-box mt-1 mb-2" style={{ width: '300px', height: '50px' }}></div>

            {/* Nutrition accordion skeleton */}
            <div className="skeleton-box" style={{ width: '100%', height: '60px' }}></div>
          </Col>

          <Col>
            {/* Instructions heading skeleton */}
            <div className="skeleton-box mb-3" style={{ width: '150px', height: '32px' }}></div>

            {/* Instructions skeleton */}
            <div className="flex flex-col gap-4 pt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <div
                    className="skeleton-box rounded-circle"
                    style={{ width: '32px', height: '32px', flexShrink: 0 }}
                  ></div>
                  <div className="flex-1">
                    <div className="skeleton-box mb-2" style={{ width: '100%', height: '18px' }}></div>
                    <div className="skeleton-box" style={{ width: '85%', height: '18px' }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Start cooking button skeleton */}
            <div className="skeleton-box mt-3" style={{ width: '250px', height: '50px' }}></div>
          </Col>
        </Row>
      </div>
    </Container>
);

export default RecipeSkeleton;
