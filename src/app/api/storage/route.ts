import { prisma } from '../../../lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// POST data to create a new storage in a house
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    } 

    const body = await request.json();
    const { name, type, houseId } = body;

    if (!name || !type || !houseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const house = await prisma.house.findFirst({
      where: { 
        id: houseId, 
        userId: user.id 
      }
    });

    if (!house) {
      return NextResponse.json({ error: "House not found or unauthorized" }, { status: 404 });
    }

    const newStorage = await prisma.storage.create({
      data: {
        name,
        type,
        houseId: houseId
      }
    });

    return NextResponse.json(newStorage, { status: 201 });

  } catch (error) {
    console.error('POST error', error);
    return NextResponse.json({ error: 'Failed to create storage' }, { status: 500 });
  }
}