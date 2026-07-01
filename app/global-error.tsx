"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root-level error boundary. Catches errors thrown by the root layout itself
 * (e.g. font loading, providers) where the regular error.tsx cannot help
 * because the layout it lives in has already failed. Must render its own
 * <html>/<body> since the root layout is bypassed.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[app/global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#040406", color: "#EDEDED", fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "1.5rem",
          }}
        >
          <div style={{ maxWidth: 32 + "rem" }}>
            <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#C89B3C", marginBottom: "1.5rem" }}>
              Critical Error
            </p>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#C8C8C8", marginBottom: "2.5rem" }}>
              The application failed to load. Please refresh the page.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "1rem 2rem",
                fontSize: "1rem",
                background: "#C89B3C",
                color: "#040406",
                fontWeight: 600,
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
