"use client";

import { useEffect, useRef, useState } from "react";

export function Sculpture() {
  const host = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        try {
          const { createSculpture } = await import("./sculpture-scene");
          if (cancelled) return;
          dispose = createSculpture(element, () => setAvailable(false));
          setAvailable(Boolean(dispose));
        } catch {
          setAvailable(false);
        }
      },
      { rootMargin: "150px" },
    );
    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
      dispose?.();
    };
  }, []);
  return (
    <div className="sculpture-area">
      <div
        id="sculpture"
        ref={host}
        role={available ? "group" : "img"}
        aria-label={
          available
            ? "Interactive layered color sculpture"
            : "Three layered color lenses"
        }
        aria-describedby={available ? "sculpture-help" : undefined}
        tabIndex={available ? 0 : undefined}
      >
        <svg
          className="sculpture-fallback"
          viewBox="0 0 600 600"
          aria-hidden="true"
        >
          <g transform="translate(300 300)" strokeWidth="5">
            <ellipse className="lens-one" cx="-104" rx="104" ry="162" opacity=".72" transform="rotate(-13 -104 0)" />
            <ellipse className="lens-two" cx="0" rx="104" ry="162" opacity=".8" />
            <ellipse className="lens-three" cx="104" rx="104" ry="162" opacity=".78" transform="rotate(13 104 0)" />
            <ellipse className="lens-glint" cx="104" rx="93" ry="151" opacity=".35" transform="rotate(13 104 0)" />
          </g>
        </svg>
      </div>
      <p id="sculpture-help" className="sr-only">
        Drag sideways or use arrow keys to turn the sculpture. Press Home to
        reset the view. Motion follows your device setting.
      </p>
    </div>
  );
}
