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

    const radiusInMeters = buffer;
    const overpassQuery = `
      [out:json][timeout:10];
      (
        node["shop"~"supermarket|grocery|convenience|greengrocer|butcher|seafood|bakery|deli|dairy|cheese|beverages|spices|organic"](around:${radiusInMeters},${body.latitude},${body.longitude});
        way["shop"~"supermarket|grocery|convenience|greengrocer|butcher|seafood|bakery|deli|dairy|cheese|beverages|spices|organic"](around:${radiusInMeters},${body.latitude},${body.longitude});
      );
      out center tags;
    `;

    const resp = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(overpassQuery)}`,
      signal: AbortSignal.timeout(12000), // 12 second timeout
    });

    if (!resp.ok) {
      console.error('Overpass API error', { status: resp.status });
      
      // Return empty results on timeout instead of erroring
      if (resp.status === 504 || resp.status === 429) {
        console.warn('Overpass API timeout/rate limit, returning empty results');
        return NextResponse.json({ count: 0, shops: [] }, { status: 200 });
      }
      
      return NextResponse.json({ error: 'Failed to fetch shops' }, { status: resp.status });
    }

    const data: any = await resp.json();
    const elements = Array.isArray(data.elements) ? data.elements : [];
    console.log('[DEBUG] Overpass returned', elements.length, 'elements');

    const shops = elements
      .map((el: any, idx: number) => {
        const lat = el.lat ?? el.center?.lat ?? null;
        const lon = el.lon ?? el.center?.lon ?? null;
        const name = el.tags?.name ?? el.tags?.brand ?? `Shop ${idx + 1}`;
        const shopType = el.tags?.shop ?? 'shop';
        const addrFull = el.tags?.['addr:full'];
        const addrNumber = el.tags?.['addr:housenumber'] ?? '';
        const addrStreet = el.tags?.['addr:street'] ?? '';
        const addressStr = `${addrNumber} ${addrStreet}`.trim();
        const address = addrFull ?? (addressStr || null);
        
        return {
          id: `osm-${el.type}-${el.id}`,
          label: name,
          latitude: lat,
          longitude: lon,
          properties: {
            name,
            address,
            category: { label: shopType, id: 0 },
            osm_type: el.type,
            osm_id: el.id,
            ...el.tags,
          },
        };
      })
      .filter((p: any) => p.latitude != null && p.longitude != null);

    console.log('[DEBUG] Returning', shops.length, 'shops');
    return NextResponse.json({ shops, count: shops.length });
  } catch (err: any) {
    console.error('Handler error', err?.message || String(err));
    
    // Return empty results on timeout instead of error
    if (err?.name === 'AbortError' || err?.message?.includes('timeout')) {
      console.warn('Request timeout, returning empty results');
      return NextResponse.json({ count: 0, shops: [] }, { status: 200 });
    }
    
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
