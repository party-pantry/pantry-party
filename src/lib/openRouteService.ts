/* eslint-disable import/prefer-default-export */

/**
 * Geocodes an address using the OpenRouteService API
 * @param address The address to geocode
 * @param size The amount of suggestions to return
 * @returns An array of geocoding suggestions
 */
export const geocodeAddress = async (address: string, size = 5) => {

  const res = await fetch(`/api/locations?address=${encodeURIComponent(address)}&size=${size}`);

  if (!res.ok) throw new Error('Failed to fetch geocoding data');

  const body = await res.json();

  // return array of suggestions for client autocomplete
  return body.suggestions || [];
};
