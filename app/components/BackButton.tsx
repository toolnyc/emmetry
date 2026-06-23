"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="font-sans font-[400] leading-none text-ghost-mid transition-colors duration-200 hover:text-ghost-strong"
      style={{
        fontSize: "var(--text-name)",
        letterSpacing: "var(--tracking-name)",
        transitionTimingFunction: "var(--ease-standard)",
      }}
    >
      Back
    </button>
  );
}
