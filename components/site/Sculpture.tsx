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
      <div className="sculpture-ambient" aria-hidden="true" />
      <div
        id="sculpture"
        ref={host}
        role={available ? "group" : "img"}
        aria-label={
          available
            ? "Interactive metal sculpture"
            : "A continuous sculptural metal ribbon"
        }
        aria-describedby={available ? "sculpture-help" : undefined}
        tabIndex={available ? 0 : undefined}
      >
        <svg
          className="sculpture-fallback"
          viewBox="0 0 600 600"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="metal">
              <stop stopColor="#c6c7c0" />
              <stop offset=".2" stopColor="#f9faf6" />
              <stop offset=".45" stopColor="#747972" />
              <stop offset=".65" stopColor="#d7d9d0" />
              <stop offset="1" stopColor="#444c43" />
            </linearGradient>
          </defs>
          <g
            fill="none"
            stroke="url(#metal)"
            strokeWidth="45"
            transform="translate(300 280) rotate(-28)"
          >
            <ellipse rx="162" ry="115" transform="rotate(42)" />
            <ellipse rx="162" ry="115" transform="rotate(-42)" />
          </g>
        </svg>
      </div>
      <p id="sculpture-help" className="sr-only">
        Drag to rotate. On touch, swipe sideways to rotate or vertically to
        scroll. Use arrow keys to rotate, Home to reset, and Space to pause or
        resume.
      </p>
    </div>
  );
}
