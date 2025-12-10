'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createMapPinIcon } from '@/utils/locationsUtils';
import type { Shop } from '../hooks/useShops';
import type { House } from '../hooks/useHouses';

const DEFAULT_CENTER: L.LatLngExpression = [21.3099, -157.8581]; // Honolulu
const DEFAULT_ZOOM = 13;

interface Props {
  shops: Shop[];
  houses: House[];
  onMapMove?: (center: { lat: number; lng: number }, radius: number) => void;
  onOpenFilters?: () => void;
  selectedId?: string | null;
}

export default function LocationsMap({ shops, houses, onMapMove, onOpenFilters, selectedId }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const filterCircleRef = useRef<L.Circle | null>(null);
  const filterPanelRef = useRef<HTMLElement | null>(null);
  const [currentRadius, setCurrentRadius] = useState(1000);
  const [currentType, setCurrentType] = useState<'all' | 'houses' | 'shops'>('all');
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return;

    // Ensure the map container exists
    const container = document.getElementById('map');
    if (!container) {
      console.error('Map container not found');
      return;
    }

    // Check if container already has a map instance
    if ((container as any)._leaflet_id) {
      console.log('Map already initialized, skipping...');
      return;
    }

    console.log('Initializing Leaflet map...');
    const map = L.map('map', {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add custom controls (filter, search, locate)
    const ControlGroup = (L.Control as any).extend({
      options: { position: 'bottomright' },
      onAdd() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        // Filter button - opens inline panel with radius/type controls
        const filterBtn = L.DomUtil.create('a', 'leaflet-control-filter leaflet-bar-part leaflet-control-zoom-in', container) as HTMLAnchorElement;
        filterBtn.href = '#';
        filterBtn.role = 'button';
        filterBtn.title = 'Filter';
        filterBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-funnel-icon lucide-funnel"><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"/></svg>';
        filterBtn.style.display = 'flex';
        filterBtn.style.alignItems = 'center';
        filterBtn.style.justifyContent = 'center';
        filterBtn.style.padding = '0';
        L.DomEvent.on(filterBtn, 'click', L.DomEvent.stopPropagation)
          .on(filterBtn, 'click', L.DomEvent.preventDefault)
          .on(filterBtn, 'click', (e) => {
          L.DomEvent.preventDefault(e);
          
          // Toggle panel
          if (filterPanelRef.current) {
            filterPanelRef.current.remove();
            filterPanelRef.current = null;
            return;
          }

          // Create filter panel
          const panel = document.createElement('div');
          panel.className = 'pp-filter-panel leaflet-control-panel';
          panel.innerHTML = `
            <div style="min-width:220px;padding:12px;">
              <div style="margin-bottom:12px;font-weight:600;">Filter markers</div>
              <div style="margin-bottom:12px;">
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="pp-filter-type" id="pp-filter-all" value="all" checked>
                  <label class="form-check-label" for="pp-filter-all">All</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="pp-filter-type" id="pp-filter-houses" value="houses">
                  <label class="form-check-label" for="pp-filter-houses">Houses</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="pp-filter-type" id="pp-filter-shops" value="shops">
                  <label class="form-check-label" for="pp-filter-shops">Shops</label>
                </div>
              </div>
              <div style="margin-bottom:12px;">
                <label class="form-label" style="margin-bottom:4px;">Radius</label>
                <input type="range" min="0" max="2000" step="10" value="${currentRadius}" id="pp-filter-radius" class="form-range" />
                <div class="text-muted small" id="pp-filter-radius-label">${currentRadius} meters</div>
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-danger" id="pp-filter-reset">Reset</button>
                <button class="btn btn-sm btn-secondary" id="pp-filter-close">Close</button>
              </div>
            </div>
          `;

          const mapContainer = map.getContainer();
          panel.style.position = 'absolute';
          panel.style.zIndex = '1000';
          panel.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
          panel.style.background = 'white';
          panel.style.borderRadius = '6px';
          panel.style.padding = '0';
          
          // Position above the buttons
          try {
            const btnRect = filterBtn.getBoundingClientRect();
            const containerRect = mapContainer.getBoundingClientRect();
            const right = containerRect.right - btnRect.right;
            const bottom = containerRect.bottom - btnRect.top + btnRect.height + 8;
            panel.style.right = `${right}px`;
            panel.style.bottom = `${bottom}px`;
          } catch (e) {
            // fallback
            panel.style.right = '10px';
            panel.style.bottom = '120px';
          }

          mapContainer.appendChild(panel);
          filterPanelRef.current = panel;

          // Prevent map interactions on panel
          L.DomEvent.disableClickPropagation(panel);
          L.DomEvent.disableScrollPropagation(panel);

          // Attach event handlers
          const radiusInput = panel.querySelector('#pp-filter-radius') as HTMLInputElement;
          const radiusLabel = panel.querySelector('#pp-filter-radius-label') as HTMLElement;
          const typeInputs = panel.querySelectorAll('input[name="pp-filter-type"]') as NodeListOf<HTMLInputElement>;
          const resetBtn = panel.querySelector('#pp-filter-reset') as HTMLButtonElement;
          const closeBtn = panel.querySelector('#pp-filter-close') as HTMLButtonElement;

          // Radius change handler
          radiusInput.addEventListener('input', (e) => {
            const newRadius = Number((e.target as HTMLInputElement).value);
            setCurrentRadius(newRadius);
            radiusLabel.textContent = `${newRadius} meters`;
            
            if (filterCircleRef.current) {
              filterCircleRef.current.setRadius(newRadius);
            }

            const center = filterCircleRef.current?.getLatLng() || map.getCenter();
            onMapMove?.(
              { lat: center.lat, lng: center.lng },
              newRadius
            );
          });

          // Type change handler
          typeInputs.forEach((input) => {
            input.addEventListener('change', (e) => {
              const value = (e.target as HTMLInputElement).value as 'all' | 'houses' | 'shops';
              setCurrentType(value);
            });
          });

          // Reset handler
          resetBtn.addEventListener('click', () => {
            const allRadio = panel.querySelector('#pp-filter-all') as HTMLInputElement;
            allRadio.checked = true;
            setCurrentType('all');
            
            radiusInput.value = '1000';
            radiusLabel.textContent = '1000 meters';
            setCurrentRadius(1000);
            
            if (filterCircleRef.current) {
              filterCircleRef.current.setRadius(1000);
            }

            const center = filterCircleRef.current?.getLatLng() || map.getCenter();
            onMapMove?.(
              { lat: center.lat, lng: center.lng },
              1000
            );
          });

          // Close handler
          closeBtn.addEventListener('click', () => {
            panel.remove();
            filterPanelRef.current = null;
          });
        });
        L.DomEvent.disableClickPropagation(filterBtn);
        L.DomEvent.disableScrollPropagation(filterBtn);

        // Search button - opens sidebar
        const searchBtn = L.DomUtil.create('a', 'leaflet-control-search leaflet-bar-part leaflet-control-zoom-in', container) as HTMLAnchorElement;
        searchBtn.href = '#';
        searchBtn.role = 'button';
        searchBtn.title = 'Search';
        searchBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>';
        searchBtn.style.display = 'flex';
        searchBtn.style.alignItems = 'center';
        searchBtn.style.justifyContent = 'center';
        searchBtn.style.padding = '0';
        L.DomEvent.on(searchBtn, 'click', L.DomEvent.stopPropagation)
          .on(searchBtn, 'click', L.DomEvent.preventDefault)
          .on(searchBtn, 'click', () => {
            if (onOpenFilters) onOpenFilters();
          });
        L.DomEvent.disableClickPropagation(searchBtn);
        L.DomEvent.disableScrollPropagation(searchBtn);

        // Locate button
        const locateBtn = L.DomUtil.create('a', 'leaflet-control-filter leaflet-bar-part leaflet-control-zoom-in', container) as HTMLAnchorElement;
        locateBtn.href = '#';
        locateBtn.role = 'button';
        locateBtn.title = 'Locate me';
        locateBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-locate-fixed-icon lucide-locate-fixed"><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg>';
        locateBtn.style.display = 'flex';
        locateBtn.style.alignItems = 'center';
        locateBtn.style.justifyContent = 'center';
        locateBtn.style.padding = '0';
        L.DomEvent.on(locateBtn, 'click', L.DomEvent.stopPropagation)
          .on(locateBtn, 'click', L.DomEvent.preventDefault)
          .on(locateBtn, 'click', () => {
            if (userMarkerRef.current) {
              // If we already have user location, just fly to it
              const latlng = userMarkerRef.current.getLatLng();
              map.flyTo(latlng, 15, { duration: 0.8 });
              userMarkerRef.current.openPopup();
              
              // Update filter circle to user's position
              if (filterCircleRef.current) {
                filterCircleRef.current.setLatLng(latlng);
              }
              
              // Notify parent of updated position
              onMapMove?.(
                { lat: latlng.lat, lng: latlng.lng },
                currentRadius
              );
            } else {
              // Request location for the first time
              map.locate({ setView: true, maxZoom: 15 });
            }
          });
        L.DomEvent.disableClickPropagation(locateBtn);
        L.DomEvent.disableScrollPropagation(locateBtn);

        return container;
      },
    });

    map.addControl(new ControlGroup());

    // Position control group before zoom controls
    const mapContainer = map.getContainer();
    const groupEl = mapContainer.querySelector('.leaflet-control-group') as HTMLElement | null;
    const zoomEl = mapContainer.querySelector('.leaflet-control-zoom') as HTMLElement | null;
    if (groupEl && zoomEl && zoomEl.parentNode) {
      zoomEl.parentNode.insertBefore(groupEl, zoomEl);
    }

    // Handle location found
    map.on('locationfound', (e: L.LocationEvent) => {
      if (!mapRef.current) return;
      
      const { latlng } = e;
      
      // Add or update user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(latlng);
      } else {
        userMarkerRef.current = L.marker(latlng, {
          icon: createMapPinIcon({ 
            pinColor: 'red', 
            circleColor: 'white', 
            size: 35,
            strokeColor: 'black',
            strokeWidth: 2,
          }),
        }).addTo(map);
      }
      
      userMarkerRef.current.bindPopup('You are here').openPopup();

      // Always center filter circle on user's actual location
      if (filterCircleRef.current) {
        filterCircleRef.current.setLatLng(latlng);
      } else {
        filterCircleRef.current = L.circle(latlng, {
          radius: currentRadius,
          color: '#007bff',
          weight: 2,
          fillOpacity: 0.1,
        }).addTo(map);
      }

      // Notify parent of user's location
      onMapMove?.(
        { lat: latlng.lat, lng: latlng.lng },
        currentRadius
      );
    });

    map.on('locationerror', () => {
      console.warn('Could not get your location. Using default location.');
      // Still create filter circle at default center
      const center = map.getCenter();
      if (!filterCircleRef.current) {
        filterCircleRef.current = L.circle(center, {
          radius: currentRadius,
          color: '#007bff',
          weight: 2,
          fillOpacity: 0.1,
        }).addTo(map);
      }
    });

    // Initialize filter circle at map center
    const center = map.getCenter();
    filterCircleRef.current = L.circle(center, {
      radius: currentRadius,
      color: '#007bff',
      weight: 2,
      fillOpacity: 0.1,
    }).addTo(map);

    // Notify parent of initial position
    onMapMove?.(
      { lat: center.lat, lng: center.lng },
      currentRadius
    );

    mapRef.current = map;
    // mark map as ready so other effects can safely add layers/icons
    setMapReady(true);
    console.log('Map initialization complete');

    // Ensure Leaflet recalculates size after container fills viewport
    setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {
        console.error('Error invalidating map size:', e);
      }
    }, 200);

    // Delay geolocation to ensure map is fully ready
    setTimeout(() => {
      try {
        if (mapRef.current) {
          mapRef.current.locate({ setView: true, maxZoom: 15 });
        }
      } catch (e) {
        console.error('Error calling locate:', e);
      }
    }, 500);

    return () => {
      console.log('Map cleanup called');
      // Only cleanup if we're actually unmounting
      const currentMap = mapRef.current;
      if (currentMap && currentMap === map) {
        try { 
          currentMap.off(); // Remove all event listeners first
          currentMap.remove(); 
          mapRef.current = null;
        } catch (e) { 
          console.error('Error removing map:', e);
        }
      }
      setMapReady(false);
    };
  }, []);

  // Render shop markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    // ensure Leaflet panes exist (protect against StrictMode double-invoke edge-case)
    const panes = (map as any)._panes;
    if (!panes || !panes.markerPane) return;

    const markers: L.Marker[] = [];

    // Filter to only grocery-related shops
    const groceryTypes = new Set([
      'supermarket',
      'grocery',
      'convenience',
      'greengrocer',
      'butcher',
      'seafood',
      'bakery',
      'deli',
      'dairy',
      'cheese',
      'beverages',
      'spices',
      'organic',
    ]);

    // Only render shops if type is 'all' or 'shops'
    if (currentType === 'all' || currentType === 'shops') {
      shops.forEach((shop) => {
        // Skip non-grocery stores
        const shopType = shop.properties?.shop || shop.properties?.category?.label?.toLowerCase() || '';
        if (!groceryTypes.has(shopType.toLowerCase())) {
          return;
        }
        // Check if shop is within radius
        const filterCenter = filterCircleRef.current?.getLatLng() || map.getCenter();
        const distance = map.distance([shop.latitude, shop.longitude], filterCenter);
        
        if (distance <= currentRadius) {
          const marker = L.marker([shop.latitude, shop.longitude], {
            icon: createMapPinIcon({ pinColor: 'green', circleColor: 'white', size: 30 }),
          });

          const { name, address, opening_hours, phone, website, category } = shop.properties;
          
          const popupContent = `
            <div style="min-width: 200px;">
              <h6 style="margin: 0 0 8px 0; font-weight: 600;">${name}</h6>
              <div style="color: #666; font-size: 0.85em; margin-bottom: 8px;">${category?.label || 'N/A'}</div>
              <div style="margin-bottom: 4px;"><strong>Address:</strong> ${address || 'N/A'}</div>
              <div style="margin-bottom: 4px;"><strong>Hours:</strong> ${opening_hours || 'N/A'}</div>
              <div style="margin-bottom: 4px;"><strong>Phone:</strong> ${phone ? `<a href="tel:${phone}">${phone}</a>` : 'N/A'}</div>
              <div style="margin-bottom: 8px;"><strong>Website:</strong> ${website ? `<a href="${website}" target="_blank" rel="noopener noreferrer">Visit</a>` : 'N/A'}</div>
              <div style="margin-top: 8px;">
                <a href="https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   style="font-weight: 600; color: #007bff;">
                  Get Directions →
                </a>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.addTo(map);
          markers.push(marker);

          // Open popup if this is the selected shop
          if (selectedId === shop.id) {
            marker.openPopup();
          }
        }
      });
    }

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [shops, selectedId, currentType, currentRadius, mapReady]);

  // Render house markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    // ensure Leaflet panes exist (protect against StrictMode double-invoke edge-case)
    const panes = (map as any)._panes;
    if (!panes || !panes.markerPane) return;

    const markers: L.Marker[] = [];

    // Only render houses if type is 'all' or 'houses'
    if (currentType === 'all' || currentType === 'houses') {
      houses.forEach((house) => {
        // Check if house is within radius
        const filterCenter = filterCircleRef.current?.getLatLng() || map.getCenter();
        const distance = map.distance([house.latitude, house.longitude], filterCenter);
        
        if (distance <= currentRadius) {
          const marker = L.marker([house.latitude, house.longitude], {
            icon: createMapPinIcon({ pinColor: 'blue', circleColor: 'white', size: 28 }),
          });

          const popupContent = `
            <div style="min-width: 150px;">
              <h6 style="margin: 0 0 8px 0; font-weight: 600;">${house.name}</h6>
              ${house.address ? `<div style="margin-bottom: 8px;">${house.address}</div>` : ''}
              <div style="margin-top: 8px;">
                <a href="https://www.google.com/maps/dir/?api=1&destination=${house.latitude},${house.longitude}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   style="font-weight: 600; color: #007bff;">
                  Get Directions →
                </a>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.addTo(map);
          markers.push(marker);

          // Open popup if this is the selected house
          if (selectedId === house.id) {
            marker.openPopup();
          }
        }
      });
    }

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [houses, selectedId, currentType, currentRadius, mapReady]);

  return <div id="map" style={{ width: '100%', height: '100%' }} />;
}
