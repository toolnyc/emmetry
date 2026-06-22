import Link from "next/link";

export function SiteFooter() {
  const itemClass =
    "font-mono uppercase text-on-footer hover:opacity-70 transition-opacity";
  const itemStyle = {
    fontSize: "var(--text-nav)",
    letterSpacing: "var(--tracking-nav)",
  } as React.CSSProperties;

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 bg-footer"
      style={{ zIndex: 50 }}
    >
      {/* Desktop: Info · Login · Submit */}
      <div className="hidden md:grid grid-cols-3 items-center px-8 py-4">
        <span className={itemClass} style={itemStyle}>
          Info
        </span>
        <Link
          href="/admin/people"
          className={`${itemClass} text-center`}
          style={itemStyle}
        >
          Login
        </Link>
        <span className={`${itemClass} text-right`} style={itemStyle}>
          Submit
        </span>
      </div>

      {/* Mobile: Menu */}
      <div className="md:hidden flex justify-center px-8 py-4">
        <button className={itemClass} style={itemStyle}>
          Menu
        </button>
      </div>
    </footer>
  );
}
