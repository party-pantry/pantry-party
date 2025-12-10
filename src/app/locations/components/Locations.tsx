'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Offcanvas, Tabs, Tab } from 'react-bootstrap';
import { useShops } from '../hooks/useShops';
import { useHouses } from '../hooks/useHouses';
import ShopsList from './ShopsList';
import HousesList from './HousesList';

const LocationsMap = dynamic(() => import('./LocationsMap'), { ssr: false });

const SAVED_SHOPS_KEY = 'pp_saved_shops';

export default function Locations() {
  const [showFilters, setShowFilters] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 21.3099, lng: -157.8581 });
  const [radius, setRadius] = useState(1000);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedShopIds, setSavedShopIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem(SAVED_SHOPS_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const { shops, loading: shopsLoading } = useShops(mapCenter, radius);
  const { houses, loading: housesLoading } = useHouses();

  const handleMapMove = (center: { lat: number; lng: number }, newRadius: number) => {
    setMapCenter(center);
    setRadius(newRadius);
  };

  const handleSelectShop = (shop: { id: string; latitude: number; longitude: number }) => {
    setSelectedId(shop.id);
    setShowFilters(false);
  };

  const handleSelectHouse = (house: { id: string; latitude: number; longitude: number }) => {
    setSelectedId(house.id);
    setShowFilters(false);
  };

  const handleSaveShop = (shop: { id: string }) => {
    const newSaved = new Set(savedShopIds);
    if (newSaved.has(shop.id)) {
      newSaved.delete(shop.id);
    } else {
      newSaved.add(shop.id);
    }
    setSavedShopIds(newSaved);
    localStorage.setItem(SAVED_SHOPS_KEY, JSON.stringify([...newSaved]));
  };

  const savedShops = shops.filter((shop) => savedShopIds.has(shop.id));

  return (
    <main style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <LocationsMap
          shops={shops}
          houses={houses}
          onMapMove={handleMapMove}
          onOpenFilters={() => setShowFilters(true)}
          selectedId={selectedId}
        />
      </div>

      <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Locations</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Tabs defaultActiveKey="shops" className="mb-3">
            <Tab eventKey="shops" title={`Shops (${shops.length})`}>
              <ShopsList
                shops={shops}
                loading={shopsLoading}
                onSelect={handleSelectShop}
                onSave={handleSaveShop}
                savedIds={savedShopIds}
              />
            </Tab>
            <Tab eventKey="houses" title={`Houses (${houses.length})`}>
              <HousesList
                houses={houses}
                loading={housesLoading}
                onSelect={handleSelectHouse}
              />
            </Tab>
            <Tab eventKey="saved" title={`Saved (${savedShops.length})`}>
              <ShopsList
                shops={savedShops}
                onSelect={handleSelectShop}
                onSave={handleSaveShop}
                savedIds={savedShopIds}
              />
            </Tab>
          </Tabs>
        </Offcanvas.Body>
      </Offcanvas>
    </main>
  );
}
