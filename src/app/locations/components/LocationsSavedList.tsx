'use client';

import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';

interface Place {
  id?: string;
  label: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  distance?: number;
}

interface Props {
  saved?: Place[];
  onSelectResult?: (r: Place) => void;
  onRemoveSaved?: (id: string) => void;
}

const LocationsSavedList: React.FC<Props> = ({ saved = [], onSelectResult, onRemoveSaved }) => {
  if (saved.length === 0) {
    return <div className="text-muted">No saved locations</div>;
  }

  return (
        <ListGroup variant="flush">
      {saved.map((p) => {
        const itemKey = p.id || `${p.label}-${p.latitude}-${p.longitude}`;
        const addressDisplay = p.address || (p.latitude != null && p.longitude != null
          ? `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}`
          : '');
        return (
        <ListGroup.Item key={itemKey} className="py-2 border-bottom d-flex justify-content-between align-items-center">
          <Button variant="link" className="text-start p-0 flex-grow-1 text-wrap" onClick={() => onSelectResult?.(p)}>
            <div className="fw-medium">{p.label}</div>
            <div className="text-muted small">{addressDisplay}</div>
          </Button>
          <div className="ms-2">
            <Button size="sm" variant="danger" onClick={() => p.id && onRemoveSaved?.(p.id)}>
              Remove
            </Button>
          </div>
        </ListGroup.Item>
        );
      })}
        </ListGroup>
  );
};

export default LocationsSavedList;
