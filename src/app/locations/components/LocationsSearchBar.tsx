'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { Search } from 'lucide-react';

interface Suggestion {
  id?: string;
  label: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  distance?: number;
}

interface LocationsSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch?: (term: string) => void;
  loading?: boolean;
  suggestions?: Suggestion[];
  onSelectSuggestion?: (s: Suggestion) => void;
}

const LocationsSearch: React.FC<LocationsSearchProps> = ({ searchTerm, setSearchTerm, onSearch, loading = false, suggestions = [], onSelectSuggestion }) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // debounce live search as user types
  useEffect(() => {
    const id = setTimeout(() => {
      if (searchTerm && searchTerm.trim().length > 0) {
        onSearch?.(searchTerm);
      }
    }, 350);

    return () => clearTimeout(id);
  }, [searchTerm, onSearch]);

  // hide when clicking outside or pressing Escape; toggles focus state
  useEffect(() => {
    function onDocClick(e: Event) {
      if (!wrapperRef.current) return;
      const { target } = e;
      if (!(target instanceof Node)) return;
      if (!wrapperRef.current.contains(target)) {
        setIsFocused(false);
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsFocused(false);
    }

    document.addEventListener('click', onDocClick);
    document.addEventListener('touchstart', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
        <div>
            <div ref={wrapperRef} className="position-relative" style={{ maxWidth: '100%' }}>
                <Search size={18} className="position-absolute top-50 translate-middle-y ms-2 text-muted" />
                <Form.Control
                    placeholder="Address or name..."
                    style={{ paddingLeft: '2rem', paddingRight: '2.5rem' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    aria-label="Search places"
                />

            </div>
        </div>
  );
};

export default LocationsSearch;
