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
