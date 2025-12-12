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

/**
 * Changes the bio of an existing user in the database.
 * @param data, an object with the following properties: email, newBio.
 */
export async function changeBio(data: { id: number; newBio: string | null }) {
  await prisma.user.update({
    where: { id: data.id },
    data: {
      bio: data.newBio,
    },
  });
}

/**
 * Fetches the bio of a user based on their id
 * @param data, an object with the following properties: id.
 * @returns A string of the bio or null if none
 */
export async function fetchBio(data: { id: number }) {
  const bio = await prisma.user.findUnique({
    where: { id: data.id },
    select: {
      bio: true,
    },
  });
  return bio ? bio.bio : null;
}

/**
 * Changes the username of an existing user in the database.
 * @param data, an object with the following properties: email, newUsername.
 */
export async function changeUsername(data: { id: number; newUsername: string }) {
  await prisma.user.update({
    where: { id: data.id },
    data: {
      username: data.newUsername,
    },
  });
}

/**
 * Fetches the username of a user based on their id
 * @param data, an object with the following properties: id.
 * @returns The username
 */
export async function fetchUsername(data: { id: number }) {
  const username = await prisma.user.findUnique({
    where: { id: data.id },
    select: {
      username: true,
    },
  });
  return username ? username.username : null;
}

/**
 * Changes the email of an existing user in the database.
 * @param data, an object with the following properties: id, newEmail.
 */
export async function changeEmail(data: { id: number; newEmail: string }) {
  await prisma.user.update({
    where: { id: data.id },
    data: {
      email: data.newEmail,
    },
  });
}

/**
 * Fetches the email of a user based on their id
 * @param data, an object with the following properties: id.
 * @returns The email
 */
export async function fetchEmail(data: { id: number }) {
  const email = await prisma.user.findUnique({
    where: { id: data.id },
    select: {
      email: true,
    },
  });
  return email ? email.email : null;
}
