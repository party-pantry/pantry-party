'use client';

import React, { useState } from 'react';
import SideBar from './SideBar';
import TopBar from './TopBar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <SideBar onCollapseChange={setCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          collapsed ? 'ml-[85px]' : 'ml-[200px]'
        }`}
      >
        <TopBar />
        {children}
      </main>
    </div>
  );
}
