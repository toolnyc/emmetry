export function UnionMarker({
  orientation = "horizontal",
  label = "Union",
}: {
  orientation?: "horizontal" | "vertical";
  label?: string;
}) {
  const text = (
    <span
      className="font-mono uppercase text-ghost-strong whitespace-nowrap"
      style={{
        fontSize: "var(--text-tagline)",
        letterSpacing: "var(--tracking-nav)",
      }}
    >
      {label}
    </span>
  );
  const dot = (
    <span
      className="w-2 h-2 rounded-full bg-union flex-shrink-0"
      aria-hidden="true"
    />
  );

  if (orientation === "vertical") {
    return (
      <span className="inline-flex items-center gap-2">
        {dot}
        {text}
      </span>
    );
  }

  return (
    <span className="relative inline-flex items-center gap-2">
      <span className="h-px w-8 bg-rule" aria-hidden="true" />
      {dot}
      <span className="h-px w-8 bg-rule" aria-hidden="true" />
      <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2">
        {text}
      </span>
    </span>
  );
}
