"use server";

//import { Stuff, Condition } from '@prisma/client';
//import { redirect } from 'next/navigation';
import { prisma } from "./prisma";
import { hash } from "bcryptjs";

export async function createUser(credentials: {
  username: string;
  email: string;
  password: string;
}) {
  const password = await hash(credentials.password, 10);
  // Check if user with this email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: credentials.email },
  });
  if (existingUser) {
    throw new Error("Email already in use");
  }
  await prisma.user.create({
    data: {
      email: credentials.email,
      username: credentials.username,
      password: password,
    },
  });
}
