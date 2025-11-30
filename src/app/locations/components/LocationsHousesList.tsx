'use client';

import React, { useEffect, useState } from 'react';
import { ListGroup, Button, Spinner } from 'react-bootstrap';

interface House {
  id?: string;
  name?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface Place {
  id?: string;
  label: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
}

interface Props {
  onSelectResult?: (r: Place) => void;
  saved?: Place[];
  onSave?: (p: Place) => void;
}

const LocationsHousesList: React.FC<Props> = ({ onSelectResult, saved, onSave }) => {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/kitchen/houses');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setHouses(Array.isArray(data) ? data : []);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center">
        <Spinner animation="border" size="sm" role="status" className="me-2" />
        <div className="text-muted">Loading your house…</div>
      </div>
    );
  }

  if (!houses || houses.length === 0) {
    return <div className="text-muted">No houses found</div>;
  }

  return (
    <ListGroup variant="flush">
      {houses.map((h) => {
        const place: Place = {
          id: h.id || undefined,
          label: h.name || 'House',
          latitude: h.latitude == null ? undefined : h.latitude,
          longitude: h.longitude == null ? undefined : h.longitude,
          address: h.address || '',
        };

        const itemKey = h.id || `${h.latitude}-${h.longitude}`;
        const isSaved = place.id ? (saved ?? []).some((s) => s.id === place.id) : false;

        return (
          <ListGroup.Item
            key={itemKey}
            className="py-2 border-bottom d-flex justify-content-between align-items-center"
          >
            <Button
              variant="link"
              className="text-start p-0 flex-grow-1 text-wrap"
              onClick={() => onSelectResult?.(place)}
            >
              <div className="fw-medium">{place.label}</div>
              <div className="text-muted small">{place.address}</div>
            </Button>
            <div className="ms-2">
              {!isSaved && (
                <Button size="sm" variant="primary" onClick={() => onSave?.(place)}>
                  Save
                </Button>
              )}
            </div>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};

export default LocationsHousesList;
