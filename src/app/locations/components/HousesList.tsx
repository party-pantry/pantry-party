'use client';

import React from 'react';
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
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading houses...</span>
        </div>
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
    <div className="list-group list-group-flush">
      {houses.map((house) => (
        <div
          key={house.id}
          className="list-group-item list-group-item-action"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelect?.(house)}
        >
          <div className="fw-bold mb-1">{house.name}</div>
          {house.address && (
            <div className="small text-muted">
              📍 {house.address}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
