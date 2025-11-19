import { NextResponse } from 'next/server';
import { deleteHouse, updateHouse } from '@/lib/dbFunctions';
import axios from 'axios';

const { ORS_API_KEY, ORS_BASE_URL } = process.env;

// eslint-disable-next-line import/prefer-default-export
export async function DELETE(req: Request, { params }: { params: Promise<{ houseId: string }> }) {
  try {
    const { houseId: houseIdStr } = await params;
    const houseId = Number(houseIdStr);

    if (!houseId) {
      return NextResponse.json({ error: 'Missing houseId' }, { status: 400 });
    }
    await deleteHouse(houseId);

    return NextResponse.json({ message: 'House deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting house:', error);
    return NextResponse.json({ error: 'Failed to delete house' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ houseId: string }> }) {
  try {
    const { houseId: houseIdStr } = await params;
    const houseId = Number(houseIdStr);
    const { name, address } = await req.json();

    if (!houseId) {
      return NextResponse.json({ error: 'Missing houseId' }, { status: 400 });
    }

    let latitude: number | undefined;
    let longitude: number | undefined;

    // If address is provided, attempt geocoding to get lat/lng
    if (address) {
      try {
        const base = ORS_BASE_URL?.replace(/\/$/, '') || 'https://api.openrouteservice.org';
        const geoRes = await axios.get(`${base}/geocode/search`, {
          params: { api_key: ORS_API_KEY, text: address, size: 1 },
        });
        const feature = geoRes.data.features?.[0];
        if (feature) {
          const [lngFromGeo, latFromGeo] = feature.geometry?.coordinates || [];
          latitude = latFromGeo;
          longitude = lngFromGeo;
        }
      } catch (err) {
        // ignore geocoding errors
        // eslint-disable-next-line no-console
        console.error('Server geocoding error (PATCH)', err);
      }
    }

    const updatedHouse = await updateHouse(houseId, { name, address, latitude, longitude });

    if (!updatedHouse) {
      return NextResponse.json({ error: 'House not found' }, { status: 404 });
    }
    return NextResponse.json(JSON.parse(JSON.stringify(updatedHouse)), { status: 200 });
  } catch (error) {
    console.error('Error updating house:', error);
    return NextResponse.json({ error: 'Failed to update house' }, { status: 500 });
  }
}
