//* * This component is a nav bar tab that allows users to navigate between different locations of
//    storage spaces. This will support multiple locations (i.e. homes). Multiple locations can
//    have multiple storage spaces (i.e. fridge, freezer, pantry, spice rack, etc.)
// */

import React, { useState } from 'react';
import { Card, Nav } from 'react-bootstrap';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MinusCircle, PlusCircle } from 'lucide-react';
import AddHouseModal from './AddHouseModal';
import EditHouseModal from './EditHouseModal';

interface HomeTabSelectionProps {
  // Might be good to have an id prop to keep track of containers
  // eslint-disable-next-line react/require-default-props
  id?: string;
  children: React.ReactNode;
  houseArray: {
    houseId: number;
    name: string;
    address?: string;
  }[];
  activeHouseId: number;
  selectActiveHouseId: (id: number) => void;
  onHouseAdded?: () => void;
}

const HomeTabSelection: React.FC<HomeTabSelectionProps> = ({
  id,
  children,
  houseArray = [],
  activeHouseId,
  selectActiveHouseId,
  onHouseAdded,
}) => {
  const [showHouseModal, setShowHouseModal] = useState(false);
  const [showEditHouseModal, setShowEditHouseModal] = useState(false);

  const handleDeleteHouse = async (houseId: number) => {
    try {
      await fetch(`/api/kitchen/houses/${houseId}`, {
        method: 'DELETE',
      });
      if (onHouseAdded) {
        await onHouseAdded();
      }
    } catch (error) {
      console.error('Error deleting house:', error);
    }
  };

  return (
    <>
      <Card id={id} border="" className="shadow-lg  mb-5">
        <Card.Header
          style={{
            backgroundColor: '#2C776D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 1rem',
          }}
        >
          <Nav
            variant="tabs"
            activeKey={activeHouseId.toString()}
            onSelect={k => selectActiveHouseId(Number(k))}
            style={{ flex: 1 }}
          >
            {houseArray.map(house => (
              <Nav.Item key={house.houseId}>
                <Nav.Link
                  eventKey={house.houseId.toString()}
                  onClick={() => setShowEditHouseModal(true)}
                >
                  {house.name}
                </Nav.Link>
              </Nav.Item>
            ))}
            </Nav>
            <Nav.Item className="ms-auto d-flex align-items-center">
              <MinusCircle
                size={32}
                className="me-3"
                style={{ cursor: 'pointer', color: '#ffffffff' }}
                onClick={() => handleDeleteHouse(activeHouseId)}
              />
              <PlusCircle
                size={32}
                className=" ml-auto"
                style={{ cursor: 'pointer', color: '#ffffffff' }}
              onClick={() => setShowHouseModal(true)}
            />
          </Nav.Item>
        </Card.Header>
        <Card.Body
          className="p-4 mb-0"
          style={{
            backgroundColor: '#DDF3F0',
          }}
        >
          {children}
        </Card.Body>
      </Card>
      <AddHouseModal
        show={showHouseModal}
        onHide={() => setShowHouseModal(false)}
        onAddHouse={async () => {
          setShowHouseModal(false);
          if (onHouseAdded) {
            await onHouseAdded();
          }
        }}
      />
      <EditHouseModal
        show={showEditHouseModal}
        onClose={() => setShowEditHouseModal(false)}
        onSave={async () => {
          setShowEditHouseModal(false);
          if (onHouseAdded) {
            await onHouseAdded();
          }
        }}
        // eslint-disable-next-line max-len
        house={houseArray.find(house => house.houseId === activeHouseId) as {
          houseId: number;
          name: string;
          address?: string;
        }}
      />
    </>
  );
};

export default HomeTabSelection;
