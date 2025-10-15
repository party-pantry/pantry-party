import type { Metadata } from 'next';
import { Geist, Geist_Mono, Lato, Nunito_Sans } from 'next/font/google';
// import NavBar from '../components/home-components/NavBar';
import TopBar from '../components/home-components/TopBar';
import SideBar from '../components/home-components/SideBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import SessionProviderWrapper from '../components/auth-components/SessionProviderWrapper';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['400', '700'], // adjust as needed
});

const nunitoSans = Nunito_Sans({
  variable: '--font-nunito-sans',
  subsets: ['latin'],
  weight: ['400', '600'], // adjust as needed
});

export const metadata: Metadata = {
  title: 'Pantry Party',
  description: 'Platform for managing and organizing your pantry items across multiple kitchens and storage spaces.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProviderWrapper>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${lato.variable} ${nunitoSans.variable} antialiased`}
        >
          <div className="flex min-h-screen">
            <SideBar />
            <main className="flex-1">
              <TopBar />
              {children}
            </main>
          </div>
        {/* <Footer /> */}
        </body>
      </html>
    </SessionProviderWrapper>
  );
}
