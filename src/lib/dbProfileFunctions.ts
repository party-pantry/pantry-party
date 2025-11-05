'use server';

// import { redirect } from 'next/navigation';
import { prisma } from './prisma';

/**
 * Changes the profile image of an existing user in the database.
 * @param data, an object with the following properties: email, newImage.
 */
export async function changeProfileImageUrl(data: { id: number; newImage: string | null }) {
  await prisma.user.update({
    where: { id: data.id },
    data: {
      image: data.newImage,
    },
  });
}

/**
 * Fetches the image url of a user based on their id
 * @param data, an object with the following properties: id.
 * @returns A the imageUrl or null if none
 */
export async function fetchProfileImageUrl(data: { id: number }) {
  const imageUrl = await prisma.user.findUnique({
    where: { id: data.id },
    select: {
      image: true,
    },
  });
  return imageUrl ? imageUrl.image : null;
}

/**
 * Fetches the username of a user based on their email.
 * @param data, an object with the following properties: email.
 */
export async function fetchUsernameByEmail(data: { email: string }) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      username: true,
    },
  });
  return user ? user.username : '';
}
