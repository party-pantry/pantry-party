'use client';

import React from 'react';
import { ListGroup, Spinner, Button } from 'react-bootstrap';
import { Plus, Check } from 'lucide-react';
import type { Shop } from '../hooks/useShops';

interface Props {
  shops: Shop[];
  loading?: boolean;
  onSelect?: (shop: Shop) => void;
  onSave?: (shop: Shop) => void;
  savedIds?: Set<string>;
  emptyTitle?: string;
  emptyHint?: string;
}

export default function ShopsList({ shops, loading, onSelect, onSave, savedIds, emptyTitle, emptyHint }: Props) {
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading shops...</span>
        </Spinner>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <p>{emptyTitle || 'No shops found in this area.'}</p>
        <small>{emptyHint || 'Try adjusting the map or radius filter.'}</small>
      </div>
    );
  }

  return (
    <ListGroup variant="flush" as="div" className="list-group-flush">
      {shops.map((shop) => {
        const isSaved = savedIds?.has(shop.id);
        const { name, category } = shop.properties;
        const fullName = typeof name === 'string' ? name : '';

        return (
          <ListGroup.Item
            key={shop.id}
            className="d-flex justify-content-between align-items-center"
            style={{ cursor: 'pointer', border: '1px solid rgba(0,0,0,.125)', marginBottom: '-1px' }}
            onClick={() => onSelect?.(shop)}
          >
            <div style={{ overflow: 'hidden' }}>
              <div
                className="fw-bold"
                title={fullName}
                style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {fullName}
              </div>
              <div className="text-muted small">
                {category?.label || 'Store'}
              </div>
            </div>

            {onSave && (
              <Button
                size="sm"
                variant={isSaved ? 'success' : 'outline-primary'}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onSave(shop);
                }}
                aria-label={isSaved ? 'Unsave shop' : 'Save shop'}
                title={isSaved ? 'Unsave' : 'Save'}
              >
                {isSaved ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
              </Button>
            )}
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}
