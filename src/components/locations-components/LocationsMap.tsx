'use client';

import React, { useEffect, useRef } from 'react';
import L, { LatLngExpression, Icon as LeafletIcon, popup } from 'leaflet';
import { geocodeAddress } from '@/services/openRouteService';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { createMapPinIcon } from '@/utils/locationsUtils';

const defaultView: LatLngExpression = [20.7, -157.5];

const LocationsMap: React.FC = () => {
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (mapRef.current) return;

        const map = L.map('map', {
            center: defaultView,
            zoom: 7.5,
        });

        mapRef.current = map;

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.locate({ setView: true, maxZoom: 15 });
        
        map.on('locationfound', (e: L.LocationEvent) => {
            if (!mapRef.current) return;
            
            L.marker([e.latlng.lat, e.latlng.lng], {
                icon: createMapPinIcon({
                    pinColor: 'red',
                    circleColor: 'white',
                    size: 35,
                    strokeColor: 'black',
                    strokeWidth: 2,
                })
            })
                .addTo(map)
                .bindPopup('You are here')
                .openPopup();
        });
        map.on('locationerror', () => {
            alert('Could not get your location');
        });
    }, []);


    return (
        <div>
            <div id="map" className="w-full h-[500px]" />
        </div>
    )
}

export default LocationsMap;