'use client';

import React from 'react';
import { Button, Modal } from 'react-bootstrap';

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
  // const [dontShowAgain, setDontShowAgain] = useState(false);
  // const [dontShow, setDontShow] = useState(false);
  // const autoDeleteRunRef = useRef(false);

  // Handle deletion with modal
  const handleDelete = async () => {
    if (!item) return;

    // if (dontShowAgain) {
    //   try {
    //     localStorage.setItem('dontShowDeleteModal', 'true');
    //     setDontShow(true);
    //   } catch (e) {
    //     // ignore localStorage errors
    //   }
    // }

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

  // Read the user's preference from localStorage once on mount.
  // useEffect(() => {
  //   try {
  //     const val = localStorage.getItem('dontShowDeleteModal');
  //     setDontShow(val === 'true');
  //   } catch (e) {
  //     // localStorage may be unavailable in some environments; default to false
  //     setDontShow(false);
  //   }
  // }, []);

  // Auto-delete when the parent requests the modal (show === true) and the
  // user previously opted out of the modal. Use a ref to ensure the auto-delete
  // only runs once per show event and doesn't double-run on re-renders.
  // useEffect(() => {
  //   if (!show || !dontShow) return;
  //   if (autoDeleteRunRef.current) return;
  //   autoDeleteRunRef.current = true;

  //   (async () => {
  //     if (!item) return;
  //     try {
  //       await fetch(`/api/kitchen/stocks/${item.ingredientId}/${item.storageId}`, {
  //         method: 'DELETE',
  //       });
  //       onDelete();
  //     } catch (error) {
  //       console.error('Error auto-deleting item:', error);
  //     } finally {
  //       onClose();
  //     }
  //   })();

  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [show, item, dontShow]);

  // Reset the auto-delete tracking when the modal is closed so future opens
  // useEffect(() => {
  //   if (!show) {
  //     autoDeleteRunRef.current = false;
  //   }
  // }, [show]);

  if (!show) {
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
      <Modal.Header className="border-0" closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete this item?</p>
      </Modal.Body>
      <Modal.Footer className="border-0">
        {/* <label style={{ marginRight: 'auto' }}>
          <Form.Check>
            <Form.Check.Input
              type='checkbox'
              checked={dontShowAgain}
              onChange={() => setDontShowAgain(!dontShowAgain)}
            />
            <Form.Check.Label style={{ marginLeft: '0.5rem' }}> Don&apos;t show this again </Form.Check.Label>
          </Form.Check>
        </label> */}
        <Button variant="danger" onClick={handleDelete}>Delete</Button>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteItemModal;
