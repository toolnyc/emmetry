import Link from "next/link";

export function Wordmark() {
  return (
    <Link href="/" className="block">
      <span
        className="block font-sans font-[800] text-ink tracking-[-0.02em] leading-none"
        style={{ fontSize: "var(--text-wordmark)" }}
      >
        Emmetry
      </span>
      <span
        className="block font-mono uppercase text-ink mt-1"
        style={{
          fontSize: "var(--text-tagline)",
          letterSpacing: "var(--tracking-tagline)",
        }}
      >
        An Emmet Family Record
      </span>
    </Link>
  );
}
