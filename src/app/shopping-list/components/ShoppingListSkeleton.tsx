import React from 'react';
import { Container, Card, Row, Col, Placeholder } from 'react-bootstrap';

const ShoppingListSkeleton: React.FC = () => (
  <Container className="mb-12 min-h-screen mt-5" style={{ width: '95%' }}>
    {/* Header Section Skeleton */}
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
      <Placeholder as="h2" animation="glow">
        <Placeholder xs={12} style={{ width: '180px' }} className="fw-bold" />
      </Placeholder>
      <div className="d-flex gap-2">
        <Placeholder.Button variant="secondary" size="sm" style={{ width: '140px' }} />
        <Placeholder.Button variant="success" style={{ width: '120px' }} />
      </div>
    </div>

    {/* Stats Cards Skeleton */}
    <Row className="mb-4">
      {[1, 2, 3, 4].map((i) => (
        <Col key={i} md={3}>
          <Card className="text-center shadow-sm border-0" style={{ borderRadius: '1rem' }}>
            <Card.Body className="py-4">
              <Placeholder as="h3" animation="glow">
                <Placeholder xs={6} className="fs-2 mb-1" />
              </Placeholder>
              <Placeholder as={Card.Text} animation="glow">
                <Placeholder xs={8} size="sm" className="mb-0" />
              </Placeholder>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>

    {/* "Your List" Header Skeleton */}
    <Placeholder as="h4" animation="glow" className="mt-5 mb-3">
      <Placeholder xs={2} style={{ width: '100px' }} />
    </Placeholder>

    {/* Shopping Items Grid Skeleton */}
    <Row className="g-4 mb-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Col key={i} md={4} sm={6} xs={12}>
          <Card className="shopping-item-card h-100 shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <div className="d-flex gap-2">
                  <Placeholder as="span" animation="glow">
                    <Placeholder xs={6} className="rounded-pill" style={{ height: '20px', width: '60px' }} />
                  </Placeholder>
                  <Placeholder as="span" animation="glow">
                    <Placeholder xs={6} className="rounded-pill" style={{ height: '20px', width: '60px' }} />
                  </Placeholder>
                </div>
                <Placeholder as="div" animation="glow">
                  <Placeholder style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
                </Placeholder>
              </div>
              <Placeholder as="h6" animation="glow">
                <Placeholder xs={8} className="mb-1" />
              </Placeholder>
              <Placeholder as="p" animation="glow" className="mb-2">
                <Placeholder xs={5} size="sm" />
              </Placeholder>
              <div className="d-flex justify-content-between">
                <Placeholder as="span" animation="glow">
                  <Placeholder xs={4} />
                </Placeholder>
                <Placeholder as="div" animation="glow">
                  <Placeholder style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                </Placeholder>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>

    {/* Suggestions Section Skeleton */}
    <Card className="shadow-sm border-0" style={{ borderRadius: '1rem' }}>
      <Card.Header>
        <Placeholder as="h4" animation="glow">
          <Placeholder xs={6} />
        </Placeholder>
      </Card.Header>
      <Card.Body>
        <Row className="g-3">
          {[1, 2, 3].map((i) => (
            <Col md={4} key={i}>
              <Card className="border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
                <Card.Body>
                  <Placeholder as="div" animation="glow">
                    <Placeholder xs={9} className="mb-2" />
                    <Placeholder xs={7} size="sm" className="mb-2" />
                    <Placeholder xs={8} size="sm" className="mb-3" />
                    <Placeholder.Button variant="primary" xs={12} />
                  </Placeholder>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  </Container>
);

export default ShoppingListSkeleton;
