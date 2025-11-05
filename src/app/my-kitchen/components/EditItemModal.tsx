import { LocalStatus, LocalUnit } from '@/lib/Units';
import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';

interface Props {
  show: boolean;
  onHide: () => void;
  onUpdateItem: (item: { name: string; quantity: number; unit: LocalUnit; status: LocalStatus }) => void;
  item?: {
    id: number;
    ingredientId: number;
    storageId: number;
    name: string;
    quantity: number;
    unit: LocalUnit;
    status: LocalStatus;
  } | null;
}

const EditItemModal: React.FC<Props> = ({ show, onHide, onUpdateItem, item }) => {
  const [formData, setFormData] = useState<{
    name: string;
    quantity: number | null;
    unit: LocalUnit;
    status: LocalStatus;
  }>({
    name: '',
    quantity: null,
    unit: '' as LocalUnit,
    status: '' as LocalStatus,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Populate form with item
  useEffect(() => {
    if (item && show) {
      setFormData({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        status: item.status,
      });
      setFieldErrors({});
      setError(null);
    }
  }, [item, show]);

  const handleClose = () => {
    setFieldErrors({});
    setError(null);
    // Reset form data after closing
    setFormData({
      name: '',
      quantity: 0,
      unit: '' as LocalUnit,
      status: '' as LocalStatus,
    });
    onHide();
  };

  const handleSave = async () => {
    if (!item) return;

    setFieldErrors({});
    setError(null);
    setLoading(true);

    // Error handling with missing form fields
    const newFieldErrors: Record<string, string> = {};

    const nameValue = String(formData.name ?? '').trim();
    if (!nameValue) newFieldErrors.name = 'Name is required.';

    const quantityValue = Number(formData.quantity);
    if (formData.quantity === null || formData.quantity <= 0) {
      newFieldErrors.quantity = 'Quantity must be greater than zero.';
    }

    const statusValue = String(formData.status ?? '').trim();
    if (!statusValue) newFieldErrors.status = 'Status must be selected.';

    // Normalize the typed unit
    const unitValue = String(formData.unit ?? '').trim();
    const allowedUnits = Object.values(LocalUnit).map((u) => String(u));
    if (!allowedUnits.includes(unitValue)) newFieldErrors.unit = 'Please choose a valid unit from the list.';

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/kitchen/stocks/${item.ingredientId}/${item.storageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newName: nameValue,
          quantity: quantityValue,
          unit: unitValue,
          status: statusValue,
        }),
      });

      if (!response.ok) {
        // Try to parse API error body
        let apiError: any = null;
        try {
          apiError = await response.json();
        } catch (e) {
          // ignore
        }

        const apiMessage = apiError?.error || apiError?.message || response.statusText || 'Unknown error from server';

        if (response.status === 400) {
          // missing required fields
          const missing: Record<string, string> = {};
          if (!nameValue) missing.name = 'Name is required.';
          if (!quantityValue) missing.quantity = 'Quantity is required.';
          if (!unitValue) missing.unit = 'Unit is required.';
          if (!statusValue) missing.status = 'Status is required.';
          setFieldErrors(missing);
        } else if (response.status === 404) {
          setError('Stock not found.');
        } else if (response.status === 500) {
          // Prefer storage name returned by API, otherwise fall back to storage id
          const storageNameFromApi = apiError?.storageName;
          const itemName = nameValue || 'Item';
          const storageName = storageNameFromApi || (item?.storageId ? `storage ${item.storageId}` : 'unknown storage');
          setError(`${itemName} is already in ${storageName}`);
        } else {
          setError(apiMessage);
        }

        setLoading(false);
        return;
      }

      onUpdateItem({
        name: nameValue,
        quantity: quantityValue,
        unit: unitValue as LocalUnit,
        status: statusValue as LocalStatus,
      });

      handleClose();
    } catch (err) {
      console.error('Error updating item:', err);
      setError((err as Error)?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusColorMap: Record<LocalStatus, string> = {
    [LocalStatus.GOOD]: 'bg-green-100 text-green-700',
    [LocalStatus.LOW_STOCK]: 'bg-yellow-100 text-yellow-700',
    [LocalStatus.OUT_OF_STOCK]: 'bg-red-100 text-red-700',
    [LocalStatus.EXPIRED]: 'bg-red-100 text-red-700',
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Edit Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={7}>
              <Form.Group controlId="formItemName">
              <Form.Label>Name</Form.Label>
              <Form.Control
               type="text"
               value={formData.name}
               placeholder={item?.name || 'Enter item name'}
               onChange={(e) => {
                 setFormData({ ...formData, name: e.target.value });
                 setFieldErrors({});
                 setError(null);
               }}
               isInvalid={!!fieldErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.name}
              </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId="formItemQuantity">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.quantity ?? ''}
                  placeholder={String(item?.quantity ?? '')}
                  onChange={(e) => {
                    const { value } = e.target;
                    setFormData({ ...formData,
                      quantity: value === '' ? null : Number(value) });
                    setFieldErrors({});
                    setError(null);
                  }}
                  isInvalid={!!fieldErrors.quantity}
                />
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.quantity}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formItemUnit">
                <Form.Label>Unit</Form.Label>
                {/* dropdown: user can pick from suggestions */}
                <Form.Select
                  className="no-arrow"
                  value={formData.unit}
                  onChange={(e) => {
                    setFormData({ ...formData, unit: e.target.value as LocalUnit });
                    setFieldErrors({});
                    setError(null);
                  }}
                  isInvalid={!!fieldErrors.unit}
                >
                  {Object.values(LocalUnit).map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.unit}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col className="mt-3 mb-2">
              <Form.Group controlId="formItemStatus">
                <Form.Label>Status</Form.Label>
                <div
                  className={
                    `transition-colors duration-400 rounded-md overflow-hidden 
                    border border-gray-300 ${statusColorMap[formData.status]}`
                  }
                >
                  <Form.Select
                    className="text-center bg-transparent border-0 focus:ring-0 focus:outline-none shadow-none"
                    style={{ cursor: 'pointer' }}
                    value={formData.status}
                    onChange={(e) => {
                      setFormData({ ...formData, status: e.target.value as LocalStatus });
                      setFieldErrors({});
                      setError(null);
                    }}
                    isInvalid={!!fieldErrors.status}
                  >
                    {Object.values(LocalStatus).map((statusValue) => (
                      <option key={statusValue} value={statusValue}>
                        {statusValue}
                      </option>
                    ))}
                  </Form.Select>
                </div>
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.status}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          {/* server/global error */}
          {error && (
            <Row className="mt-3">
              <Col>
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              </Col>
            </Row>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSave} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
          {loading ? ' Saving Changes...' : 'Save Changes'}
        </Button>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditItemModal;
