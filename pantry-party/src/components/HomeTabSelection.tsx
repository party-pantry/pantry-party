//** This component is a nav bar tab that allows users to navigate between different locations of 
//    storage spaces. This will support multiple locations (i.e. homes). Multiple locations can
//    have multiple storage spaces (i.e. fridge, freezer, pantry, spice rack, etc.) 
// */

import React from 'react';
import { Card, Nav } from 'react-bootstrap';
import { PlusCircle } from 'lucide-react';


interface HomeTabSelectionProps {
  // Might be good to have an id prop to keep track of containers
  id?: string;
  title: string;
  children: React.ReactNode;
}

const HomeTabSelection: React.FC<HomeTabSelectionProps> = ({ id, title, children }) => {
  return (
    <Card id={id} border="success" className="shadow-lg  mb-5">
      <Card.Header
        style={{ 
            backgroundColor: "#08981bff"
        }}
      >
        <Nav variant="tabs" defaultActiveKey="#first">
          <Nav.Item>
            <Nav.Link href="#first">{title}</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="##link">Home 2</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="#third">Home 3</Nav.Link>
          </Nav.Item>
          <PlusCircle size={32} className=" ml-auto"
                style={{ cursor: "pointer", color: "#ffffffff"}} 
           />
        </Nav>
      </Card.Header>
    <Card.Body className="p-4 mb-0"
        >{children}
    </Card.Body>
    </Card>
  );
};

export default HomeTabSelection;
