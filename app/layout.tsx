import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SiteFooter } from "./components/SiteFooter";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Emmetry",
  description: "An Emmet family record",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${ibmPlexMono.variable} pb-12`}>
          {children}
          <SiteFooter />
        </body>
      </html>
    </ClerkProvider>
  );
}
