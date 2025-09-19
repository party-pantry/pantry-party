import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "john@test.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        // checking if password matches in database
        const validPassword = await compare(
          credentials.password,
          user.password
        );
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
    strategy: "jwt",
  },
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      };
    },
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as any;
        return {
          id: u.id,
        };
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
