  /**
 * This component switches between ClientLayout and PublicLayout based on the user's authentication status.
 * User Logged in --> Sidebar layout (ClientLayout)
 * User Logged out --> Public layout (PublicLayout)
 */

'use client';

import { useSession } from 'next-auth/react';
import ClientLayout from './ClientLayout';
import PublicLayout from './PublicLayout';

export default function MainLayoutSwitcher({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // Optional: avoid flashing layout while session is loading
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#3A5B4F] text-white">
        Loading...
      </div>
    );
  }

  // Show ClientLayout (Sidebar) when logged in, PublicLayout otherwise
  if (session) {
    return <ClientLayout>{children}</ClientLayout>;
  }

  return <PublicLayout>{children}</PublicLayout>;
}
