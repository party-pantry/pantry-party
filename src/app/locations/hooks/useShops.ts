'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Shop {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  properties: {
    name: string;
    address?: string;
    category: { label: string; id: number };
    opening_hours?: string;
    phone?: string;
    website?: string;
    [key: string]: any;
  };
}

const CACHE_KEY = 'pantry_party_shops_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_RADIUS = 2000; // Always fetch max radius and filter client-side

export function useShops(center: { lat: number; lng: number }, radius: number) {
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter shops based on radius
  useEffect(() => {
    if (!allShops.length || !center) {
      setShops([]);
      return;
    }

    const filtered = allShops.filter((shop) => {
      const lat1 = center.lat * Math.PI / 180;
      const lat2 = shop.latitude * Math.PI / 180;
      const deltaLat = (shop.latitude - center.lat) * Math.PI / 180;
      const deltaLng = (shop.longitude - center.lng) * Math.PI / 180;

      const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = 6371000 * c; // Earth radius in meters

      return distance <= radius;
    });

    setShops(filtered);
  }, [allShops, center, radius]);

  const fetchShops = useCallback(async () => {
    if (!center) return;
    
    // Check cache first
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp, lat, lng } = JSON.parse(cached);
        // Check if cache is valid (within 24h and same general area)
        const timeDiff = Date.now() - timestamp;
        const latDiff = Math.abs(lat - center.lat);
        const lngDiff = Math.abs(lng - center.lng);
        
        if (timeDiff < CACHE_DURATION && latDiff < 0.05 && lngDiff < 0.05) {
          setAllShops(data);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to read cache:', e);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: center.lat,
          longitude: center.lng,
          buffer: MAX_RADIUS, // Always fetch max radius
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch shops: ${response.statusText}`);
      }

      const data = await response.json();
      const fetchedShops = data.shops || [];
      setAllShops(fetchedShops);
      
      // Cache the results
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: fetchedShops,
          timestamp: Date.now(),
          lat: center.lat,
          lng: center.lng,
        }));
      } catch (e) {
        console.warn('Failed to cache shops:', e);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shops');
      setAllShops([]);
    } finally {
      setLoading(false);
    }
  }, [center?.lat, center?.lng]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  return { shops, loading, error, refetch: fetchShops };
}
