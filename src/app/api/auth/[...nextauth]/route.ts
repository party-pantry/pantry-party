import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        identifier: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        // try to find user by email or username using findFirst
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: credentials.identifier }, { username: credentials.identifier }],
          },
        });
        if (!user) return null;

        // checking if password matches in database
        const validPassword = await compare(credentials.password, user.password);
        if (!validPassword) return null;

        return {
          id: `${user.id}`,
          email: user.email,
          name: user.username,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id,
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        return {
          ...token,
          id: (user as { id: string | number }).id,
        };
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
