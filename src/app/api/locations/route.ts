/* eslint-disable import/prefer-default-export */
import { NextRequest } from 'next/server';
import axios from 'axios';

const { ORS_API_KEY } = process.env;

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');

  if (!address || typeof address !== 'string') {
    return new Response(JSON.stringify({ error: 'Address required' }), { status: 400 });
  }

  try {
    const response = await axios.get('https://api.openrouteservice.org/geocode/search', {
      params: {
        api_key: ORS_API_KEY,
        text: address,
        size: 1,
      },
    });

    const feature = response.data.features[0];
    if (!feature) {
      return new Response(JSON.stringify({ error: 'No results found' }), { status: 404 });
    }

    const coords = feature.geometry.coordinates;
    return new Response(JSON.stringify({ latitude: coords[1], longitude: coords[0] }), { status: 200 });
  } catch (error: any) {
    console.error('Geocoding error:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to fetch geocoding data' }), { status: 500 });
  }
}
