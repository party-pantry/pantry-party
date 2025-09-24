//* * This component is a card that represents each storage space. A single storage space will include
//   an IngredientsTable (list of ingredients in the storage space.
//   Note: a single location (i.e. home) can have multiple storage spaces
//   (i.e. fridge, freezer, pantry, spice rack, etc.)
// */

import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

// TODO: Add type prop for StorageContainer

interface StorageContainerProps {
  // Might be good to have an id prop to keep track of containers
  // eslint-disable-next-line react/require-default-props
  id?: string;
  title: string;
  children: React.ReactNode;
  feature: React.ReactNode;
}

const StorageContainer: React.FC<StorageContainerProps> = ({ id, title, children, feature }) => (
  <Card
    id={id}
    border="info"
    className="shadow-lg  mb-5"
    style={{ borderRadius: '2rem', overflow: 'hidden' }}
  >
    {/* Note: rounded-4 = larger border radius
            Other options: rounded-pill
            or style={{ borderRadius: "2rem" }} */
        }
    <Card.Header
      className="fs-4 fw-bold text-white ml"
      style={{
        backgroundColor: '#028383ff',
      }}
    >
      <Row>
        <Col>
          <h2 className="ml-4 mb-0 mt-2">{title}</h2>
        </Col>
        <Col className="d-flex justify-content-end align-items-center mt-2 mr-2">
          {feature}
        </Col>
      </Row>

    </Card.Header>
    <Card.Body
      className="p-4 mb-0 d-flex flex-col"
      style={{
        backgroundColor: '#03a9a9ff',
      }}
    >
      {children}
    </Card.Body>
  </Card>
);

export default StorageContainer;
