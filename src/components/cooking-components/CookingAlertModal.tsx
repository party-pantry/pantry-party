/* eslint-disable max-len */

'use client';

import { Modal, Button } from 'react-bootstrap';

interface Props {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  missingIngredientsCount: number;
  totalIngredientsCount: number;
}

const CookingAlertModal: React.FC<Props> = ({ show, onHide, onConfirm, missingIngredientsCount, totalIngredientsCount }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header style={{ borderBottom: 'none', paddingBottom: '0px' }} closeButton />
    <Modal.Body className="text-center">
      <h5 className="text-center mb-4">
        <strong>Missing Ingredients Detected</strong>
      </h5>
      <p className="text-muted mb-4">
        You are missing <strong>{missingIngredientsCount}</strong> out of <strong>{totalIngredientsCount}</strong> ingredients...
        <br/>Are you sure you want to start cooking?
      </p>

      <div className="d-flex gap-4 justify-content-center">
        <Button className="w-25" variant="success" onClick={onConfirm}>
          <strong>Yes</strong>
        </Button>
        <Button className="w-25" variant="danger" onClick={onHide}>
          <strong>No</strong>
        </Button>
      </div>
    </Modal.Body>
  </Modal>
);

export default CookingAlertModal;
