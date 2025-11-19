'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Offcanvas from 'react-bootstrap/Offcanvas';
import LocationsFilter from './LocationsSearch';

const LocationsMap = dynamic(() => import('@/app/locations/components/LocationsMap'), { ssr: false });

const Locations = () => {
    const [showFilter, setShowFilter] = useState(false);
    const [searchResults, setSearchResults] = useState<Array<{ id?: string; label: string; latitude?: number | null; longitude?: number | null; address?: string; distance?: number }>>([]);
    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
    const [savedPlaces, setSavedPlaces] = useState<Array<{ id?: string; label: string; latitude?: number | null; longitude?: number | null; address?: string }>>([]);
    

    const [loading, setLoading] = useState(false);

    // TODO: Replace local storage with actual database persistence
    const SAVED_KEY = 'pp_saved_places_v1';

    useEffect(() => {
        try {
            const raw = localStorage.getItem(SAVED_KEY);
            if (raw) {
                setSavedPlaces(JSON.parse(raw));
            }
        } catch (e) {
            // ignore
        }
    }, []);

    const persistSaved = (next: typeof savedPlaces) => {
        setSavedPlaces(next);
        try {
            localStorage.setItem(SAVED_KEY, JSON.stringify(next));
        } catch (e) {
            // ignore
        }
    };

    // TODO: Replace with actual API call and remove mock results
    const handleSearch = (term: string) => {
        if (!term || term.trim().length < 1) {
            setSearchResults([]);
            return;
        }

        setLoading(true);

        const mockResults = [
            {
                id: 'the-market',
                label: 'The Market',
                latitude: 21.294423278944713,
                longitude: -157.81309753901127,
                address: '2585 Dole St, Honolulu, HI 96822',
            },
            {
                id: 'foodland',
                label: 'Foodland',
                latitude: 21.289202387992074,
                longitude: -157.8136890852824,
                address: '2939 Harding Ave, Honolulu, HI 96816',
            },
            {
                id: 'safeway',
                label: 'Safeway',
                latitude: 21.285084964092764,
                longitude: -157.81459295407825,
                address: '888 Kapahulu Ave, Honolulu, HI 96816',
            },
            {
                id: 'nijiya',
                label: 'Nijiya Market University Store',
                latitude: 21.29283310586927,
                longitude: -157.8199242525803,
                address: '1009 University Ave #101, Honolulu, HI 96826',
            },
            {
                id: 'target',
                label: 'Target',
                latitude: 21.278859851385334,
                longitude: -157.82521383553157,
                address: '2345 Kūhiō Ave., Honolulu, HI 96815',
            },
        ];

        setSearchResults(mockResults);
        setLoading(false);
    };

    const handleSelectResult = (r: { id?: string; latitude?: number | null; longitude?: number | null }) => {
        if (r.latitude == null || r.longitude == null) return;
        if (r.id) setSelectedMarkerId(r.id);
        setSelectedLocation({ latitude: r.latitude, longitude: r.longitude });
        setShowFilter(false);
    };

    const handleMarkerClick = (id: string | undefined, lat?: number | null, lon?: number | null) => {
        if (!id) return;
        setSelectedMarkerId(id);
        if (lat != null && lon != null) setSelectedLocation({ latitude: lat, longitude: lon });
        setShowFilter(false);
    };

    const handleSave = (p?: { id?: string; label: string; latitude?: number | null; longitude?: number | null; address?: string }) => {
        if (!p || !p.id) return;
        if (savedPlaces.find((s) => s.id === p.id)) return;
        const next = [...savedPlaces, p];
        persistSaved(next);
    };

    const handleRemoveSaved = (id?: string) => {
        if (!id) return;
        const next = savedPlaces.filter((s) => s.id !== id);
        persistSaved(next);
    };
    

    return (
        <main style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <LocationsMap
                    onOpenFilters={() => setShowFilter(true)}
                    searchResults={searchResults}
                    selectedLocation={selectedLocation}
                    selectedMarkerId={selectedMarkerId}
                    onMarkerClick={(id, lat, lon) => handleMarkerClick(id, lat, lon)}
                />
            </div>

            <Offcanvas show={showFilter} onHide={() => setShowFilter(false)} placement="end">
                <Offcanvas.Body>
                    <LocationsFilter
                        onSearch={handleSearch}
                        loading={loading}
                        suggestions={searchResults}
                        onSelectSuggestion={(s) => handleSelectResult(s)}
                        onSelectResult={(r) => handleSelectResult(r)}
                        savedPlaces={savedPlaces}
                        onSave={(p) => handleSave(p)}
                        onRemoveSaved={(id) => handleRemoveSaved(id)}
                    />
                </Offcanvas.Body>
            </Offcanvas>
        </main>
    );
};

export default Locations;
