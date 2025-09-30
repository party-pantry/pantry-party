'use server';

// import { Stuff, Condition } from '@prisma/client';
// import { redirect } from 'next/navigation';
// eslint-disable-next-line import/no-extraneous-dependencies
// eslint-disable-next-line import/prefer-default-export

import { hash } from 'bcryptjs';
import { Unit, Status, Category } from '@prisma/client';
import { prisma } from './prisma';

/* Create a new user with unique email and username */
// eslint-disable-next-line import/prefer-default-export
export async function createUser(credentials: {
  username: string;
  email: string;
  password: string;
}) {
  const password = await hash(credentials.password, 10);
  // Check if user with this email or username already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: credentials.email }, { username: credentials.username }],
    },
  });
  if (existingUser) {
    if (existingUser.email === credentials.email) {
      throw new Error('Email already in use');
    } else {
      throw new Error('Username already in use');
    }
  }
  await prisma.user.create({
    data: {
      email: credentials.email,
      username: credentials.username,
      password,
    },
  });
}

/* Create new stock and able to create new ingredient */
export async function addItem(data: {
  name: string;
  quantity: number;
  status: Status;
  storageId: number;
  units: Unit;
}) {
  const sterilizedItemName = data.name.trim().toLowerCase();

  // Validate that the storage exists
  const storage = await prisma.storage.findUnique({
    where: { id: data.storageId },
  });

  if (!storage) {
    throw new Error(`Storage with ID ${data.storageId} does not exist`);
  }

  // First try to find existing ingredient
  let ingredient = await prisma.ingredient.findFirst({
    where: {
      name: sterilizedItemName,
    },
  });

  // If not found, try to create it (handle race condition)
  if (!ingredient) {
    try {
      ingredient = await prisma.ingredient.create({
        data: {
          name: sterilizedItemName,
        },
      });
    } catch (error: any) {
      // If creation fails due to unique constraint, try finding it again
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        ingredient = await prisma.ingredient.findFirst({
          where: {
            name: sterilizedItemName,
          },
        });
        if (!ingredient) {
          throw error; // Re-throw if still not found
        }
      } else {
        throw error;
      }
    }
  }

  const ingredientId = ingredient.id;

  // Create new stock
  await prisma.stock.create({
    data: {
      ingredientId,
      storageId: data.storageId,
      quantity: Number(data.quantity),
      unit: data.units,
      status: data.status,
    },
  });
}

/* Create a new house */
export async function addHouse(data: { name: string; address?: string; userId: number }) {
  await prisma.house.create({
    data: {
      name: data.name,
      address: data.address,
      userId: Number(data.userId),
    },
  });
}

/* Delete house by id */
export async function deleteHouse(houseId: number) {
  await prisma.house.delete({
    where: { id: houseId },
  });
}

/* Create a new storage/pantry */
export async function addStorage(data: { name: string; type: Category; houseId: number }) {
  await prisma.storage.create({
    data: {
      name: data.name,
      type: data.type,
      houseId: data.houseId,
    },
  });
}
