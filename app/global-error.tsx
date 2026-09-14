"use client";
import { useEffect } from "react";
import { themeScript } from "@/components/site/theme";
import "./globals.css";
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/global-error]", error);
  }, [error]);
  return (
    <html lang="en-GB" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body style={{ fontFamily: "Arial, sans-serif" }}>
        <main className="wrap error-page page-intro">
          <h1>The site couldn’t load.</h1>
          <p className="form-intro">
            The site couldn’t load. Please refresh the page or try again.
          </p>
          <div className="error-actions">
            <button className="solid-button" onClick={reset}>
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
