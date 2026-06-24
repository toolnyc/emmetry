"use client";

import { usePathname } from "next/navigation";
import { Wordmark } from "./Wordmark";
import { SearchAffordance } from "./SearchAffordance";
import { ModeNav } from "./ModeNav";

type Member = { id: string; name: string };

export function SiteHeader({ people }: { people: Member[] }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/geographical"))
    return null;

  return (
    <header className="bg-paper">
      <div className="flex items-stretch border-b border-rule">
        <div className="flex items-center border-r border-rule px-6 py-4 md:px-8">
          <Wordmark />
        </div>
        <div className="flex min-w-0 flex-1 items-center px-4 md:px-6">
          <SearchAffordance people={people} />
        </div>
      </div>
      <ModeNav />
    </header>
  );
}
