'use server';

import { hash } from 'bcrypt';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';

/**
 * Changes the password of an existing user in the database.
 * @param credentials, an object with the following properties: email, password.
 */
export async function changePassword(credentials: { email: string; password: string }) {
  const password = await hash(credentials.password, 10);
  await prisma.user.update({
    where: { email: credentials.email },
    data: {
      password,
    },
  });
}

/**
 * Changes the username of an existing user in the database.
 * @param data, an object with the following properties: email, username.
 */
export async function changeUsername(data: { id: number; newUsername: string }) {
  await prisma.user.update({
    where: { id: data.id },
    data: {
      username: data.newUsername,
    },
  });
  // After updating, redirect to the profile page
  redirect('/profile');
}
