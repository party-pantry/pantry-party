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
  itemsCount?: number; // to display the total number of items
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

  // Reset pagination whenever the filtered items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  return (
    <Card
      id={id}
      border=""
      className="shadow-sm mb-4"
      style={{ borderRadius: '1rem', overflow: 'hidden' }}
    >
    <Card.Header
      className="fs-5 fw-bold text-white"
      style={{
        backgroundColor: '#3A5B4F',
      }}
    >
      <Row className="align-items-center">
        <Col className="d-flex align-items-center">
          <h5 className="mb-0 d-flex align-items-center">
            <strong style={{ fontSize: '1.5rem' }}>{title}</strong>

            <Button
              variant="link"
              className="text-white ms-2 p-0"
              onClick={() => {
                setShowEditModal(true);
              }}
              aria-label="Edit storage"
            >
              <BsPencilSquare size={16} />
            </Button>
            {collapsed && itemsCount !== undefined && (
              <span className="text-white ms-3 small"
                style={{
                  opacity: collapsed ? 0.8 : 0,
                  transition: 'opacity 0.9s ease',
                  fontSize: '0.9rem',
                }}>
                ({itemsCount} items)
              </span>
            )}
          </h5>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          {feature}
          <div
              className="d-flex align-items-center ms-2"
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={toggleCollapse}
          >
              <span className="text-white me-2 small" style={{ fontSize: '0.9rem' }}>
                {collapsed ? 'Expand' : 'Collapse'}
              </span>
              <BsChevronDown
                size={18}
                className={`transition-transform duration-300 ${
                  collapsed ? 'rotate-0' : 'rotate-180'
                } text-white`}
              />
            </div>
        </Col>
      </Row>

    </Card.Header>
    <Card.Body
      className="p-0"
      style={{
        backgroundColor: 'white',
        overflow: 'hidden',
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
        {React.cloneElement(children as any, { items: displayedItems })}
        {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3 mb-2">
          <div className="btn-group">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`btn btn-sm ${
                  currentPage === pageNum
                    ? 'btn-success text-white fw-bold'
                    : 'btn-outline-secondary'
                }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
          </div>
        </div>
        )}
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
