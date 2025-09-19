import { redirect } from 'next/navigation';

/**
 * Redirects to the sign in page if the user is not logged in.
 */
export const loggedInProtectedPage = (session: { user: { email: string; id: string; randomKey: string } } | null) => {
  if (!session) {
    redirect('/auth/signin');
  }
};
