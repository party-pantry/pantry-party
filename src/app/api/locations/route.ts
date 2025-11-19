/* eslint-disable import/prefer-default-export */
import { NextRequest } from 'next/server';
import axios from 'axios';

const { ORS_API_KEY, ORS_BASE_URL } = process.env;

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  const sizeParam = req.nextUrl.searchParams.get('size');
  const size = sizeParam ? Math.min(10, Math.max(1, Number(sizeParam))) : 5;

  if (!address || typeof address !== 'string') {
    return new Response(JSON.stringify({ error: 'Address required' }), { status: 400 });
  }

  try {
    const base = ORS_BASE_URL?.replace(/\/$/, '') || 'https://api.openrouteservice.org';
    const response = await axios.get(`${base}/geocode/search`, {
      params: {
        api_key: ORS_API_KEY,
        text: address,
        size,
      },
    });

    const features = response.data.features || [];
    if (!features.length) {
      return new Response(JSON.stringify({ error: 'No results found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ latitude: coords[1], longitude: coords[0] }), { status: 200 });
    const suggestions = features.map((feature: any) => {
      const coords = feature.geometry?.coordinates || [];
      const props = feature.properties || {};
      const label = props.label || props.name || props.formatted || props.street || props.city || address;
      return {
        label,
        latitude: coords[1] ?? null,
        longitude: coords[0] ?? null,
      };
    });

    return new Response(JSON.stringify({ suggestions }), { status: 200 });
  } catch (error: any) {
    console.error('Geocoding error:', error?.message || error);
    return new Response(JSON.stringify({ error: 'Failed to fetch geocoding data' }), { status: 500 });
  }
}
