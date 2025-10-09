/* eslint-disable max-len */

import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

interface CustomAlertProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'secondary';
  position?: 'top-start' | 'top-center' | 'top-end' | 'middle-start' | 'middle-center' | 'middle-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';
  autoHide?: boolean;
  delay?: number;
  closable?: boolean;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  show,
  onClose,
  title,
  message,
  variant = '',
  position = 'top-end',
  autoHide = true,
  delay = 10000,
  closable = true,
}) => {
  const [showToast, setShowToast] = useState(show);

  useEffect(() => {
    setShowToast(show);
  }, [show]);

  const handleClose = () => {
    setShowToast(false);
    onClose();
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-success text-white';
      case 'danger':
        return 'bg-danger text-white';
      case 'warning':
        return 'bg-warning text-dark';
      case 'info':
        return 'bg-info text-white';
      case 'primary':
        return 'bg-primary text-white';
      case 'secondary':
        return 'bg-secondary text-white';
      default:
        return 'bg-light text-dark';
    }
  };

  return (
        <ToastContainer
            position={position}
            className="p-3"
            style={{ zIndex: 9999 }}
        >
            <Toast
                show={showToast}
                onClose={handleClose}
                autohide={autoHide}
                delay={delay}
                className={`${getVariantClasses()} border-0`}
            >
                <Toast.Header closeButton={closable} className={getVariantClasses()}>
                    <strong className="me-auto">{title}</strong>
                </Toast.Header>
                <Toast.Body>
                    {message}
                </Toast.Body>
            </Toast>
        </ToastContainer>
  );
};

export default CustomAlert;
