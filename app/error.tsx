"use client";
import { useEffect } from "react";
import Link from "next/link";
import { PageIntro } from "@/components/site/PageIntro";
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);
  return (
    <div className="error-page">
      <PageIntro
        label="A momentary interruption"
        title="Something"
        quiet="went wrong."
        description="We couldn’t load this page. Try again, or head back to the beginning."
      />
      <div className="wrap error-actions">
        <button className="solid-button" onClick={reset}>
          Try again ↗
        </button>
        <Link className="text-link" href="/">
          Back to home ↗
        </Link>
      </div>
    </div>
  );
}
