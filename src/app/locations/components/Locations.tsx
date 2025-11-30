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
  const [selectedDetails, setSelectedDetails] = useState<{ id?: string; label?: string; address?: string } | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<Array<{ id?: string; label: string; latitude?: number | null; longitude?: number | null; address?: string }>>([]);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRadius, setMapRadius] = useState<number>(1000);

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

  const handleSearch = (term: string) => {

    const doSetResults = (shops: any[]) => {
      const mapped = shops.map((s) => ({ id: s.id, label: s.label || s.name || '', latitude: s.latitude, longitude: s.longitude, address: s.properties?.address || '' }));
      setSearchResults(mapped);
    };

    // if no term, fetch shops for current map center/radius and display all
    if (!term || term.trim().length < 1) {
      if (!mapCenter) {
        setSearchResults([]);
        return;
      }
      fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: mapCenter.latitude, longitude: mapCenter.longitude, buffer: mapRadius ?? 1000 }),
      })
        .then((r) => r.ok ? r.json() : Promise.reject(r))
        .then((j) => doSetResults(j?.shops || []))
        .catch(() => { setSearchResults([]); });
      return;
    }

    // search term present: if we already have results, filter by name; otherwise fetch then filter
    const filterAndSet = (shops: any[]) => {
      const q = term.trim().toLowerCase();
      const filtered = shops.filter((s) => (s.label || s.properties?.name || '').toLowerCase().includes(q));
      doSetResults(filtered);
    };

    const fetchAndFilter = () => {
      if (!mapCenter) { setSearchResults([]); return; }
      fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: mapCenter.latitude, longitude: mapCenter.longitude, buffer: mapRadius ?? 1000 }),
      })
    .then((r) => r.ok ? r.json() : Promise.reject(r))
    .then((j) => filterAndSet(j?.shops || []))
    .catch(() => { setSearchResults([]); });
    };

    fetchAndFilter();
  };

  const handleSelectResult = (r: { id?: string; latitude?: number | null; longitude?: number | null }) => {
    if (r.latitude == null || r.longitude == null) return;
    if (r.id) setSelectedMarkerId(r.id);
    setSelectedDetails({ id: r.id, label: (r as any).label, address: (r as any).address });
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

  // NOTE: visible suggestions are driven by the map component (onVisibleShops) so
  // we do not perform a separate client-side distance filter here. The map is the
  // authoritative source of which shops are within the active radius.

  return (
        <main style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <LocationsMap
                    onOpenFilters={() => setShowFilter(true)}
                    searchResults={searchResults}
                    onVisibleShops={(shops: any[]) => {
                      try { setSearchResults(shops || []); } catch (e) { /* ignore */ }
                    }}
                    selectedLocation={selectedLocation}
                    selectedMarkerId={selectedMarkerId}
                    selectedDetails={selectedDetails}
                    onMarkerClick={(id, lat, lon) => handleMarkerClick(id, lat, lon)}
                    onMapStateChange={(center, radius) => {
                      try { setMapCenter(center); setMapRadius(Math.max(0, Math.min(2000, Number(radius || 1000)))); } catch (e) { /* ignore */ }
                    }}
                />
            </div>

            <Offcanvas show={showFilter} onHide={() => setShowFilter(false)} placement="end">
                <Offcanvas.Body>
          <LocationsFilter
            onSearch={handleSearch}
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
