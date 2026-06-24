"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="font-mono uppercase text-ghost-mid transition-colors duration-200 hover:text-ghost-strong"
      style={{
        fontSize: "var(--text-label)",
        letterSpacing: "var(--tracking-nav)",
        transitionTimingFunction: "var(--ease-standard)",
      }}
    >
      Back
    </button>
  );
}
