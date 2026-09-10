"use client";

import { useSyncExternalStore } from "react";
import { appearance, applyAppearance, THEME_KEY } from "./theme";

function currentTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const storedThemeChanged = (event: StorageEvent) => {
    if (event.key === THEME_KEY || event.key === null) {
      applyAppearance(appearance(event.newValue));
    }
  };
  // Honour a previously saved System choice until the visitor switches modes.
  const system = matchMedia("(prefers-color-scheme: dark)");
  const systemChanged = () => {
    if (document.documentElement.dataset.themePreference === "system") {
      applyAppearance("system");
    }
  };
  document.addEventListener("kemma:theme", onChange);
  window.addEventListener("storage", storedThemeChanged);
  system.addEventListener("change", systemChanged);
  return () => {
    document.removeEventListener("kemma:theme", onChange);
    window.removeEventListener("storage", storedThemeChanged);
    system.removeEventListener("change", systemChanged);
  };
}

export function Appearance() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "light");
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Switch to ${nextTheme} mode`}
      onClick={() => {
        try {
          localStorage.setItem(THEME_KEY, nextTheme);
        } catch {
          // The switch still works when storage is unavailable.
        }
        applyAppearance(nextTheme);
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden="true"
      >
        {theme === "dark" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
          </>
        ) : (
          <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
        )}
      </svg>
    </button>
  );
}
