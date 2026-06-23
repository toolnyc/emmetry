import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { people } from "@/db/schema";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { GlobalProgress } from "./components/GlobalProgress";
import { BodyScrollbar } from "./components/BodyScrollbar";
import "overlayscrollbars/overlayscrollbars.css";
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

async function getSearchMembers() {
  const rows = await db
    .select({ id: people.id, name: people.name })
    .from(people)
    .where(isNotNull(people.name));
  return rows
    .filter((r): r is { id: string; name: string } => Boolean(r.name))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const members = await getSearchMembers();

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.variable} ${ibmPlexMono.variable} pb-12`}
          suppressHydrationWarning
        >
          <BodyScrollbar />
          <GlobalProgress />
          <SiteHeader people={members} />
          {children}
          <SiteFooter />
        </body>
      </html>
    </ClerkProvider>
  );
}
