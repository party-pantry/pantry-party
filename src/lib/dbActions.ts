'use server';

import { hash } from 'bcrypt';
// import { redirect } from 'next/navigation';
import { prisma } from './prisma';

/**
 * Creates a new user in the database.
 * @param credentials, an object with the following properties: email, username, password, confirmPassword
 */
export async function createUser(credentials: { email: string; username: string; password: string; confirmPassword: string; }) {
    try {
        const hashedPassword = await hash(credentials.password, 10);

        const newUser = await prisma.user.create({
            data: {
                email: credentials.email,
                password: hashedPassword,
            },
        });

    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Failed to create user');
    }
}
