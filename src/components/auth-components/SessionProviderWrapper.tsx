'use client';

import { SessionProvider } from 'next-auth/react';

// eslint-disable-next-line max-len, react/prop-types
const SessionProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => <SessionProvider>{children}</SessionProvider>;

export default SessionProviderWrapper;
