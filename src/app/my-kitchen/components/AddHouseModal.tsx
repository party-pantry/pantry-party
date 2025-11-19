'use client';

import { useSession } from 'next-auth/react';
import React from 'react';
import { Alert, Form, Modal, Spinner } from 'react-bootstrap';
import { geocodeAddress } from '@/lib/openRouteService';

interface Props {
  show: boolean;
  onHide: () => void;
  onAddHouse: (house?: { name: string; address?: string; latitude?: number; longitude?: number; userId?: number }) => void;
}

const AddHouseModal: React.FC<Props> = ({ show, onHide, onAddHouse }) => {
  const userId = (useSession().data?.user as { id: number }).id;
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [addressInput, setAddressInput] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<Array<{ label: string; latitude: number | null; longitude: number | null }>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = React.useState<null | { label: string; latitude: number; longitude: number }>(null);
  const debounceRef = React.useRef<number | null>(null);

  const [formData, setFormData] = React.useState<{ name: string; address?: string; userId: number; latitude?: number; longitude?: number }>({
    name: '',
    address: '',
    userId,
  });

  React.useEffect(() => {
    // debounce address input and fetch suggestions
    if (!addressInput || addressInput.length < 3) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return undefined;
    }

    setLoadingSuggestions(true);
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await geocodeAddress(addressInput, 5);
        setSuggestions(res.map((s: any) => ({ label: s.label, latitude: s.latitude, longitude: s.longitude })));
      } catch (err) {
        // ignore errors for suggestions
        // eslint-disable-next-line no-console
        console.error('Suggestion fetch error', err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [addressInput]);

  const resetForm = () => {
    setFormData({ name: '', address: '', userId });
    setFieldErrors({});
    setError(null);
    setLoading(false);
    setAddressInput('');
    setSuggestions([]);
    setSelectedSuggestion(null);
    setLoadingSuggestions(false);
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFieldErrors({});
    setError(null);
    setLoading(true);

    const nextFieldErrors: Record<string, string> = {};
    if (!formData.name) nextFieldErrors.name = 'Please enter a house name.';
    // enforce address selection
    if (!selectedSuggestion || !formData.address) nextFieldErrors.address = 'Please select an address.';

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setLoading(false);
      return;
    }

    try {
      // include lat/lng if selected
      const body = {
        ...formData,
        latitude: selectedSuggestion?.latitude,
        longitude: selectedSuggestion?.longitude,
      };

      const res = await fetch('/api/kitchen/houses', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        let apiError: any = { error: 'Failed to create house' };
        try {
          apiError = await res.json();
        } catch (parseErr) {
          // ignore
        }

        if (res.status === 400) {
          if (apiError?.error?.toString().toLowerCase().includes('missing')) {
            setFieldErrors({ name: apiError.error });
          } else {
            setError(apiError.error || 'Invalid input');
          }
        } else if (res.status === 409) {
          const houseName = apiError?.houseName || formData.name;
          setFieldErrors({ name: 'House already exists' });
          setError(`${houseName} already exists`);
        } else {
          setError(apiError?.error || 'Failed to create house');
        }

        setLoading(false);
        return;
      }

  const created = await res.json();
  onAddHouse(created || formData);
      // close and reset
      handleClose();
    } catch (err) {
      setError('Network error — please try again');
      // eslint-disable-next-line no-console
      console.error('Error adding house:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header style={{ borderBottom: 'none', paddingBottom: '0px' }} closeButton />
      <Modal.Body>
        <Modal.Title className="text-center" >Add House</Modal.Title>
        {error && (
          <Alert variant="danger">{error}</Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="houseName" className="mb-3">
            <Form.Label>House Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter house name"
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              isInvalid={!!fieldErrors.name}
            />
            <Form.Control.Feedback type="invalid">
              {fieldErrors.name}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="houseAddress" className="mb-3" style={{ position: 'relative' }}>
            <Form.Label>House Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="2500 Campus Road..."
              value={addressInput || formData.address}
              onChange={e => {
                const v = e.target.value;
                setAddressInput(v);
                setFormData(f => ({ ...f, address: v }));
                setSelectedSuggestion(null);
                setFieldErrors(fe => ({ ...fe, address: '' }));
                // trigger suggestions via effect
              }}
              required
              isInvalid={!!fieldErrors.address}
            />
            <Form.Control.Feedback type="invalid">
              {fieldErrors.address}
            </Form.Control.Feedback>

            {/* Suggestions dropdown */}
            {loadingSuggestions && <div style={{ position: 'absolute', zIndex: 30, background: '#fff', width: '100%', padding: '0.5rem' }}>Searching...</div>}
            {!loadingSuggestions && suggestions.length > 0 && !selectedSuggestion && (
              <div style={{ position: 'absolute', zIndex: 30, background: '#fff', width: '100%', border: '1px solid #ccc', maxHeight: '200px', overflowY: 'auto' }}>
                {suggestions.map((s, idx) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div
                    key={`${s.label}-${idx}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (s.latitude == null || s.longitude == null) return;
                      setSelectedSuggestion({ label: s.label, latitude: s.latitude, longitude: s.longitude });
                      setFormData(f => ({ ...f, address: s.label, latitude: s.latitude ?? undefined, longitude: s.longitude ?? undefined }));
                      setAddressInput(s.label);
                      setSuggestions([]);
                    }}
                    onKeyDown={() => {}}
                    style={{ padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            )}
          </Form.Group>
          <button
            className="btn btn-success"
            style={{ margin: '0 auto', display: 'block' }}
            type="submit"
          >
            {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            {loading ? ' Adding...' : 'Add House'}
          </button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddHouseModal;
