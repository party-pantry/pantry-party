'use server';

// import { Stuff, Condition } from '@prisma/client';
// import { redirect } from 'next/navigation';
// eslint-disable-next-line import/no-extraneous-dependencies
import { hash } from 'bcryptjs';
import { Unit, Status } from '@prisma/client';
import { prisma } from './prisma';

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

/* Add item from Ingredient table */
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
    } catch (error) {
      // If creation fails due to race condition, try finding it again
      ingredient = await prisma.ingredient.findFirst({
        where: {
          name: sterilizedItemName,
        },
      });
      if (!ingredient) {
        throw error; // Re-throw if still not found
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
