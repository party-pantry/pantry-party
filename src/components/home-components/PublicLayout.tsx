/**
 * This layout will act as the layout for when a user is LOGGED OUT (unauthenticated)
 * (Mainly just for viewing the landing page)
*/

'use client';

import React from 'react';
import NavBar from './NavBar';
import Footer from './Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
