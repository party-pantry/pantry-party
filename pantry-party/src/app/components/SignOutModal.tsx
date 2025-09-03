'use client';

import { Modal, Button } from 'react-bootstrap';

interface Props {
    show: boolean;
    onHide: () => void;
}

const SignOutModal: React.FC<Props> = ({ show, onHide }) => {

    return (
        <>
            <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered contentClassName="custom-modal">
                <Modal.Header style={{ borderBottom: "none", paddingBottom: "0px" }} closeButton />
                <Modal.Body className="text-center">
                    <h4>Are You Sure You Want To Sign Out?</h4>
                    <div className="sign-out-buttons">
                        <Button variant="danger" style={{ width: "125px" }}>No</Button>
                        <Button variant="primary" style={{ width: "125px" }}>Yes, Sign Out</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default SignOutModal;