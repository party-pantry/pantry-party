//* * This component is a card that represents each storage space. A single storage space will include
//   an IngredientsTable (list of ingredients in the storage space.
//   Note: a single location (i.e. home) can have multiple storage spaces
//   (i.e. fridge, freezer, pantry, spice rack, etc.)
// */

import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { BsPencilSquare, BsChevronDown } from 'react-icons/bs';
import EditPantryModal, { StorageInfo } from './EditPantryModal';



interface StorageContainerProps {
  // Might be good to have an id prop to keep track of containers
  // eslint-disable-next-line react/require-default-props
  id?: string;
  title: React.ReactNode;
  children: React.ReactNode;
  feature: React.ReactNode;
  onUpdate: () => void;
  storageInfo: StorageInfo;
  itemsCount?: number;  // to display the total number of items
  items?: any[];
}

// For pagination
const PAGE_SIZE = 5;



const StorageContainer: React.FC<StorageContainerProps> = ({ 
    id, title, children, feature, onUpdate, storageInfo, itemsCount, items = [],
  }) => {
  const [showEditModal, setShowEditModal] = React.useState(false);
  // collapse state to collapse/expand the table within the storage container
  const [collapsed, setCollapsed] = React.useState(false);
  const [maxHeight, setMaxHeight] = useState<number | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Pagination calculations
  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayedItems = items.slice(startIndex, startIndex + PAGE_SIZE);

  const toggleCollapse = () => {
    if (!bodyRef.current) return;

    if (!collapsed) {
      // Collapsing:  set height first, then animate opacity
      setMaxHeight(bodyRef.current.scrollHeight);
      // Shrink and fade out
      requestAnimationFrame(() => setMaxHeight(0));
      setOpacity(0);
    } else {
      // Expanding: set maxHeight to scrollHeight first, then fade in
      setMaxHeight(bodyRef.current.scrollHeight);
      requestAnimationFrame(() => setOpacity(1)); // fade in
    }
    setCollapsed(!collapsed);
  };

  // Update maxHeight dynamically if table content changes while expanded
  useEffect(() => {
    if (!collapsed && bodyRef.current) {
      setMaxHeight(bodyRef.current.scrollHeight);
      setOpacity(1);
    }
  }, [children, collapsed]);


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
            {collapsed && itemsCount !== undefined && (
              <span className="text-white ms-3" 
                style={{ 
                  fontSize: '1.0rem',
                  opacity: collapsed ? 0.8 : 0,
                  transition: 'opacity 0.9s ease',
                }}>
                ({itemsCount} items)
              </span>
            )}
          </h2>
        </Col>
        <Col className="d-flex justify-content-end align-items-center mt-2 mr-2">
          {feature}
          {/* Collapse button */}
          <div
              className="d-flex align-items-center ms-2"
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={toggleCollapse}
          >
              {/* Text next to arrow */}
              <span className="text-white me-2" style={{ fontSize: '1.0rem' }}>
                {collapsed ? 'Expand' : 'Collapse'}
              </span>
              {/* Rotating arrow */}
              <BsChevronDown
                size={20}
                className={`transition-transform duration-300 ${
                  collapsed ? 'rotate-0' : 'rotate-180'
                } text-white`}
              />
              
            </div>
        </Col>
      </Row>

    </Card.Header>
    <Card.Body
      className="d-flex flex-col"
      style={{
        backgroundColor: '#3A5B4F',
        overflow: 'hidden',
        padding: '1rem 1.5rem 1.5rem 2rem',
      }}
    >
    
      <div
        ref={bodyRef}
        style={{
          maxHeight: maxHeight ?? 'auto',
          opacity,
          transition: 'max-height 0.9s ease, opacity 0.5s ease',
          overflow: 'hidden',
          // padding: collapsed ? '0 1rem' : '1rem',
          transitionProperty: 'max-height, opacity, padding',
        }}
      >
        {children}
        {/* {React.cloneElement(children as any, { items: displayedItems })}
        {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <div className="btn-group">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`btn btn-sm ${
                  currentPage === pageNum
                    ? 'btn-light text-dark fw-bold'
                    : 'btn-outline-light'
                }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
          </div>
        </div>
      )} */}
      </div>
      
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
