'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';

const defaultCenter = { lat: 20.7, lng: -157.5 };
const defaultZoom = 7.5;

type Suggestion = {
  id?: string;
  label: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  placeId?: string;
  distance?: number;
};

interface LocationsMapGoogleProps {
  onOpenFilters?: () => void;
  searchResults?: Suggestion[];
  selectedLocation?: { latitude: number; longitude: number } | null;
  selectedMarkerId?: string | null;
  onMarkerClick?: (id?: string, lat?: number | null, lon?: number | null) => void;
}

// Separate component to handle map instance
const MapContent: React.FC<Omit<LocationsMapGoogleProps, 'onOpenFilters'> & {
  userLocation: { lat: number; lng: number } | null;
  showFilterPanel: boolean;
  filterType: 'all' | 'homes' | 'stores';
  radiusMiles: number;
  setShowFilterPanel: (show: boolean) => void;
  setFilterType: (type: 'all' | 'homes' | 'stores') => void;
  setRadiusMiles: (miles: number) => void;
  groceryStores: Suggestion[];
  setGroceryStores: (stores: Suggestion[]) => void;
}> = ({
  searchResults = [],
  selectedLocation = null,
  selectedMarkerId = null,
  onMarkerClick,
  userLocation,
  showFilterPanel,
  filterType,
  radiusMiles,
  setShowFilterPanel,
  setFilterType,
  setRadiusMiles,
  groceryStores,
  setGroceryStores,
}) => {
  const map = useMap();
  const [openInfoWindowId, setOpenInfoWindowId] = useState<string | null>(null);
  const [houseMarkers] = useState<Suggestion[]>([]); // TODO: Load from API
  const [selectedStoreForDirections, setSelectedStoreForDirections] = useState<string | null>(null);
  const [hasInitializedUserLocation, setHasInitializedUserLocation] = useState(false);

  // Center map on user location when first detected
  useEffect(() => {
    if (userLocation && map && !hasInitializedUserLocation) {
      map.panTo(userLocation);
      map.setZoom(13);
      setHasInitializedUserLocation(true);
    }
  }, [userLocation, map, hasInitializedUserLocation]);

  // Fly to selected location
  useEffect(() => {
    if (selectedLocation && map) {
      map.panTo({ lat: selectedLocation.latitude, lng: selectedLocation.longitude });
      map.setZoom(15);
    }
  }, [selectedLocation, map]);

  // Open info window for selected marker
  useEffect(() => {
    if (selectedMarkerId) {
      setOpenInfoWindowId(selectedMarkerId);
    }
  }, [selectedMarkerId]);

  const handleMarkerClick = useCallback(
    (suggestion: Suggestion) => {
      if (onMarkerClick && suggestion.id) {
        onMarkerClick(suggestion.id, suggestion.latitude, suggestion.longitude);
      }
      setOpenInfoWindowId(suggestion.id || null);
    },
    [onMarkerClick]
  );

  // Calculate distance between two points (Haversine formula)
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter markers based on radius and type
  const getFilteredMarkers = useCallback(() => {
    const center = userLocation || defaultCenter;
    const radiusMeters = radiusMiles * 1609.34;

    const allMarkers = filterType === 'stores' 
      ? groceryStores 
      : filterType === 'homes' 
      ? houseMarkers 
      : [...searchResults, ...houseMarkers, ...groceryStores];

    if (!showFilterPanel && filterType === 'all') {
      return allMarkers;
    }

    return allMarkers.filter((marker) => {
      // Radius filter (only when filter panel is shown)
      if (showFilterPanel && marker.latitude != null && marker.longitude != null) {
        const distance = getDistance(
          center.lat,
          center.lng,
          marker.latitude,
          marker.longitude
        );
        return distance <= radiusMeters;
      }

      return true;
    });
  }, [searchResults, houseMarkers, groceryStores, filterType, radiusMiles, showFilterPanel, userLocation]);

  const filteredMarkers = getFilteredMarkers();

  // Search for nearby grocery stores when user location is available and stores filter is active
  useEffect(() => {
    if (!userLocation || filterType !== 'stores') return;

    const fetchNearbyStores = async () => {
      try {
        const { Place } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
        
        const request = {
          fields: ['displayName', 'location', 'formattedAddress', 'id'],
          includedTypes: ['supermarket'],
          maxResultCount: 20,
          locationRestriction: {
            center: userLocation,
            radius: radiusMiles * 1609.34, // Convert miles to meters
          },
        };

        // @ts-ignore - New Places API types may not be fully available
        const { places } = await Place.searchNearby(request);

        if (places && places.length > 0) {
          const stores: Suggestion[] = places.map((place: any, index: number) => {
            const lat = place.location?.lat() || null;
            const lng = place.location?.lng() || null;
            const uniqueId = place.id || `store-${lat}-${lng}-${index}`;
            
            return {
              id: uniqueId,
              label: place.displayName || 'Unknown Store',
              latitude: lat,
              longitude: lng,
              address: place.formattedAddress || '',
              placeId: place.id,
              distance: lat && lng
                ? getDistance(userLocation.lat, userLocation.lng, lat, lng)
                : undefined,
            };
          });
          
          // Sort by distance
          stores.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          setGroceryStores(stores);
        } else {
          setGroceryStores([]);
        }
      } catch (error) {
        console.error('Error fetching nearby stores:', error);
        setGroceryStores([]);
      }
    };

    fetchNearbyStores();
  }, [userLocation, filterType, radiusMiles]);

  // Function to get directions
  const getDirections = useCallback((store: Suggestion) => {
    if (!userLocation || !store.latitude || !store.longitude) return;

    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = `${store.latitude},${store.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    
    window.open(url, '_blank');
  }, [userLocation]);

  return (
    <>
      {/* User location marker */}
      {userLocation && (
        <AdvancedMarker position={userLocation} zIndex={1000}>
          <div className="user-location-marker">
            <div className="user-location-pulse"></div>
            <div className="user-location-dot"></div>
          </div>
        </AdvancedMarker>
      )}

      {/* Search result and house markers */}
      {filteredMarkers.map((marker, index) => {
        if (marker.latitude == null || marker.longitude == null) return null;

        const position = { lat: marker.latitude, lng: marker.longitude };
        const isSelected = selectedMarkerId === marker.id;
        const isHouse = houseMarkers.includes(marker);
        const isGroceryStore = groceryStores.includes(marker);
        
        // Ensure unique key even if marker.id is missing
        const markerKey = marker.id || `marker-${marker.latitude}-${marker.longitude}-${index}`;

        return (
          <React.Fragment key={markerKey}>
            <AdvancedMarker
              position={position}
              onClick={() => handleMarkerClick(marker)}
            >
              <Pin
                background={isSelected ? '#FFD700' : isGroceryStore ? '#34A853' : isHouse ? '#4285F4' : '#EA4335'}
                borderColor={isSelected ? '#FFA500' : isGroceryStore ? '#2D8E47' : isHouse ? '#1967D2' : '#C5221F'}
                glyphColor="#fff"
                scale={isSelected ? 1.3 : 1}
              />
            </AdvancedMarker>

            {/* Info window */}
            {openInfoWindowId === marker.id && (
              <InfoWindow
                position={position}
                onCloseClick={() => setOpenInfoWindowId(null)}
              >
                <div className="info-window-content">
                  <h6 className="mb-1">{marker.label}</h6>
                  {marker.address && (
                    <p className="mb-0 small text-muted">{marker.address}</p>
                  )}
                  {marker.distance && (
                    <p className="mb-2 small text-muted">
                      {(marker.distance / 1609.34).toFixed(2)} miles away
                    </p>
                  )}
                  {isGroceryStore && userLocation && (
                    <button
                      className="btn btn-sm btn-primary w-100"
                      onClick={() => getDirections(marker)}
                    >
                      Get Directions
                    </button>
                  )}
                </div>
              </InfoWindow>
            )}
          </React.Fragment>
        );
      })}

      {/* Custom Controls */}
      <div className="map-controls">
        {/* Center on User Location Button */}
        {userLocation && (
          <button
            onClick={() => {
              if (map) {
                map.panTo(userLocation);
                map.setZoom(14);
              }
            }}
            className="btn btn-light shadow-sm mb-2 location-btn"
            title="Center on my location"
            aria-label="Center on my location"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
        {/* Filter Button */}
        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="btn btn-light shadow-sm mb-2 filter-btn"
          title="Filter"
          aria-label="Toggle filter panel"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" />
          </svg>
        </button>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="filter-panel bg-white shadow rounded p-3">
          <div className="mb-2">
            <strong>Find Locations</strong>
          </div>
          <div className="mb-2">
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="filter-type"
                id="filter-all"
                value="all"
                checked={filterType === 'all'}
                onChange={(e) => setFilterType(e.target.value as any)}
              />
              <label className="form-check-label" htmlFor="filter-all">
                All
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="filter-type"
                id="filter-homes"
                value="homes"
                checked={filterType === 'homes'}
                onChange={(e) => setFilterType(e.target.value as any)}
              />
              <label className="form-check-label" htmlFor="filter-homes">
                Homes
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="filter-type"
                id="filter-stores"
                value="stores"
                checked={filterType === 'stores'}
                onChange={(e) => setFilterType(e.target.value as any)}
              />
              <label className="form-check-label" htmlFor="filter-stores">
                Grocery Stores
              </label>
            </div>
          </div>
          {filterType === 'stores' && !userLocation && (
            <div className="alert alert-info small py-2 px-2 mb-2">
              Enable location to find nearby grocery stores
            </div>
          )}
          {filterType === 'stores' && groceryStores.length > 0 && (
            <div className="mb-2 small text-muted">
              Found {groceryStores.length} grocery store{groceryStores.length !== 1 ? 's' : ''} nearby
            </div>
          )}
          <div className="mb-2">
            <label className="form-label mb-1" htmlFor="filter-radius">Search Radius (miles)</label>
            <input
              type="range"
              min="0.5"
              max="25"
              step="0.5"
              value={radiusMiles}
              onChange={(e) => setRadiusMiles(Number(e.target.value))}
              className="form-range"
              id="filter-radius"
              aria-label="Filter radius in miles"
            />
            <div className="text-muted small">
              {radiusMiles === 1 ? '1 mile' : `${radiusMiles.toFixed(1)} miles`}
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setFilterType('all');
                setRadiusMiles(1);
              }}
            >
              Clear
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setShowFilterPanel(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .info-window-content {
          min-width: 150px;
        }

        .map-controls {
          position: absolute;
          bottom: 20px;
          right: 10px;
          z-index: 1000;
        }

        .filter-btn, .location-btn {
          width: 40px;
          height: 40px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 2px;
        }

        .filter-panel {
          position: absolute;
          bottom: 70px;
          right: 10px;
          z-index: 1000;
          min-width: 220px;
        }

        .user-location-marker {
          position: relative;
          width: 20px;
          height: 20px;
        }

        .user-location-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 16px;
          height: 16px;
          background: #4285F4;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          z-index: 2;
        }

        .user-location-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: rgba(66, 133, 244, 0.3);
          border-radius: 50%;
          animation: pulse 2s ease-out infinite;
          z-index: 1;
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

const LocationsMapGoogle: React.FC<LocationsMapGoogleProps> = ({
  searchResults = [],
  selectedLocation = null,
  selectedMarkerId = null,
  onMarkerClick,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'homes' | 'stores'>('all');
  const [radiusMiles, setRadiusMiles] = useState(1);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [groceryStores, setGroceryStores] = useState<Suggestion[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      console.log('Requesting user location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log('User location detected:', location);
          setUserLocation(location);
          setLocationError(null);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Unable to get your location. Please enable location services.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="alert alert-warning">
          Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file.
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['places']}>
      <div className="locations-map-container">
        {locationError && (
          <div className="alert alert-warning location-error-alert">
            {locationError}
          </div>
        )}
        <Map
          mapId="locations-map"
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
          clickableIcons={false}
        >
          <MapContent
            searchResults={searchResults}
            selectedLocation={selectedLocation}
            selectedMarkerId={selectedMarkerId}
            onMarkerClick={onMarkerClick}
            userLocation={userLocation}
            showFilterPanel={showFilterPanel}
            filterType={filterType}
            radiusMiles={radiusMiles}
            setShowFilterPanel={setShowFilterPanel}
            setFilterType={setFilterType}
            setRadiusMiles={setRadiusMiles}
            groceryStores={groceryStores}
            setGroceryStores={setGroceryStores}
          />
        </Map>

        <style jsx>{`
          .locations-map-container {
            width: 100%;
            height: 100%;
            position: relative;
          }

          .location-error-alert {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            margin-top: 1rem;
            z-index: 1001;
            max-width: 400px;
          }
        `}</style>
      </div>
    </APIProvider>
  );
};

export default LocationsMapGoogle;
