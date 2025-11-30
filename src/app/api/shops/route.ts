import { NextResponse } from 'next/server';

type ReqBody = {
  latitude: number;
  longitude: number;
  buffer?: number; // meters
};

const MAX_BUFFER = 2000;

const SHOP_CATEGORY_IDS = new Set<number>([
  // --- Essentials & General ---
  518, // Supermarket
  475, // Grocery
  451, // Convenience
  456, // Department Store
  527, // Variety Store
  472, // General Store

  // --- Fresh Produce & Meat ---
  474, // Greengrocer
  434, // Butcher
  462, // Farm
  511, // Seafood
  493, // Marketplace

  // --- Specialty Food ---
  426, // Bakery
  503, // Organic
  455, // Deli
  454, // Dairy
  442, // Cheese
  515, // Spices
  450, // Confectionery

  // --- Beverages ---
  422, // Alcohol
  533, // Wine
  428, // Beverages
  448, // Coffee
  520, // Tea
]);

function sanitizeORSResponseText(text: string | null) {
  if (!text) return null;
  // replace literal NaN tokens (invalid JSON) with null
  return text.replace(/\bNaN\b/g, 'null');
}

export async function POST(req: Request) {
  const MAX_SAMPLE = 1200;
  try {
    const body: ReqBody = await req.json();
    if (typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
      return NextResponse.json({ error: 'latitude and longitude required' }, { status: 400 });
    }
    const buffer = Math.max(0, Math.min(MAX_BUFFER, Number(body.buffer || 1000)));

    const ORS_POI_URL = `${process.env.ORS_BASE_URL || 'https://api.openrouteservice.org'}/pois`;
    const ORS_API_KEY = process.env.ORS_API_KEY;
    if (!ORS_API_KEY) return NextResponse.json({ error: 'ORS API key not configured' }, { status: 500 });

    const payload = {
      request: 'pois',
      geometry: {
        geojson: { type: 'Point', coordinates: [body.longitude, body.latitude] },
        buffer,
      },
      limit: 500,
    };

    const resp = await fetch(ORS_POI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: ORS_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const respText = await resp.text().catch(() => null);
    if (!resp.ok) {
      console.error('ORS error', { status: resp.status, sample: respText?.slice?.(0, MAX_SAMPLE) });
      return NextResponse.json({ error: 'ORS request failed', details: respText }, { status: resp.status });
    }

    const sanitized = sanitizeORSResponseText(respText);
    let data: any;
    try {
      data = sanitized ? JSON.parse(sanitized) : {};
    } catch (parseErr) {
      console.error('Parse error', { parseErr: String(parseErr), sample: respText?.slice?.(0, MAX_SAMPLE) });
      return NextResponse.json({ error: 'Invalid ORS response' }, { status: 502 });
    }

    const features = Array.isArray(data.features) ? data.features : [];

    const filtered = features.filter((f: any) => {
      // ORS category information can appear in different shapes; check all sensible places
      const catId = f?.properties?.category?.id ?? f?.properties?.category_id;
      if (typeof catId === 'number' && SHOP_CATEGORY_IDS.has(catId)) return true;
      const catMap = f?.properties?.category_ids;
      if (catMap && typeof catMap === 'object') {
        return Object.keys(catMap).some((k) => {
          const n = Number(k);
          return !Number.isNaN(n) && SHOP_CATEGORY_IDS.has(n);
        });
      }
      return false;
    });

    const shops = filtered
      .map((f: any, idx: number) => {
        const coords = f?.geometry?.coordinates ?? [];
        const lon = coords[0] ?? null;
        const lat = coords[1] ?? null;
        return {
          id: f?.properties?.id ?? f?.id ?? `ors-${idx}`,
          label: f?.properties?.name ?? f?.properties?.label ?? f?.properties?.osm_tags?.name ?? null,
          latitude: lat,
          longitude: lon,
          properties: f.properties ?? {},
        };
      })
      .filter((p: any) => p.latitude != null && p.longitude != null);

    return NextResponse.json({ shops, count: shops.length });
  } catch (err: any) {
    console.error('Handler error', err?.message || String(err));
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
