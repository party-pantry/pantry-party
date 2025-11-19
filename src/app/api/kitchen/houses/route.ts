import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/authOptions';

const { ORS_API_KEY, ORS_BASE_URL } = process.env;

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: Request) {
  try {
    const { name, address, userId, latitude, longitude } = await req.json();
    if (!name || !userId || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Check for existing house with same name for this user (case-insensitive)
    const existing = await prisma.house.findFirst({
      where: { userId: Number(userId), name: { equals: name, mode: 'insensitive' } },
      select: { id: true, name: true },
    });
    if (existing) {
      return NextResponse.json({ error: 'House already exists', houseName: existing.name }, { status: 409 });
    }

    let lat = latitude;
    let lng = longitude;

    // If lat/lng weren't provided, attempt server-side geocoding
    if ((lat == null || lng == null) && address) {
      try {
        const base = ORS_BASE_URL?.replace(/\/$/, '') || 'https://api.openrouteservice.org';
        const geoRes = await axios.get(`${base}/geocode/search`, {
          params: { api_key: ORS_API_KEY, text: address, size: 1 },
        });
        const feature = geoRes.data.features?.[0];
        if (feature) {
          const coords = feature.geometry?.coordinates || [];
          lat = coords[1];
          lng = coords[0];
        }
      } catch (err) {
        // ignore geocoding errors here — we'll still create the house with address only
        // eslint-disable-next-line no-console
        console.error('Server geocoding error', err);
      }
    }

    const newHouse = await prisma.house.create({
      data: { name, address, userId: Number(userId), latitude: lat ?? undefined, longitude: lng ?? undefined },
    });

    return NextResponse.json(newHouse, { status: 201 });
  } catch (error) {
    // Try to surface Prisma unique constraint info if present
    // eslint-disable-next-line no-console
    console.error('Error creating house:', error);
    return NextResponse.json({ error: 'Failed to create house' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userIdParam = url.searchParams.get('userId');
    const where: any = {};

    if (userIdParam) {
      where.userId = Number(userIdParam);
    } else {
      // If caller didn't provide a userId, try to infer from the authenticated session
      const session = (await getServerSession(authOptions)) as any | null;
      if (session?.user?.id) {
        where.userId = Number(session.user.id);
      } else {
        // Not authenticated and no userId provided — don't return all houses
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
    }

    // return houses that have lat/lng if available
    const houses = await prisma.house.findMany({ where, select: { id: true, name: true, address: true, latitude: true, longitude: true, userId: true } });
    return NextResponse.json(houses, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching houses', err);
    return NextResponse.json({ error: 'Failed to fetch houses' }, { status: 500 });
  }
}
