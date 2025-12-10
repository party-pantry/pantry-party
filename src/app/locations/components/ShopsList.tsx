'use client';

import React from 'react';
import type { Shop } from '../hooks/useShops';

interface Props {
  shops: Shop[];
  loading?: boolean;
  onSelect?: (shop: Shop) => void;
  onSave?: (shop: Shop) => void;
  savedIds?: Set<string>;
}

export default function ShopsList({ shops, loading, onSelect, onSave, savedIds }: Props) {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading shops...</span>
        </div>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <p>No shops found in this area.</p>
        <small>Try adjusting the map or radius filter.</small>
      </div>
    );
  }

  return (
    <div className="list-group list-group-flush">
      {shops.map((shop) => {
        const isSaved = savedIds?.has(shop.id);
        const { name, category } = shop.properties;

        return (
          <div
            key={shop.id}
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect?.(shop)}
          >
            <div>
              <div className="fw-bold">{name}</div>
              <div className="text-muted small">
                {category?.label || 'Store'}
              </div>
            </div>
            
            {onSave && (
              <button
                className={`btn btn-sm ${isSaved ? 'btn-success' : 'btn-outline-primary'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(shop);
                }}
              >
                {isSaved ? '✓' : '+'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
