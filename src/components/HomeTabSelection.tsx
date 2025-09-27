//* * This component is a nav bar tab that allows users to navigate between different locations of
//    storage spaces. This will support multiple locations (i.e. homes). Multiple locations can
//    have multiple storage spaces (i.e. fridge, freezer, pantry, spice rack, etc.)
// */

import React from 'react';
import { Card, Nav } from 'react-bootstrap';
// eslint-disable-next-line import/no-extraneous-dependencies
import { PlusCircle } from 'lucide-react';
import AddHouseModal from './AddHouseModal';

interface HomeTabSelectionProps {
  // Might be good to have an id prop to keep track of containers
  // eslint-disable-next-line react/require-default-props
  id?: string;
  children: React.ReactNode;
  houseArray: {
    id: number;
    name: string;
  }[];
}

const HomeTabSelection: React.FC<HomeTabSelectionProps> = ({
  id,
  children,
  houseArray = [],
}) => {
  const [showHouseModal, setShowHouseModal] = React.useState(false);
  console.log(houseArray);
  return (
    <>
      <Card id={id} border="" className="shadow-lg  mb-5">
        <Card.Header
          style={{
            backgroundColor: '#2C776D',
          }}
        >
          <Nav variant="tabs" defaultActiveKey="#first">
            {houseArray.map((house) => (
              <Nav.Item key={house.id}>
                <Nav.Link href={`#house-${house.id}`}>{house.name}</Nav.Link>
              </Nav.Item>
            ))}
            <Nav.Item className="ms-auto d-flex align-items-center">
              <PlusCircle
                size={32}
                className=" ml-auto"
                style={{ cursor: 'pointer', color: '#ffffffff' }}
                onClick={() => setShowHouseModal(true)}
              />
            </Nav.Item>
          </Nav>
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
        onAddHouse={(house) => {
          setShowHouseModal(false);
        }}
      />
    </>
  );
};

export default HomeTabSelection;
