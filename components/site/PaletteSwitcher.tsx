"use client";

import { useSyncExternalStore } from "react";
import { applyPalette, palette, PALETTE_KEY, PALETTES } from "./theme";

function currentPalette() {
  return palette(document.documentElement.dataset.palette ?? null);
}

function subscribe(onChange: () => void) {
  const storedPaletteChanged = (event: StorageEvent) => {
    if (event.key === PALETTE_KEY || event.key === null) {
      applyPalette(palette(event.newValue));
    }
  };
  document.addEventListener("kemma:palette", onChange);
  window.addEventListener("storage", storedPaletteChanged);
  return () => {
    document.removeEventListener("kemma:palette", onChange);
    window.removeEventListener("storage", storedPaletteChanged);
  };
}

export function PaletteSwitcher() {
  const choice = useSyncExternalStore(subscribe, currentPalette, () => "powder");

  return (
    <div className="palette-switcher" role="group" aria-label="Color theme" data-choice={choice}>
      {PALETTES.map((item, index) => (
        <button
          type="button"
          key={item.id}
          className="palette-position"
          aria-label={`Color theme ${index + 1}: ${item.name}`}
          aria-pressed={choice === item.id}
          onClick={() => {
            try {
              localStorage.setItem(PALETTE_KEY, item.id);
            } catch {
              // The switch still works when storage is unavailable.
            }
            applyPalette(item.id);
          }}
        >
          <span
            className="palette-swatch"
            aria-hidden="true"
            style={{
              background: `conic-gradient(${item.colors[1]} 0 40%, ${item.colors[2]} 40% 59%, ${item.colors[0]} 59% 100%)`,
            }}
          />
        </button>
      ))}
    </div>
  );
}
