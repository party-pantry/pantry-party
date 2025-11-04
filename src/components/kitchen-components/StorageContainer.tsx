//* * This component is a card that represents each storage space. A single storage space will include
//   an IngredientsTable (list of ingredients in the storage space.
//   Note: a single location (i.e. home) can have multiple storage spaces
//   (i.e. fridge, freezer, pantry, spice rack, etc.)
// */

import React from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { BsPencilSquare } from 'react-icons/bs';
import EditPantryModal, { StorageInfo } from './EditPantryModal';

// TODO: Add type prop for StorageContainer

interface StorageContainerProps {
  // Might be good to have an id prop to keep track of containers
  // eslint-disable-next-line react/require-default-props
  id?: string;
  title: React.ReactNode;
  children: React.ReactNode;
  feature: React.ReactNode;
  onUpdate: () => void;
  storageInfo: StorageInfo;
}

const StorageContainer: React.FC<StorageContainerProps> = ({ id, title, children, feature, onUpdate, storageInfo }) => {
  const [showEditModal, setShowEditModal] = React.useState(false);

  return (
    <Card
      id={id}
      border=""
      className="shadow-lg  mb-5"
      style={{ borderRadius: '2rem', overflow: 'hidden' }}
    >
    {/* Note: rounded-4 = larger border radius
            Other options: rounded-pill
            or style={{ borderRadius: "2rem" }} */
        }
    <Card.Header
      className="fs-4 fw-bold text-white ml pb-0 "
      style={{
        backgroundColor: '#3A5B4F',
      }}
    >
      <Row>
        <Col className="d-flex align-items-center">
          <h2 className="ml-4 mb-0 mt-2 d-flex align-items-center">
            {title}
            <Button
              variant="link"
              className="text-white ms-2 p-0"
              onClick={() => {
                setShowEditModal(true);
              }}
              aria-label="Edit storage"
            >
              <BsPencilSquare size={18} />
            </Button>
          </h2>
        </Col>
        <Col className="d-flex justify-content-end align-items-center mt-2 mr-2">
          {feature}
        </Col>
      </Row>

    </Card.Header>
    <Card.Body
      className="p-4 pt-2  d-flex flex-col"
      style={{
        backgroundColor: '#3A5B4F',
      }}
    >
      {children}
    </Card.Body>
    <EditPantryModal
      show={showEditModal}
      onClose={() => setShowEditModal(false)}
      onSave={async () => {
        setShowEditModal(false);
        if (onUpdate) {
          await onUpdate();
        }
      }}
      pantry={storageInfo}
    />

  </Card>
  );
};

export default StorageContainer;
