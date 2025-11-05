'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import SideBar from './SideBar';
import TopBar from './TopBar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Hide sidebar and topbar on auth pages (signin and signup)
  const hidesSidebar = pathname === '/auth' || pathname === '/auth/signin';
  const hidesTopBar = pathname === '/auth' || pathname === '/auth/signin';

  return (
    <div className="flex min-h-screen">
      {!hidesSidebar && <SideBar onCollapseChange={setCollapsed} />}
      <main
        className={`flex-1 transition-all duration-300 ${
          !hidesSidebar && (collapsed ? 'md:ml-[85px]' : 'md:ml-[200px]')
        }`}
      >
        {!hidesTopBar && <TopBar />}
        {children}
      </main>
    </div>
  );
}
