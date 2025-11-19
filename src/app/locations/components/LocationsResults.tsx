/* eslint-disable radix */

'use client';

import React from 'react';
import { ListGroup, Button, Spinner } from 'react-bootstrap';

interface Place {
    id?: string;
    label: string;
    latitude?: number | null;
    longitude?: number | null;
    address?: string;
    distance?: number;
}

interface Props {
    loading?: boolean;
    suggestions?: Place[];
    saved?: Place[];
    onSelectResult?: (r: Place) => void;
    onSave?: (p: Place) => void;
}

const LocationsResults: React.FC<Props> = ({ loading, suggestions, saved = [], onSelectResult, onSave }) => {
    if (loading) {
        return (
            <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" role="status" className="me-2" />
                <div className="text-muted">Searching…</div>
            </div>
        );
    }

    if (!suggestions || suggestions.length === 0) {
        return <div className="text-muted">Try searching for an address or place</div>;
    }

    return (
        <ListGroup variant="flush" className="mt-2">
            {suggestions.map((r) => {
                const isSaved = r.id ? saved.some((s) => s.id === r.id) : false;
                return (
                    <ListGroup.Item key={r.id || `${r.label}-${r.latitude}-${r.longitude}`} className="py-2 border-bottom">
                        <div className="d-flex justify-content-between align-items-start">
                            <Button variant="link" className="text-start p-0 flex-grow-1 text-wrap" onClick={() => onSelectResult?.(r)}>
                                <div className="fw-medium">{r.label}</div>
                                <div className="text-muted small">
                                    {r.address || (r.latitude != null && r.longitude != null ? `${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}` : 'Unknown location')}
                                </div>
                            </Button>
                            <div className="ms-2 text-end">
                                {!isSaved && (
                                    <Button size="sm" variant="primary" onClick={() => onSave?.(r)}>
                                        Save
                                    </Button>
                                )}
                            </div>
                        </div>
                    </ListGroup.Item>
                );
            })}
        </ListGroup>
    );
};

export default LocationsResults;
