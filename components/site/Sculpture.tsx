"use client";

import { useEffect, useRef, useState } from "react";

export function Sculpture() {
  const host = useRef<HTMLDivElement>(null);
  const focusSculpture = useRef(false);
  const [available, setAvailable] = useState(false);
  const [requested, setRequested] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const load = async () => {
      try {
        const { createSculpture } = await import("./sculpture-scene");
        if (cancelled) return;
        dispose = createSculpture(element, () => {
          setAvailable(false);
          setUnavailable(true);
        });
        setAvailable(Boolean(dispose));
        setUnavailable(!dispose);
      } catch {
        if (!cancelled) setUnavailable(true);
      }
    };

    const autoLoad = matchMedia(
      "(min-width: 761px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let observer: IntersectionObserver | undefined;
    if (requested) {
      void load();
    } else if (autoLoad.matches) {
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer?.disconnect();
        if (autoLoad.matches) void load();
      }, { rootMargin: "150px" });
      observer.observe(element);
    }
    return () => {
      cancelled = true;
      observer?.disconnect();
      dispose?.();
    };
  }, [requested]);

  useEffect(() => {
    if (!available || !focusSculpture.current) return;
    focusSculpture.current = false;
    host.current?.focus({ preventScroll: true });
  }, [available]);

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
      {!available && (!unavailable || requested) && (
        <button
          type="button"
          className="sculpture-activate"
          aria-controls="sculpture"
          aria-disabled={requested}
          onClick={() => {
            if (requested) return;
            focusSculpture.current = true;
            setRequested(true);
          }}
        >
          {unavailable ? "3D view unavailable" : requested ? "Loading 3D view…" : "Explore in 3D"}
        </button>
      )}
      <p className="sr-only sculpture-status" role="status">
        {unavailable && requested ? "The 3D view is unavailable on this device." : ""}
      </p>
      <p id="sculpture-help" className="sr-only">
        Drag sideways or use arrow keys to turn the sculpture. Press Home to
        reset the view. Motion follows your device setting.
      </p>
    </div>
  );
}
