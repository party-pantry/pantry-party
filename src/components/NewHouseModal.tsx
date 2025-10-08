/* eslint-disable max-len */

'use client';

import React from 'react';
import { Form, Modal } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import { addHouse } from '../lib/dbFunctions';

const NewHouseModal: React.FC<{
  show: boolean;
  handleClose: () => void;
}> = ({ show, handleClose }) => {
  const [houseName, setHouseName] = React.useState('');

  const userId = (useSession().data?.user as { id?: number })?.id;

  return (
    <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New House</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
          }}>
            <Form.Group className="mb-3" controlId="houseName">
              <Form.Label>House Name</Form.Label>
              <Form.Control
                type="text"
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                placeholder="Enter a name for your house"
              />

          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={handleClose}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={() => addHouse({ name: houseName, userId: userId as number }).then(handleClose)}>
          Add House
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewHouseModal;
