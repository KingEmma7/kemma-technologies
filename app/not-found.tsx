import Link from "next/link";
import { PageIntro } from "@/components/site/PageIntro";
export const metadata = { title: "Page not found" };
export default function NotFound() {
  return (
    <div className="error-page">
      <PageIntro
        label="404"
        title="Page not found."
        description="The address may have changed. Explore our work or head back to the beginning."
      />
      <div className="wrap error-actions">
        <Link href="/" className="solid-button">
          Back to home
        </Link>
        <Link href="/work" className="text-link">
          Explore our work
        </Link>
      </div>
    </div>
  );
}
