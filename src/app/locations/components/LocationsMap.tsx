'use client';

import React, { useEffect, useRef } from 'react';
import L, { LatLngExpression } from 'leaflet';
// import { geocodeAddress } from '@/lib/openRouteService';
import 'leaflet/dist/leaflet.css';
import { createMapPinIcon } from '@/utils/locationsUtils';

const defaultView: LatLngExpression = [20.7, -157.5];

type Suggestion = { id?: string; label: string; latitude?: number | null; longitude?: number | null; address?: string };

const LocationsMap: React.FC<{
  onOpenFilters?: () => void;
  searchResults?: Suggestion[];
  selectedLocation?: { latitude: number; longitude: number } | null;
  selectedMarkerId?: string | null;
  onMarkerClick?: (id?: string, lat?: number | null, lon?: number | null) => void;
}> = ({ onOpenFilters, searchResults = [], selectedLocation = null, selectedMarkerId = null, onMarkerClick }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const houseMarkersRef = useRef<L.LayerGroup | null>(null);
  const markersByIdRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const filterCircleRef = useRef<L.Circle | null>(null);
  const filterPanelRef = useRef<HTMLElement | null>(null);
  const currentRadiusRef = useRef<number>(1000);
  const currentTypeRef = useRef<string>('all');

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map('map', {
      center: defaultView,
      zoom: 7.5,
      zoomControl: false,
    });

    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    const applyRadiusFilter = (centerLatLng: L.LatLng, radiusMeters: number) => {
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
        }
      } catch (e) {
        // ignore
      }
    };

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
                      <input class="form-check-input" type="radio" name="pp-filter-type" id="pp-filter-homes" value="homes">
                      <label class="form-check-label" for="pp-filter-homes">Homes</label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="radio" name="pp-filter-type" id="pp-filter-stores" value="stores">
                      <label class="form-check-label" for="pp-filter-stores">Stores</label>
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
                        if (typeSelected === 'homes') {
                          // hide search markers when homes-only
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
                          if (typeSelected === 'stores') {
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
                    }
                  } catch (err) {
                    // ignore
                  }
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

                      if (v === 'homes') {
                        // remove all search result markers
                        try { (markersRef.current as L.LayerGroup).eachLayer((layer: any) => { (layer as any).remove(); }); } catch (e) { /* ignore */ }
                        // show only house markers within radius
                        try { (houseMarkersRef.current as L.LayerGroup).eachLayer((layer: any) => { showHouseIfInRadius(layer); }); } catch (e) { /* ignore */ }
                      } else if (v === 'stores') {
                        // remove all house markers
                        try { (houseMarkersRef.current as L.LayerGroup).eachLayer((layer: any) => { (layer as any).remove(); }); } catch (e) { /* ignore */ }
                        // show only store/search markers within radius
                        try { (markersRef.current as L.LayerGroup).eachLayer((layer: any) => { showStoreIfInRadius(layer); }); } catch (e) { /* ignore */ }
                      } else {
                        // show both groups but only layers within radius
                        try { (markersRef.current as L.LayerGroup).eachLayer((layer: any) => { showStoreIfInRadius(layer); }); } catch (e) { /* ignore */ }
                        try { (houseMarkersRef.current as L.LayerGroup).eachLayer((layer: any) => { showHouseIfInRadius(layer); }); } catch (e) { /* ignore */ }
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
                    const homesRadio = panel.querySelector('#pp-filter-homes') as HTMLInputElement | null;
                    const storesRadio = panel.querySelector('#pp-filter-stores') as HTMLInputElement | null;
                    if (allRadio) allRadio.checked = true;
                    if (homesRadio) homesRadio.checked = false;
                    if (storesRadio) storesRadio.checked = false;
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
          hm.bindPopup(`<div style="font-weight:600">${h.name}</div><div class="text-muted small">${h.address || ''}</div>`);
          hm.addTo(houseMarkersRef.current as L.LayerGroup);
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
    } catch (e) {
      // ignore
    }

    map.on('locationfound', (e: L.LocationEvent) => {
      if (!mapRef.current) return;
      try {
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
    const mapInstance = mapRef.current;
    const markersLayer = markersRef.current;
    if (!mapInstance || !markersLayer) return;

    markersLayer.clearLayers();
    markersByIdRef.current.clear();

    searchResults.forEach((s) => {
      if (s.latitude == null || s.longitude == null) return;
      const isSelected = s.id != null && selectedMarkerId === s.id;
      const m = L.marker([s.latitude, s.longitude], {
        icon: createMapPinIcon({
          pinColor: isSelected ? 'yellow' : 'red',
          circleColor: 'white',
          size: isSelected ? 36 : 30,
          strokeColor: 'black',
          strokeWidth: 1,
        }),
      });

      // popup HTML: show place details
      const popupHtml = `
        <div>
          <div style="font-weight:600;margin-bottom:6px;">${s.label}</div>
          <div style="font-size:90%;color:#666;margin-bottom:8px;">${s.address || ''}</div>
        </div>
      `;

      m.bindPopup(popupHtml, { autoClose: false, closeOnClick: false });

      // click: notify parent (which will set selectedMarkerId) and open popup
      m.on('click', () => {
        try {
          if (onMarkerClick) onMarkerClick(s.id, s.latitude, s.longitude);
          m.setIcon(createMapPinIcon({ pinColor: 'yellow', circleColor: 'white', size: 36, strokeColor: 'black', strokeWidth: 1 }));
          m.openPopup();
          try { (m as any).bringToFront(); } catch (e) { /* ignore */ }
        } catch (e) {
          // ignore
        }
      });

      m.addTo(markersLayer as L.LayerGroup);
      // apply active type filter (if panel open) and radius filter (if circle exists)
      try {
  const radio = (document.querySelector('input[name="pp-filter-type"]:checked') as HTMLInputElement | null);
  const typeSelected = (radio && radio.value) || currentTypeRef.current || 'all';
        if (typeSelected === 'homes') {
          (m as any).remove();
        } else if (filterCircleRef.current) {
          const center = userMarkerRef.current ? userMarkerRef.current.getLatLng() : mapInstance.getCenter();
          const dist = mapInstance.distance(m.getLatLng(), center);
          if (dist > filterCircleRef.current.getRadius()) {
            (m as any).remove();
          }
        }
      } catch (e) {
        // ignore
      }

      if (s.id) markersByIdRef.current.set(s.id, m);
    });
  }, [searchResults, selectedMarkerId, onMarkerClick]);

  // when selectedMarkerId changes, ensure only that marker is yellow and others are red
  useEffect(() => {
    try {
      markersByIdRef.current.forEach((marker, key) => {
        const isSel = selectedMarkerId != null && key === selectedMarkerId;
        try {
          marker.setIcon(createMapPinIcon({ pinColor: isSel ? 'yellow' : 'red', circleColor: 'white', size: isSel ? 36 : 30, strokeColor: 'black', strokeWidth: 1 }));
          if (isSel) {
            marker.openPopup();
            try { (marker as any).bringToFront(); } catch (e) { /* ignore */ }
          }
        } catch (e) {
          // ignore per-marker errors
        }
      });
    } catch (e) {
      // ignore
    }
  }, [selectedMarkerId]);

  // fly to selected location when set
  useEffect(() => {
    const mapInstance = mapRef.current;
    if (!mapInstance || !selectedLocation) return;
    try {
      mapInstance.flyTo([selectedLocation.latitude, selectedLocation.longitude], 15, { duration: 0.8 });
      if (selectedMarkerId && markersByIdRef.current.has(selectedMarkerId)) {
        const m = markersByIdRef.current.get(selectedMarkerId)!;
        try {
          m.setIcon(createMapPinIcon({ pinColor: 'yellow', circleColor: 'white', size: 36, strokeColor: 'black', strokeWidth: 2 }));
          m.openPopup();
          try { (m as any).bringToFront(); } catch (e) { /* ignore */ }
        } catch (e) {
          // ignore
        }
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
