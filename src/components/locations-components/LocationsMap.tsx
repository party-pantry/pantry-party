'use client';

import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map, View, Feature } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import Point from 'ol/geom/Point';
import { Style, Circle, Fill } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { geocodeAddress } from '@/services/openRouteService';

const LocationsMap: React.FC = () => {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = React.useState<Map | null>(null);

    const vectorLayerRef = useRef(
        new VectorLayer({
            source: new VectorSource(),
            style: new Style({
                image: new Circle({ radius: 7, fill: new Fill({ color: 'red' }) }),
            }),
        })
    );

    useEffect(() => {
        if (!mapRef.current) return;

        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                vectorLayerRef.current,
            ],
            view: new View({
                center: fromLonLat([0, 0]),
                zoom: 2,
            }),
        });
        setMap(map);
        return () => map.setTarget(undefined);
    }, []);

    return (
        <div>
            <div ref={mapRef} className="w-full h-[500px]" />
        </div>
    )
}

export default LocationsMap;