/* eslint-disable radix */

'use client';

import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import LocationsSearch from './LocationsSearch';
import SavedLocationsAccordion from './SavedLocationsAccordion';

const FilterPanel = () => {
  const [locationType, setLocationType] = useState('all');
  const [sortBy, setSortBy] = useState('closest');
  const [radius, setRadius] = useState(5);
  const [savedLocation, setSavedLocation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // TODO: Replace with actual saved locations from user data
  const savedLocations: { id: string; name: string; type: 'home' | 'store'; address: string; }[] = [
    { id: '1', name: 'Test1', type: 'home', address: '123 Main St' },
    { id: '2', name: 'Test2', type: 'store', address: '456 Market Ave' },
    { id: '3', name: 'Test3', type: 'home', address: '789 Office Rd' },
  ];

  // TODO: Implement actual filter logic
  const handleApply = () => {
    console.log({
      locationType,
      savedLocation,
      sortBy,
      radius,
      searchTerm,
    });
  };

  const handleReset = () => {
    setLocationType('all');
    setSavedLocation(null);
    setSortBy('closest');
    setRadius(5);
  };

  return (
    <Card className="p-3 shadow-sm rounded-4 bg-white border-0">
        <Card.Body>
            <Form.Group className="mb-3">
                <div className="mb-3">
                    <LocationsSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </div>

                <Form.Label className="fw-semibold text-secondary">Filter by Type</Form.Label>
                <div className="d-flex gap-3 mb-3">
                    <Form.Check
                        type="radio"
                        label="All"
                        name="type"
                        checked={locationType === 'all'}
                        onChange={() => setLocationType('all')}
                    />
                    <Form.Check
                        type="radio"
                        label="Homes"
                        name="type"
                        checked={locationType === 'homes'}
                        onChange={() => setLocationType('homes')}
                    />
                    <Form.Check
                        type="radio"
                        label="Stores"
                        name="type"
                        checked={locationType === 'stores'}
                        onChange={() => setLocationType('stores')}
                    />
                </div>

                <Form.Label className="fw-semibold text-secondary">Sort By</Form.Label>
                <div className="d-flex gap-3 mb-3">
                    <Form.Check
                        type="radio"
                        label="Closest"
                        name="sort"
                        checked={sortBy === 'closest'}
                        onChange={() => setSortBy('closest')}
                    />
                    <Form.Check
                        type="radio"
                        label="Farthest"
                        name="sort"
                        checked={sortBy === 'farthest'}
                        onChange={() => setSortBy('farthest')}
                    />
                </div>

                <Form.Label className="fw-semibold text-secondary">
                    Radius (miles)
                </Form.Label>
                <Form.Range
                    min={1}
                    max={50}
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                />
                <div className="text-muted small mb-3">{radius} miles</div>

                <SavedLocationsAccordion
                    locations={savedLocations}
                    selectedLocations={selectedLocations}
                    setSelectedLocations={setSelectedLocations}
                />

                <div className="mt-3 d-flex justify-content-between align-items-center">
                    <Button
                        variant="danger"
                        style={{ width: '100px' }}
                        onClick={handleReset}
                    >
                        Reset
                    </Button>
                    <Button
                        variant="primary"
                        style={{ width: '100px' }}
                        onClick={handleApply}
                    >
                        Apply
                    </Button>
                </div>
            </Form.Group>
        </Card.Body>
    </Card>
  );
};

export default FilterPanel;
