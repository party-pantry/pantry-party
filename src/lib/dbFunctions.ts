"use server";

//import { Stuff, Condition } from '@prisma/client';
//import { redirect } from 'next/navigation';
import { prisma } from "./prisma";
import { hash } from "bcryptjs";

/* Create a new user that does not exist in the database */
export async function createUser(credentials: {
  username: string;
  email: string;
  password: string;
}) {
  const password = await hash(credentials.password, 10);
  // Check if user with this email or username already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: credentials.email },
        { username: credentials.username },
      ],
    },
  });
  if (existingUser) {
    if (existingUser.email === credentials.email) {
      throw new Error("Email already in use");
    } else {
      throw new Error("Username already in use");
    }
  }
  await prisma.user.create({
    data: {
      email: credentials.email,
      username: credentials.username,
      password: password,
    },
  });
}

/* Create a new house */

// TODO: implement optional houseAddress
export async function addHouse(houseName: string, userId: number) {
  if (!userId) {
    throw new Error("User not authenticated");
  }
  await prisma.house.create({
    data: {
      name: houseName,
      userId: Number(userId),
    }
  })
}