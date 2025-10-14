'use client';

import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

interface Props {
  show: boolean;
  onClose: () => void;
  onDelete: () => void;
  item?: {
    id: number;
    ingredientId: number;
    storageId: number;
  }
}

const DeleteItemModal: React.FC<Props> = ({ show, onClose, onDelete, item }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Handle deletion with modal
  const handleDelete = async () => {
    if (!item) return;

    if (dontShowAgain) {
      localStorage.setItem('dontShowDeleteModal', 'true');
    }

    try {
      await fetch(`/api/kitchen/stocks/${item.ingredientId}/${item.storageId}`, {
        method: 'DELETE',
      });
      onDelete();
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      onClose();
    }
  };

  const dontShow = localStorage.getItem('dontShowDeleteModal') === 'true';

  useEffect(() => {
    if (show && dontShow) {
      (async () => {
        if (!item) return;
        try {
          await fetch(`/api/kitchen/stocks/${item.ingredientId}/${item.storageId}`, {
            method: 'DELETE',
          });
          onDelete();
        } catch (error) {
          console.error('Error auto-deleting item:', error);
        } finally {
          onClose();
        }
      })();
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, item]);

  if (!show || dontShow) {
    return null;
  }

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop="static"
      keyboard={true}
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete this item?</p>
      </Modal.Body>
      <Modal.Footer>
        <label style={{ marginRight: 'auto' }}>
        <Form.Check>
        <Form.Check.Input
          type='checkbox'
          isInvalid
          checked={dontShowAgain}
          onChange={() => setDontShowAgain(!dontShowAgain)}
        />
        <Form.Check.Label style={{ marginLeft: '0.5rem' }}> Don&apos;t show this again </Form.Check.Label>
        </Form.Check>
        </label>
        <Button onClick={handleDelete}>Delete</Button>
        <Button onClick={onClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteItemModal;
