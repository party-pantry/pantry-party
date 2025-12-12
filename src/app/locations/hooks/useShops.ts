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

const CACHE_KEY = 'pantry_party_overpass_24hr_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_RADIUS = 2000; // Fetch maximum radius from API

/**
 * Hook to fetch and cache shops from the API
 * Returns all shops within MAX_RADIUS - filtering by radius is done in the map component
 */
export function useShops(center: { lat: number; lng: number }) {
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = useCallback(async () => {
    if (!center || !center.lat || !center.lng) return;

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
      // Cache read failed, will fetch fresh data
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
        // Cache write failed, continue without caching
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shops');
      setAllShops([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (center && center.lat && center.lng) {
      fetchShops();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchShops, center]);

  return { shops: allShops, loading, error, refetch: fetchShops };
}
