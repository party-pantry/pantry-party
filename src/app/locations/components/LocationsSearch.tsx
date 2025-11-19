'use client';

import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import LocationsSearch from './LocationsSearchBar';
import LocationsResults from './LocationsResults';
import LocationsSavedList from './LocationsSavedList';
import LocationsHousesList from './LocationsHousesList';

interface Place {
  id?: string;
  label: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  distance?: number;
}

interface Props {
  onSearch?: (term: string) => void;
  loading?: boolean;
  suggestions?: Place[];
  onSelectSuggestion?: (s: Place) => void;
  onSelectResult?: (r: Place) => void;
  savedPlaces?: Place[];
  onSave?: (p: Place) => void;
  onRemoveSaved?: (id: string) => void;
}

const LocationsFilter: React.FC<Props> = ({
  onSearch,
  loading,
  suggestions,
  onSelectSuggestion,
  onSelectResult,
  savedPlaces,
  onSave,
  onRemoveSaved,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const saved = savedPlaces ?? [];

  return (
        <div className="p-3">
            <Tabs defaultActiveKey="results" id="locations-filter-tabs" className="mb-3 medium">
                <Tab eventKey="results" title={<span className="medium px-1">Search</span>}>
                    <div className="mb-3">
                        <LocationsSearch
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            onSearch={(t) => onSearch?.(t)}
                            loading={loading}
                            suggestions={suggestions}
                            onSelectSuggestion={onSelectSuggestion}
                        />
                    </div>

                    <LocationsResults loading={loading} suggestions={suggestions} saved={saved} onSelectResult={onSelectResult} onSave={onSave} />
                </Tab>
                <Tab eventKey="saved" title={<span className="medium px-1">Saved</span>}>
                    <LocationsSavedList saved={saved} onSelectResult={onSelectResult} onRemoveSaved={onRemoveSaved} />
                </Tab>
                <Tab eventKey="houses" title={<span className="medium px-1">Houses</span>}>
                    <LocationsHousesList onSelectResult={onSelectResult} />
                </Tab>
            </Tabs>
        </div>
  );
};

export default LocationsFilter;
