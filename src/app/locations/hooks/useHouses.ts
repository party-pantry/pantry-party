'use client';

import { useState, useEffect } from 'react';

export interface House {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
}

/**
 * Hook to fetch user's houses from the kitchen API
 */
export function useHouses() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHouses = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/kitchen/houses');
        if (response.ok) {
          const data = await response.json();
          setHouses(data || []);
        }
      } catch (error) {
        // Failed to fetch houses, will retry on next mount
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, []);

  return { houses, loading };
}
