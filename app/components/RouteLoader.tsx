/**
 * Unified page loader: an indeterminate sweep using the same loading-bar
 * styling (rule track + ghost-strong fill). Used as the Suspense fallback in
 * route-level loading.tsx files. Pure CSS animation, so it stays a Server
 * Component. See ADR-0007.
 */
export function RouteLoader() {
  return (
    <div className="fixed inset-x-0 top-0 z-[60]" aria-hidden="true">
      <div className="loadbar-track overflow-hidden">
        <div className="loadbar-fill loadbar-indeterminate" style={{ width: "40%" }} />
      </div>
    </div>
  );
}
