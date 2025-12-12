'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Offcanvas, Tabs, Tab } from 'react-bootstrap';
import { useShops } from '../hooks/useShops';
import { useHouses } from '../hooks/useHouses';
import ShopsList from './ShopsList';
import HousesList from './HousesList';

const LocationsMap = dynamic(() => import('./LocationsMap'), { ssr: false });

const SAVED_SHOPS_KEY = 'pantry_party_saved_shops';
const CACHED_SHOPS_KEY = 'pantry_party_cached_shops';

/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * @returns Distance in meters
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a = (Math.sin(Δφ / 2) * Math.sin(Δφ / 2))
            + (Math.cos(φ1) * Math.cos(φ2)
            * Math.sin(Δλ / 2) * Math.sin(Δλ / 2));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function Locations() {
  const [showFilters, setShowFilters] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 21.3099, lng: -157.8581 });
  const [radius, setRadius] = useState(1000);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapFlyTo, setMapFlyTo] = useState<((lat: number, lng: number) => void) | null>(null);
  const [forcedLocation, setForcedLocation] = useState<{ id: string; latitude: number; longitude: number; type: 'shop' | 'house' } | null>(null);
  const [savedShopIds, setSavedShopIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem(SAVED_SHOPS_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [cachedShopsMap, setCachedShopsMap] = useState<Map<string, any>>(() => {
    if (typeof window === 'undefined') return new Map();
    try {
      const cached = localStorage.getItem(CACHED_SHOPS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return new Map(Object.entries(parsed));
      }
      return new Map();
    } catch {
      return new Map();
    }
  });

  const { shops: allShops, loading: shopsLoading } = useShops(mapCenter);
  const { houses, loading: housesLoading } = useHouses();

  const handleMapMove = (center: { lat: number; lng: number }, newRadius: number) => {
    setMapCenter(center);
    setRadius(newRadius);
  };

  const handleSelectShop = (shop: { id: string; latitude: number; longitude: number }) => {
    setSelectedId(shop.id);
    setForcedLocation({ id: shop.id, latitude: shop.latitude, longitude: shop.longitude, type: 'shop' });
    setShowFilters(false);

    // Fly to the selected shop location
    if (mapFlyTo) {
      mapFlyTo(shop.latitude, shop.longitude);
    }
  };

  const handleSelectHouse = (house: { id: string; latitude: number; longitude: number }) => {
    setSelectedId(house.id);
    setForcedLocation({ id: house.id, latitude: house.latitude, longitude: house.longitude, type: 'house' });
    setShowFilters(false);

    // Fly to the selected house location
    if (mapFlyTo) {
      mapFlyTo(house.latitude, house.longitude);
    }
  };

  const handleSaveShop = (shop: any) => {
    const newSaved = new Set(savedShopIds);
    const newCached = new Map(cachedShopsMap);

    if (newSaved.has(shop.id)) {
      newSaved.delete(shop.id);
    } else {
      // Cache the full shop data so it persists even when out of API range
      newSaved.add(shop.id);
      newCached.set(shop.id, shop);
    }

    setSavedShopIds(newSaved);
    setCachedShopsMap(newCached);
    localStorage.setItem(SAVED_SHOPS_KEY, JSON.stringify([...newSaved]));
    localStorage.setItem(CACHED_SHOPS_KEY, JSON.stringify(Object.fromEntries(newCached)));
  };

  // Merge API shops with cached saved shops to ensure saved shops are always available
  const allShopsMap = new Map<string, any>();
  allShops.forEach(shop => allShopsMap.set(shop.id, shop));
  cachedShopsMap.forEach((shop, id) => {
    if (savedShopIds.has(id) && !allShopsMap.has(id)) {
      allShopsMap.set(id, shop);
    }
  });
  const mergedShops = Array.from(allShopsMap.values());

  // Filter shops by current map radius for display in the shops list
  const visibleShops = mergedShops.filter((shop) => {
    const distance = calculateDistance(
      mapCenter.lat,
      mapCenter.lng,
      shop.latitude,
      shop.longitude,
    );
    return distance <= radius;
  });

  const savedShops = mergedShops.filter((shop) => savedShopIds.has(shop.id));

  return (
    <main style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <LocationsMap
          shops={mergedShops}
          houses={houses}
          onMapMove={handleMapMove}
          onOpenFilters={() => setShowFilters(true)}
          selectedId={selectedId}
          onMapReady={(flyTo) => setMapFlyTo(() => flyTo)}
          forcedLocation={forcedLocation}
          onClearForced={() => setForcedLocation(null)}
        />
      </div>

      <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="end">
        <Offcanvas.Body>
          <Tabs defaultActiveKey="shops" className="mb-3">
            <Tab eventKey="shops" title={`Shops (${visibleShops.length})`}>
              <ShopsList
                shops={visibleShops}
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
                emptyTitle={'No shops saved.'}
                emptyHint={'Try saving shops to find it here.'}
              />
            </Tab>
          </Tabs>
        </Offcanvas.Body>
      </Offcanvas>
    </main>
  );
}
