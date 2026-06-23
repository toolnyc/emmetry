"use client";

import { useEffect } from "react";
import { useOverlayScrollbars } from "overlayscrollbars-react";

/**
 * Initializes OverlayScrollbars on document.body so the page's vertical
 * scrollbar is a custom element (identical in every browser), not the native
 * one. Native scrollbar CSS can't be made consistent across Firefox and
 * WebKit/Blink; see ADR-0008.
 */
export function BodyScrollbar() {
  const [initialize] = useOverlayScrollbars({
    defer: true,
    options: {
      scrollbars: {
        theme: "os-theme-emmetry",
        autoHide: "scroll",
        autoHideDelay: 600,
      },
    },
  });

  useEffect(() => {
    initialize({
      target: document.body,
      cancel: { nativeScrollbarsOverlaid: false, body: false },
    });
  }, [initialize]);

  return null;
}
