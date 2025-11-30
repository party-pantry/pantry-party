'use client';

import React, { useEffect, useRef } from 'react';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createMapPinIcon } from '@/utils/locationsUtils';

const defaultView: LatLngExpression = [20.7, -157.5];

type Suggestion = { id?: string; label: string; latitude?: number | null; longitude?: number | null; address?: string };

const LocationsMap: React.FC<{
  onOpenFilters?: () => void;
  searchResults?: Suggestion[];
  onVisibleShops?: (shops: Suggestion[]) => void;
  selectedLocation?: { latitude: number; longitude: number } | null;
  selectedMarkerId?: string | null;
  selectedDetails?: Suggestion | null;
  onMarkerClick?: (id?: string, lat?: number | null, lon?: number | null) => void;
  onMapStateChange?: (center: { latitude: number; longitude: number }, radius: number) => void;
}> = ({ onOpenFilters, searchResults = [], onVisibleShops, selectedLocation = null, selectedMarkerId = null, selectedDetails = null, onMarkerClick, onMapStateChange }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const houseMarkersRef = useRef<L.LayerGroup | null>(null);
  const shopsMarkersRef = useRef<L.LayerGroup | null>(null);
  const markersByIdRef = useRef<Map<string, L.Marker>>(new Map());
  const shopsMarkersByIdRef = useRef<Map<string, L.Marker>>(new Map());
  const shopsMasterRef = useRef<any[] | null>(null);
  const shopsMasterCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const markersMetaRef = useRef<Map<string, 'shop' | 'house' | 'user' | 'search'>>(new Map());
  const tempSelectedMarkerRef = useRef<L.Marker | null>(null);
  const locationFetchTimeoutRef = useRef<number | null>(null);
  const filterCircleRef = useRef<L.Circle | null>(null);
  const filterPanelRef = useRef<HTMLElement | null>(null);
  const currentRadiusRef = useRef<number>(1000);
  const currentTypeRef = useRef<string>('all');

  // Master cache settings
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  const REUSE_DISTANCE = 200; // meters: reuse master if within this distance

  const getMasterCacheKey = (lat: number, lng: number) => `shops_master_${lat.toFixed(5)}_${lng.toFixed(5)}_2000`;

  const loadMasterShopsOnce = async (center: L.LatLng) => {
    try {
      if (!window || !mapRef.current) return null;
      const lat = center.lat;
      const lng = center.lng;
      const key = getMasterCacheKey(lat, lng);

      // if we already have master in memory and center is close, reuse
      if (shopsMasterRef.current && shopsMasterCenterRef.current) {
        try {
          const d = mapRef.current.distance(L.latLng(shopsMasterCenterRef.current.lat, shopsMasterCenterRef.current.lng), center);
          if (d <= REUSE_DISTANCE) return shopsMasterRef.current;
        } catch (e) {
          // ignore and continue
        }
      }

      // check localStorage: try exact key first
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.fetchedAt && (Date.now() - parsed.fetchedAt) < CACHE_TTL && Array.isArray(parsed.data)) {
            shopsMasterRef.current = parsed.data;
            shopsMasterCenterRef.current = { lat, lng };
            return parsed.data;
          }
        }

        // no exact key: scan nearby master caches and pick one within REUSE_DISTANCE
        const prefix = 'shops_master_';
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k || !k.startsWith(prefix)) continue;
          try {
            const parts = k.replace(prefix, '').split('_');
            const cachedLat = Number(parts[0]);
            const cachedLng = Number(parts[1]);
            const rawVal = localStorage.getItem(k);
            if (!rawVal) continue;
            const parsed = JSON.parse(rawVal);
            if (!(parsed?.fetchedAt && Array.isArray(parsed.data))) continue;
            if ((Date.now() - parsed.fetchedAt) >= CACHE_TTL) continue;
            const dist = mapRef.current.distance(L.latLng(cachedLat, cachedLng), center);
            if (dist <= REUSE_DISTANCE) {
              shopsMasterRef.current = parsed.data;
              shopsMasterCenterRef.current = { lat: cachedLat, lng: cachedLng };
              return parsed.data;
            }
          } catch (e) {
            // ignore parse errors
          }
        }
      } catch (e) {
        // ignore cache errors
      }

      // fetch master list (buffer 2000m)
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng, buffer: 2000 }),
      });
      if (!res.ok) return null;
      const j = await res.json();
      const shops = Array.isArray(j?.shops) ? j.shops : [];
      shopsMasterRef.current = shops;
      shopsMasterCenterRef.current = { lat, lng };
      try {
        localStorage.setItem(key, JSON.stringify({ fetchedAt: Date.now(), data: shops }));
      } catch (e) {
        // ignore
      }
      return shops;
    } catch (e) {
      // ignore
      return null;
    }
  };

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map('map', {
      center: defaultView,
      zoom: 7.5,
      zoomControl: false,
    });

    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    function applyRadiusFilter(centerLatLng: L.LatLng, radiusMeters: number) {
      try {
        // filter markers tracked by id
        markersByIdRef.current.forEach((marker) => {
          try {
            const d = map.distance(marker.getLatLng(), centerLatLng);
            if (d <= radiusMeters) {
              (marker as any).addTo(map);
            } else {
              (marker as any).remove();
            }
          } catch (e) {
            try { (marker as any).remove(); } catch (ee) { /* ignore */ }
          }
        });

        // filter house markers
        if (houseMarkersRef.current) {
          (houseMarkersRef.current as L.LayerGroup).eachLayer((layer: any) => {
            try {
              const latlng = (layer as L.Marker).getLatLng();
              const d = map.distance(latlng, centerLatLng);
              if (d <= radiusMeters) {
                (layer as any).addTo(map);
              } else {
                (layer as any).remove();
              }
            } catch (e) {
              try { (layer as any).remove(); } catch (ee) { /* ignore */ }
            }
          });

          // filter shop markers
          if (shopsMarkersRef.current) {
            shopsMarkersByIdRef.current.forEach((marker) => {
              try {
                const d = map.distance(marker.getLatLng(), centerLatLng);
                if (d <= radiusMeters) {
                  (marker as any).addTo(map);
                } else {
                  (marker as any).remove();
                }
              } catch (e) {
                try { (marker as any).remove(); } catch (ee) { /* ignore */ }
              }
            });
          }
        }
      } catch (e) {
        // ignore
      }
    }

    function filterMasterAndRender(center: L.LatLng, radiusMeters: number) {
      try {
        if (!shopsMasterRef.current) return;
        const mapInstance = mapRef.current!;
        const within = shopsMasterRef.current.filter((p) => {
          try {
            if (p.latitude == null || p.longitude == null) return false;
            const d = mapInstance.distance(L.latLng(p.latitude, p.longitude), center);
            return d <= radiusMeters;
          } catch (e) {
            return false;
          }
        });
        // notify parent about visible shops (map is authoritative)
        try {
          if (typeof onVisibleShops === 'function') {
            const mapped = within.map((p: any) => ({ id: p.id, label: p.label || p.name || '', latitude: p.latitude, longitude: p.longitude, address: p.properties?.address || '' }));
            try { onVisibleShops(mapped); } catch (e) { /* ignore */ }
          }
        } catch (e) { /* ignore */ }

        addShopMarkers(within);
      } catch (e) {
        // ignore
      }
    }

    function addShopMarkers(shops: any[]) {
      try {
        if (!mapRef.current) return;

        // ensure shops layer exists
        if (!shopsMarkersRef.current) {
          shopsMarkersRef.current = L.layerGroup().addTo(map);
        }

        // clear previous shops markers
        try {
          (shopsMarkersRef.current as L.LayerGroup).clearLayers();
          shopsMarkersByIdRef.current.forEach((marker) => {
            try { (marker as any).remove(); } catch (e) { /* ignore */ }
          });
          shopsMarkersByIdRef.current.clear();
        } catch (e) { /* ignore */ }

        shops.forEach((p: any, idx: number) => {
          try {
            if (p.latitude == null || p.longitude == null) return;
            const id = `shop:${String(p.id ?? idx)}`;
            const m = L.marker([p.latitude, p.longitude], {
              icon: createMapPinIcon({ pinColor: 'green', circleColor: 'white', size: 30, strokeColor: 'black', strokeWidth: 1 }),
            });
            const label = p.label || (p.properties && (p.properties.name || p.properties.label)) || 'Shop';

            // Build a clean Google Maps directions URL using only destination lat,lng.
            const dest = `${p.latitude},${p.longitude}`;
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`;

            const popupHtml = `
              <div>
                <div style="font-weight:600">${label}</div>
                <div class="text-muted small">${p.properties?.category?.label || ''}</div>
                <div style="margin-top:8px">
                  <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="font-weight:600">Get directions</a>
                </div>
              </div>
            `;

            m.bindPopup(popupHtml);
            m.addTo(shopsMarkersRef.current as L.LayerGroup);
            shopsMarkersByIdRef.current.set(id, m);
            // also index shop markers in the general markersByIdRef using the raw shop id
            try {
              if (p.id != null) {
                const rawId = String(p.id);
                markersByIdRef.current.set(rawId, m);
                markersMetaRef.current.set(rawId, 'shop');
              }
            } catch (e) {
              // ignore
            }
          } catch (e) { /* ignore per-poi */ }
        });
      } catch (e) {
        // ignore
      }
    }

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const CustomControl = (L.Control as any).extend({
      options: { position: 'bottomright' },
      onAdd() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-group');

        const filterToolLink = L.DomUtil.create('a', 'leaflet-control-filter leaflet-bar-part leaflet-control-zoom-in', container) as HTMLAnchorElement;
        filterToolLink.href = '#';
        filterToolLink.role = 'button';
        filterToolLink.title = 'Filter';
        filterToolLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-funnel-icon lucide-funnel"><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"/></svg>';
        filterToolLink.style.display = 'flex';
        filterToolLink.style.alignItems = 'center';
        filterToolLink.style.justifyContent = 'center';
        filterToolLink.style.padding = '0';
        L.DomEvent.on(filterToolLink, 'click', L.DomEvent.stopPropagation)
          .on(filterToolLink, 'click', L.DomEvent.preventDefault)
          .on(filterToolLink, 'click', () => {
            try {
              if (!mapRef.current) return;
              const mapInstance = mapRef.current;

              if (filterPanelRef.current) {
                try {
                  try { filterPanelRef.current.remove(); } catch (e) { /* ignore */ }
                } catch (e) {
                  // ignore
                }
                filterPanelRef.current = null;
                return;
              }

              // create panel element and attach to map container
              const panel = document.createElement('div');
              panel.className = 'pp-filter-panel leaflet-control-panel';
              panel.setAttribute('role', 'dialog');
              panel.innerHTML = `
                <div style="min-width:220px;padding:8px;">
                  <div class="mb-2"><strong>Filter markers</strong></div>
                  <div class="mb-2">
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
                  <div class="mb-2"><label class="form-label mb-1">Radius</label>
                    <input type="range" min="0" max="2000" step="10" value="1000" id="pp-filter-radius" class="form-range" />
                    <div class="text-muted small" id="pp-filter-radius-label">1000 meters</div>
                  </div>
                  <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-danger" id="pp-filter-reset">Reset</button>
                    <button class="btn btn-sm btn-secondary" id="pp-filter-close">Close</button>
                  </div>
                </div>
              `;

              const mapContainerEl = mapInstance.getContainer();
              panel.style.position = 'absolute';
              panel.style.zIndex = '1000';
              panel.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
              panel.style.background = 'white';
              panel.style.borderRadius = '6px';
              panel.style.padding = '0';

              // position panel near the filter button
              try {
                const btnRect = filterToolLink.getBoundingClientRect();
                const containerRect = mapContainerEl.getBoundingClientRect();
                const right = containerRect.right - btnRect.right + 8; // pixels from right edge
                const bottom = containerRect.bottom - btnRect.top + 8; // place above or below depending
                // prefer positioning above button if space
                panel.style.right = `${right}px`;
                panel.style.bottom = `${bottom}px`;
              } catch (e) {
                // fallback
                panel.style.right = '10px';
                panel.style.bottom = '60px';
              }

              mapContainerEl.appendChild(panel);
              filterPanelRef.current = panel;

              // prevent interactions inside the panel from propagating to the map
              try {
                L.DomEvent.disableClickPropagation(panel);
                L.DomEvent.disableScrollPropagation(panel);
              } catch (e) {
                // ignore
              }

              // attach handlers immediately
              const closeBtn = panel.querySelector('#pp-filter-close') as HTMLButtonElement | null;
              const radiusInput = panel.querySelector('#pp-filter-radius') as HTMLInputElement | null;
              const radiusLabel = panel.querySelector('#pp-filter-radius-label') as HTMLElement | null;
              const typeInputs = panel.querySelectorAll('input[name="pp-filter-type"]') as NodeListOf<HTMLInputElement> | null;

              if (radiusInput && radiusLabel) {
                // initialize radius input from persisted value (meters)
                try {
                  // clamp persisted value to allowed range
                  const persisted = Number(currentRadiusRef.current ?? 1000);
                  const clamped = Math.max(0, Math.min(2000, persisted));
                  radiusInput.value = String(clamped);
                  radiusLabel.textContent = (clamped === 1 ? '1 meter' : `${clamped} meters`);
                } catch (e) { /* ignore */ }
                const meters = Number(radiusInput.value);
                const initialCenter = userMarkerRef.current ? userMarkerRef.current.getLatLng() : mapInstance.getCenter();
                if (filterCircleRef.current) {
                  filterCircleRef.current.setRadius(meters);
                  try { filterCircleRef.current.setLatLng(initialCenter); } catch (e) { /* ignore */ }
                } else {
                  filterCircleRef.current = L.circle(initialCenter, { radius: meters, color: '#007bff', weight: 1 }).addTo(mapInstance);
                }

                // helper to apply current type + radius filters to existing markers
                const applyFilters = (centerLatLng: L.LatLng, radiusMeters: number) => {
                  try {
                    const typeSelected = (panel.querySelector('input[name="pp-filter-type"]:checked') as HTMLInputElement | null)?.value || 'all';

                    // search result markers (markersByIdRef)
                markersByIdRef.current.forEach((marker) => {
                      try {
                        const d = map.distance(marker.getLatLng(), centerLatLng);
                        if (typeSelected === 'houses') {
                          // hide search markers when houses-only
                          (marker as any).remove();
                        } else if (d <= radiusMeters) {
                          (marker as any).addTo(map);
                        } else {
                          (marker as any).remove();
                        }
                      } catch (e) {
                        try { (marker as any).remove(); } catch (ee) { /* ignore */ }
                      }
                    });

                    // house markers
                    if (houseMarkersRef.current) {
                      (houseMarkersRef.current as L.LayerGroup).eachLayer((layer: any) => {
                        try {
                          const latlng = (layer as L.Marker).getLatLng();
                          const d = map.distance(latlng, centerLatLng);
                          if (typeSelected === 'shops') {
                            (layer as any).remove();
                          } else if (d <= radiusMeters) {
                            (layer as any).addTo(map);
                          } else {
                            (layer as any).remove();
                          }
                        } catch (e) {
                          try { (layer as any).remove(); } catch (ee) { /* ignore */ }
                        }
                      });
                      // shop markers
                      if (shopsMarkersRef.current) {
                        (shopsMarkersRef.current as L.LayerGroup).eachLayer((layer: any) => {
                          try {
                            const latlng = (layer as L.Marker).getLatLng();
                            const d = map.distance(latlng, centerLatLng);
                            if (typeSelected === 'houses') {
                              (layer as any).remove();
                            } else if (d <= radiusMeters) {
                              (layer as any).addTo(map);
                            } else {
                              (layer as any).remove();
                            }
                          } catch (e) {
                            try { (layer as any).remove(); } catch (ee) { /* ignore */ }
                          }
                        });
                      }
                    }
                  } catch (e) {
                    // ignore
                  }
                };

                // apply filters immediately when panel opens so existing search results are honored
                try {
                  applyFilters(initialCenter, meters);
                } catch (e) {
                  // ignore
                }

                radiusInput.addEventListener('input', (e) => {
                  let rawVal = Number((e.target as HTMLInputElement).value);
                  // clamp to allowed range
                  rawVal = Math.max(0, Math.min(2000, rawVal));
                  const val = Math.round(rawVal); // integer meters
                  // persist current radius
                  try { currentRadiusRef.current = val; } catch (ee) { /* ignore */ }
                  if (radiusLabel) radiusLabel.textContent = (val === 1 ? '1 meter' : `${val} meters`);
                  const m = val;
                  if (filterCircleRef.current) filterCircleRef.current.setRadius(m);

                  // filter markers by distance to user (if available) otherwise map center
                  try {
                      const center = userMarkerRef.current ? userMarkerRef.current.getLatLng() : map.getCenter();
                      try { if (typeof onMapStateChange === 'function') onMapStateChange({ latitude: center.lat, longitude: center.lng }, m); } catch (ee) { /* ignore */ }
                    // filter search result markers
                    markersByIdRef.current.forEach((marker) => {
                      try {
                        const d = map.distance(marker.getLatLng(), center);
                        if (d <= m) {
                          (marker as any).addTo(map);
                        } else {
                          (marker as any).remove();
                        }
                      } catch (err) {
                        // ignore per-marker issues
                      }
                    });

                    // filter house markers
                    if (houseMarkersRef.current) {
                      (houseMarkersRef.current as L.LayerGroup).eachLayer((layer: any) => {
                        try {
                          const latlng = (layer as L.Marker).getLatLng();
                          const d = map.distance(latlng, center);
                          if (d <= m) {
                            (layer as any).addTo(map);
                          } else {
                            (layer as any).remove();
                          }
                        } catch (err) {
                          // ignore
                        }
                      });
                      // also refresh shops for the new radius (master list filtered & rendered)
                      try { loadMasterShopsOnce(center).then(() => { filterMasterAndRender(center, m); }).catch(() => {/* ignore */}); } catch (ee) { /* ignore */ }
                    }
                  } catch (err) {
                    // ignore
                  }
                  try { const centerForFilter = userMarkerRef.current ? userMarkerRef.current.getLatLng() : map.getCenter(); filterMasterAndRender(centerForFilter, m); } catch (e) { /* ignore */ }
                });
              }

              if (typeInputs) {
                // initialize type radios from persisted value
                try {
                  typeInputs.forEach((inp) => {
                    try { if (inp.value === currentTypeRef.current) inp.checked = true; } catch (e) { /* ignore */ }
                  });
                } catch (e) { /* ignore */ }

                typeInputs.forEach((inp) => {
                  inp.addEventListener('change', (ev) => {
                    const v = (ev.target as HTMLInputElement).value;
                    try { currentTypeRef.current = v; } catch (ee) { /* ignore */ }
                    try {
                      if (!houseMarkersRef.current || !markersRef.current) return;
                      const center = userMarkerRef.current ? userMarkerRef.current.getLatLng() : map.getCenter();
                      const radius = filterCircleRef.current ? filterCircleRef.current.getRadius() : Infinity;

                      const showHouseIfInRadius = (layer: any) => {
                        try {
                          const latlng = (layer as L.Marker).getLatLng();
                          const d = map.distance(latlng, center);
                          if (d <= radius) {
                            (layer as any).addTo(map);
                          } else {
                            (layer as any).remove();
                          }
                        } catch (e) {
                          try { (layer as any).remove(); } catch (ee) { /* ignore */ }
                        }
                      };

                      const showStoreIfInRadius = (layer: any) => {
                        try {
                          const latlng = (layer as L.Marker).getLatLng();
                          const d = map.distance(latlng, center);
                          if (d <= radius) {
                            (layer as any).addTo(map);
                          } else {
                            (layer as any).remove();
                          }
                        } catch (e) {
                          try { (layer as any).remove(); } catch (ee) { /* ignore */ }
                        }
                      };

                      const showShopIfInRadius = (layer: any) => {
                        try {
                          const latlng = (layer as L.Marker).getLatLng();
                          const d = map.distance(latlng, center);
                          if (d <= radius) {
                            (layer as any).addTo(map);
                          } else {
                            (layer as any).remove();
                          }
                        } catch (e) {
                          try { (layer as any).remove(); } catch (ee) { /* ignore */ }
                        }
                      };

                      if (v === 'houses') {
                        // remove all search result markers
                        try { (markersRef.current as L.LayerGroup).eachLayer((layer: any) => { (layer as any).remove(); }); } catch (e) { /* ignore */ }
                        // show only house markers within radius
                        try { (houseMarkersRef.current as L.LayerGroup).eachLayer((layer: any) => { showHouseIfInRadius(layer); }); } catch (e) { /* ignore */ }
                        // hide shop markers when houses-only
                        try { if (shopsMarkersRef.current) (shopsMarkersRef.current as L.LayerGroup).eachLayer((layer: any) => { (layer as any).remove(); }); } catch (e) { /* ignore */ }
                      } else if (v === 'shops') {
                        // remove all house markers
                        try { (houseMarkersRef.current as L.LayerGroup).eachLayer((layer: any) => { (layer as any).remove(); }); } catch (e) { /* ignore */ }
                        // show only store/search markers within radius
                        try { (markersRef.current as L.LayerGroup).eachLayer((layer: any) => { showStoreIfInRadius(layer); }); } catch (e) { /* ignore */ }
                        // show shop markers within radius
                        try { if (shopsMarkersRef.current) (shopsMarkersRef.current as L.LayerGroup).eachLayer((layer: any) => { showShopIfInRadius(layer); }); } catch (e) { /* ignore */ }
                      } else {
                        // show both groups but only layers within radius
                        try { (markersRef.current as L.LayerGroup).eachLayer((layer: any) => { showStoreIfInRadius(layer); }); } catch (e) { /* ignore */ }
                        try { (houseMarkersRef.current as L.LayerGroup).eachLayer((layer: any) => { showHouseIfInRadius(layer); }); } catch (e) { /* ignore */ }
                        try { if (shopsMarkersRef.current) (shopsMarkersRef.current as L.LayerGroup).eachLayer((layer: any) => { showShopIfInRadius(layer); }); } catch (e) { /* ignore */ }
                      }
                    } catch (e) {
                      // ignore
                    }
                  });
                });
              }

              const resetBtn = panel.querySelector('#pp-filter-reset') as HTMLButtonElement | null;

              if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                  try {
                    if (!mapRef.current) return;
                    // reset radios to All
                    const allRadio = panel.querySelector('#pp-filter-all') as HTMLInputElement | null;
                    const housesRadio = panel.querySelector('#pp-filter-houses') as HTMLInputElement | null;
                    const shopsRadio = panel.querySelector('#pp-filter-shops') as HTMLInputElement | null;
                    if (allRadio) allRadio.checked = true;
                    if (housesRadio) housesRadio.checked = false;
                    if (shopsRadio) shopsRadio.checked = false;
                    try { currentTypeRef.current = 'all'; } catch (ee) { /* ignore */ }

                    // reset radius UI to default and apply the default radius filter (1000 m)
                    if (radiusInput && radiusLabel) {
                      radiusInput.value = '1000';
                      radiusLabel.textContent = '1000 meters';
                      try { currentRadiusRef.current = 1000; } catch (ee) { /* ignore */ }
                      const meters = 1000;
                      const center = userMarkerRef.current ? userMarkerRef.current.getLatLng() : mapInstance.getCenter();
                      if (filterCircleRef.current) {
                        try { filterCircleRef.current.setLatLng(center); } catch (e) { /* ignore */ }
                        filterCircleRef.current.setRadius(meters);
                      } else {
                        filterCircleRef.current = L.circle(center, { radius: meters, color: '#007bff', weight: 1 }).addTo(mapInstance);
                      }

                      try { loadMasterShopsOnce(center).then(() => { filterMasterAndRender(center, meters); }).catch(() => {/* ignore */}); } catch (e) { /* ignore */ }

                      // show both groups but only items within default radius
                      try {
                        const radius = filterCircleRef.current.getRadius();
                        // search markers (markersByIdRef)
                        markersByIdRef.current.forEach((marker) => {
                          try {
                            const d = map.distance(marker.getLatLng(), center);
                            if (d <= radius) { (marker as any).addTo(map); } else { (marker as any).remove(); }
                          } catch (e) { try { (marker as any).remove(); } catch (ee) { /* ignore */ } }
                        });

                        // house markers
                        if (houseMarkersRef.current) {
                          (houseMarkersRef.current as L.LayerGroup).eachLayer((layer: any) => {
                            try {
                              const d = map.distance((layer as L.Marker).getLatLng(), center);
                              if (d <= radius) (layer as any).addTo(map); else (layer as any).remove();
                            } catch (e) { try { (layer as any).remove(); } catch (ee) { /* ignore */ } }
                          });
                        }
                      } catch (e) {
                        // ignore
                      }
                    }
                  } catch (e) {
                    // ignore
                  }
                });
              }

              if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                  if (!mapRef.current) return;
                  try {
                    // close the panel but preserve the filter circle and current filtering
                    try { panel.remove(); } catch (e) { /* ignore */ }
                    filterPanelRef.current = null;
                  } catch (e) {
                    // ignore
                  }
                });
              }
            } catch (e) {
              // ignore
            }
          });
        L.DomEvent.disableClickPropagation(filterToolLink);
        L.DomEvent.disableScrollPropagation(filterToolLink);

        const searchLink = L.DomUtil.create('a', 'leaflet-control-search leaflet-bar-part leaflet-control-zoom-in', container) as HTMLAnchorElement;
        searchLink.href = '#';
        searchLink.role = 'button';
        searchLink.title = 'Search';
        searchLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>';
        searchLink.style.display = 'flex';
        searchLink.style.alignItems = 'center';
        searchLink.style.justifyContent = 'center';
        searchLink.style.padding = '0';
        L.DomEvent.on(searchLink, 'click', L.DomEvent.stopPropagation)
          .on(searchLink, 'click', L.DomEvent.preventDefault)
          .on(searchLink, 'click', () => {
            if (onOpenFilters) onOpenFilters();
          });
        L.DomEvent.disableClickPropagation(searchLink);
        L.DomEvent.disableScrollPropagation(searchLink);

        const locateLink = L.DomUtil.create('a', 'leaflet-control-filter leaflet-bar-part leaflet-control-zoom-in', container) as HTMLAnchorElement;
        locateLink.href = '#';
        locateLink.role = 'button';
        locateLink.title = 'Locate me';
        locateLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-locate-fixed-icon lucide-locate-fixed"><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg>';
        locateLink.style.display = 'flex';
        locateLink.style.alignItems = 'center';
        locateLink.style.justifyContent = 'center';
        locateLink.style.padding = '0';
        L.DomEvent.on(locateLink, 'click', L.DomEvent.stopPropagation)
          .on(locateLink, 'click', L.DomEvent.preventDefault)
          .on(locateLink, 'click', () => {
            map.locate({ setView: true, maxZoom: 15 });
          });
        L.DomEvent.disableClickPropagation(locateLink);
        L.DomEvent.disableScrollPropagation(locateLink);

        return container;
      },
    });

    (map as any).addControl(new CustomControl());

    const mapContainer = map.getContainer();
    const groupEl = mapContainer.querySelector('.leaflet-control-group') as HTMLElement | null;
    const zoomEl = mapContainer.querySelector('.leaflet-control-zoom') as HTMLElement | null;
    if (groupEl && zoomEl && zoomEl.parentNode) {
      zoomEl.parentNode.insertBefore(groupEl, zoomEl);
    }

    map.locate({ setView: true, maxZoom: 15 });

    // notify parent when the map has moved (use filter circle center if present)
    map.on('moveend', () => {
      try {
        const center = filterCircleRef.current ? filterCircleRef.current.getLatLng() : map.getCenter();
        const radius = filterCircleRef.current ? filterCircleRef.current.getRadius() : currentRadiusRef.current || 1000;
        try { if (typeof onMapStateChange === 'function') onMapStateChange({ latitude: center.lat, longitude: center.lng }, radius); } catch (e) { /* ignore */ }
      } catch (e) {
        // ignore
      }
    });

    // fetch houses immediately so house markers are visible on load
    (async () => {
      try {
        const res = await fetch('/api/kitchen/houses');
        if (!res.ok) return;
        const houses = await res.json();
        if (!houseMarkersRef.current) houseMarkersRef.current = L.layerGroup().addTo(map);
        (houseMarkersRef.current as L.LayerGroup).clearLayers();
        houses.forEach((h: any) => {
          if (h.latitude == null || h.longitude == null) return;
          const hm = L.marker([h.latitude, h.longitude], {
            icon: createMapPinIcon({ pinColor: 'blue', circleColor: 'white', size: 28, strokeColor: 'black', strokeWidth: 1 }),
          });
          // build compact address and a clean Google Maps directions link
          try {
            const houseLabel = h.name || 'Home';
            const address = (h.address && String(h.address).trim()) || '';
            const dest = `${h.latitude},${h.longitude}`;
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`;
            const popupHtml = `<div><div style="font-weight:600">${houseLabel}</div><div class="text-muted small">${address}</div><div style="margin-top:8px"><a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="font-weight:600">Get directions</a></div></div>`;
            hm.bindPopup(popupHtml);
          } catch (e) {
            try { hm.bindPopup(`<div style="font-weight:600">${h.name}</div><div class="text-muted small">${h.address || ''}</div>`); } catch (ee) { /* ignore */ }
          }
          hm.addTo(houseMarkersRef.current as L.LayerGroup);
          try {
            if (h.id != null) {
              // index house marker so selections can find and open it
              markersByIdRef.current.set(String(h.id), hm);
              markersMetaRef.current.set(String(h.id), 'house');
            }
          } catch (e) {
            // ignore
          }
        });
      } catch (e) {
        // ignore
      }
    })();

    // create an initial filter circle and apply radius filtering immediately (radius in meters)
    try {
      const initialCenter = map.getCenter();
      const defaultMeters = Math.max(0, Math.min(2000, currentRadiusRef.current || 1000));
      currentRadiusRef.current = defaultMeters;
      const meters = defaultMeters;
      if (filterCircleRef.current) {
        try { filterCircleRef.current.setLatLng(initialCenter); } catch (e) { /* ignore */ }
        filterCircleRef.current.setRadius(meters);
      } else {
        filterCircleRef.current = L.circle(initialCenter, { radius: meters, color: '#007bff', weight: 1 }).addTo(map);
      }
  try { applyRadiusFilter(initialCenter, meters); } catch (e) { /* ignore */ }
  try { if (typeof onMapStateChange === 'function') onMapStateChange({ latitude: initialCenter.lat, longitude: initialCenter.lng }, meters); } catch (e) { /* ignore */ }
      try {
        // clear any previous timeout
        if (locationFetchTimeoutRef.current) {
          clearTimeout(locationFetchTimeoutRef.current);
          locationFetchTimeoutRef.current = null;
        }
        // wait 1500ms for geolocation to fire; otherwise fetch for the current center
        locationFetchTimeoutRef.current = window.setTimeout(async () => {
          try {
            locationFetchTimeoutRef.current = null;
            const master = await loadMasterShopsOnce(initialCenter);
            if (master) {
              try { filterMasterAndRender(initialCenter, meters); } catch (e) { /* ignore */ }
            }
          } catch (e) {
            // ignore
          }
        }, 1500);
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // ignore
    }

    map.on('locationfound', (e: L.LocationEvent) => {
      if (!mapRef.current) return;
      try {
        try {
          if (locationFetchTimeoutRef.current) {
            clearTimeout(locationFetchTimeoutRef.current);
            locationFetchTimeoutRef.current = null;
          }
        } catch (cle) {
          // ignore
        }
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([e.latlng.lat, e.latlng.lng]);
        } else {
          userMarkerRef.current = L.marker([e.latlng.lat, e.latlng.lng], {
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
        // if a filter circle exists, recenter it on the user's location
            try {
              if (filterCircleRef.current) {
                filterCircleRef.current.setLatLng([e.latlng.lat, e.latlng.lng]);
                try {
                  const center = filterCircleRef.current.getLatLng();
                  const radius = filterCircleRef.current.getRadius();
                  applyRadiusFilter(center, radius);
                  try { if (typeof onMapStateChange === 'function') onMapStateChange({ latitude: center.lat, longitude: center.lng }, radius); } catch (ee) { /* ignore */ }
                  try { loadMasterShopsOnce(center).then(() => { filterMasterAndRender(center, radius); }).catch(() => {/* ignore */}); } catch (ee) { /* ignore */ }
                } catch (ee) { /* ignore */ }
              }
            } catch (err) {
              // ignore
            }
      } catch (err) {
        // ignore
      }
    });
    map.on('locationerror', () => {
      // eslint-disable-next-line no-alert
      alert('Could not get your location');
    });
    // ensure Leaflet recalculates size after container fills the viewport
    setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {
        // ignore
      }
    }, 200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update markers when searchResults change
  useEffect(() => {
    // Do NOT create markers here. Only ensure any suggested shop that already has a shop marker
    // is indexed so panel selections can find and open it.
    try {
      searchResults.forEach((s) => {
        try {
          if (!s.id) return;
          const shopMarker = shopsMarkersByIdRef.current.get(`shop:${String(s.id)}`);
          if (shopMarker) {
            markersByIdRef.current.set(String(s.id), shopMarker);
            markersMetaRef.current.set(String(s.id), 'shop');
          }
        } catch (e) {
          // ignore per-suggestion
        }
      });
    } catch (e) {
      // ignore
    }
  }, [searchResults]);

  // when selectedMarkerId changes, open the popup for that marker if present
  useEffect(() => {
    try {
      if (!selectedMarkerId) return;
      const marker = markersByIdRef.current.get(selectedMarkerId);
      const mapInstance = mapRef.current;
      if (!marker || !mapInstance) return;
      try {
        // If the marker was removed due to radius filtering, ensure it is added back to the map
        // so its popup can be opened. Do not create a new marker; re-use the existing one.
        try {
          if (!mapInstance.hasLayer(marker)) {
            (marker as any).addTo(mapInstance);
          }
        } catch (e) {
          // fallback: try addTo
          try { (marker as any).addTo(mapInstance); } catch (ee) { /* ignore */ }
        }
        marker.openPopup();
        try { (marker as any).bringToFront(); } catch (e) { /* ignore */ }
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // ignore
    }
  }, [selectedMarkerId]);

  // fly to selected location when set
  useEffect(() => {
    const mapInstance = mapRef.current;
    if (!mapInstance || !selectedLocation) return;
    try {
      // Preserve the existing filter circle center so selecting a result doesn't move the radius.
      const prevFilterCenter = filterCircleRef.current ? filterCircleRef.current.getLatLng() : null;

      mapInstance.flyTo([selectedLocation.latitude, selectedLocation.longitude], 15, { duration: 0.8 });
      // If we have a tracked marker for the selected id, highlight and open it.
      if (selectedMarkerId && markersByIdRef.current.has(selectedMarkerId)) {
        const m = markersByIdRef.current.get(selectedMarkerId)!;
        try {
          // Ensure the existing tracked marker is added to the map (it may have been
          // removed by radius filtering). Re-use the marker; do not create duplicates.
          try {
            if (mapInstance && !(mapInstance as any).hasLayer(m)) {
              (m as any).addTo(mapInstance);
            }
          } catch (e) {
            try { (m as any).addTo(mapInstance); } catch (ee) { /* ignore */ }
          }
          m.openPopup();
          try { (m as any).bringToFront(); } catch (e) { /* ignore */ }
        } catch (e) {
          // ignore
        }
        // remove any temporary popup used previously
        try { if (tempSelectedMarkerRef.current) { (tempSelectedMarkerRef.current as any).remove(); tempSelectedMarkerRef.current = null; } } catch (e) { /* ignore */ }
        // restore filter circle center (do not recenter radius when user selects a result)
        try { if (prevFilterCenter && filterCircleRef.current) { filterCircleRef.current.setLatLng(prevFilterCenter); } } catch (e) { /* ignore */ }
        return;
      }

      // If there's no existing tracked marker, open a temporary popup at the selected location
      // without creating a new marker (user requested no new markers be added).
      try {
        // remove any existing temp popup
        if (tempSelectedMarkerRef.current) {
          try { (tempSelectedMarkerRef.current as any).remove(); } catch (e) { /* ignore */ }
          tempSelectedMarkerRef.current = null;
        }

        // attempt to find suggestion details for popup text. If not present in searchResults
        // (eg. houses or saved-only items), fall back to selectedDetails passed from parent.
        let sugg = searchResults && selectedMarkerId ? searchResults.find((s) => String(s.id) === String(selectedMarkerId)) : null;
        if (!sugg && selectedDetails && selectedMarkerId && String(selectedDetails.id) === String(selectedMarkerId)) {
          sugg = selectedDetails;
        }
        const popupHtml = sugg ? `
            <div>
              <div style="font-weight:600;margin-bottom:6px;">${sugg.label}</div>
              <div style="font-size:90%;color:#666;margin-bottom:8px;">${sugg.address || ''}</div>
            </div>
          ` : '';

        const popup = L.popup({ closeOnClick: true, autoClose: true, closeButton: true, offset: [0, -30] })
          .setLatLng([selectedLocation.latitude, selectedLocation.longitude])
          .setContent(popupHtml || '')
          .openOn(mapInstance);

        tempSelectedMarkerRef.current = popup as any;
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to flyTo selected location', e);
    }
  }, [selectedLocation, selectedMarkerId]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div id="map" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default LocationsMap;
