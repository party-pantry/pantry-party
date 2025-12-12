'use client';

import React from 'react';
import { ListGroup, Spinner } from 'react-bootstrap';
import type { House } from '../hooks/useHouses';

interface Props {
  houses: House[];
  loading?: boolean;
  onSelect?: (house: House) => void;
}

export default function HousesList({ houses, loading, onSelect }: Props) {
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading houses...</span>
        </Spinner>
      </div>
    );
  }

  if (houses.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <p>No houses found.</p>
        <small>Add houses in My Kitchen to see them here.</small>
      </div>
    );
  }

  return (
    <ListGroup variant="flush" as="div" className="list-group-flush">
      {houses.map((house) => (
        <ListGroup.Item
          key={house.id}
          className=""
          style={{ cursor: 'pointer', border: '1px solid rgba(0,0,0,.125)', marginBottom: '-1px' }}
          onClick={() => onSelect?.(house)}
        >
          <div className="fw-bold mb-1">{house.name}</div>
          {house.address && (
            <div className="small text-muted">
              {house.address}
            </div>
          )}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
