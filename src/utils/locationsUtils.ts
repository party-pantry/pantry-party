/* eslint-disable import/prefer-default-export, max-len */
import L from 'leaflet';

interface MapPinOptions {
  pinColor?: string;
  circleColor?: string;
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

export function createMapPinIcon({
  pinColor = 'red',
  circleColor = 'white',
  size = 32,
  strokeColor = 'black',
  strokeWidth = 2,
}: MapPinOptions) {
  const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" fill="${pinColor}"/>
            <circle cx="12" cy="10" r="3" fill="${circleColor}"/>
        </svg>
    `;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}
