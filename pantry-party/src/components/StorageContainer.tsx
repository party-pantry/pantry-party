import React from 'react';
import { Card } from 'react-bootstrap';

interface StorageContainerProps {
  // Might be good to have an id prop to keep track of containers
  id?: string;
  title: string;
  children: React.ReactNode;
}

const StorageContainer: React.FC<StorageContainerProps> = ({ id, title, children }) => {
    return (
    <Card id={id} border="info" className="shadow-lg  mb-5"
        style={{ borderRadius: "2rem", overflow: "hidden" }} 
    >
        {/* Note: rounded-4 = larger border radius 
            Other options: rounded-pill
            or style={{ borderRadius: "2rem" }} */
        }
        <Card.Header className="fs-4 fw-bold text-white ml"
            style={{ 
                backgroundColor: "#028383ff"
            }}
        >
            <h2 className="ml-4 mb-0 mt-2">{title}</h2>
        </Card.Header>
        <Card.Body className="p-4 mb-0"
            style={{ 
                backgroundColor: "#03a9a9ff"
            }}
        >{children}</Card.Body>
    </Card>
    );
};

export default StorageContainer;    