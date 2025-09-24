'use server';

// import { Stuff, Condition } from '@prisma/client';
// import { redirect } from 'next/navigation';
// eslint-disable-next-line import/no-extraneous-dependencies
import { hash } from 'bcryptjs';
import { prisma } from './prisma';
import { Unit, Status, Category } from '@prisma/client';

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

/* Add item from Ingredient table*/
export async function addItem(data: {
  name: string;
  quantity: number;
  status: string;
  category: string;
  storageId: number;
  unit: string;
}) {
  // Check if ingredient already exists
  const existingIngredient = await prisma.ingredient.findUnique({
    where: { name: data.name },
  });
  if (!data.ingredientId) {
    await prisma.stock.create({
      data: {
        storageId: data.storageId,
        quantity: data.quantity,
        unit: data.unit as Unit,
        status: data.status as Status,
        category: data.category as Category, // May not be needed
        custom_name: data.name,
      },
    });
  }

  // Add stock item assuming ingredientId is provided
  else {
    await prisma.stock.create({
      data: {
        ingredientId: data.ingredientId,
        storageId: data.storageId,
        quantity: data.quantity,
        unit: data.unit as Unit,
        status: data.status as Status,
        category: data.category as Category, // May not be needed
      },
    });
  }
}
