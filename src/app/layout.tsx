import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "../components/home-components/NavBar";
import Footer from "../components/home-components/Footer";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import SessionProviderWrapper from "../components/auth-components/SessionProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pantry Party",
  description: "Platform for managing and organizing your pantry items across multiple kitchens and storage spaces.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <NavBar />
          {children}
          <Footer />
      </body>
    </html>
    </SessionProviderWrapper>
  );
}
