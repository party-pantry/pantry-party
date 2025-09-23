'use client';

import { signOut } from 'next-auth/react';
import { Modal, Button } from 'react-bootstrap';

interface Props {
    show: boolean;
    onHide: () => void;
}

const SignOutModal: React.FC<Props> = ({ show, onHide }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header style={{ borderBottom: "none", paddingBottom: "0px" }} closeButton />
            <Modal.Body className="text-center">
                <h5 className="text-center mb-4"><strong>Are you sure you want to sign out?</strong></h5>
                <div className="sign-out-buttons">
                    <Button variant="dark" onClick={() => signOut({ callbackUrl: '/', redirect: true })}><strong>Yes, Sign Out</strong></Button>
                    <Button variant="danger" onClick={onHide}><strong>No</strong></Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default SignOutModal;