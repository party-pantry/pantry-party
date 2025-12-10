'use client';

import { useState, useEffect } from 'react';

export interface House {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
}

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
        console.error('Failed to fetch houses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, []);

  return { houses, loading };
}
