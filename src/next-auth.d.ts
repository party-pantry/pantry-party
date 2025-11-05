import 'next-auth';

// Extend the User type to include 'username'
declare module 'next-auth' {
  interface User {
    username: string | null | undefined;
  }

  // Extend the Session type to include 'username' in user object
  interface Session {
    user: {
      username: string | null | undefined;
    } & DefaultSession['user'];
  }
}
