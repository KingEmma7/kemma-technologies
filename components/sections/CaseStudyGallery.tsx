import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

interface CaseStudyGalleryProps {
  title: string;
  /** Cover shown first when present; screenshots follow without duplicating the cover path. */
  cover?: string;
  screenshots?: string[];
}

function labelFromPath(src: string): string {
  const file = src.split("/").pop()?.replace(/\.(webp|png|jpe?g|avif)$/i, "") ?? "screenshot";
  return file
    .replace(/^isgm-/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CaseStudyGallery({ title, cover, screenshots = [] }: CaseStudyGalleryProps) {
  const images = [
    ...(cover ? [{ src: cover, label: "Overview" }] : []),
    ...screenshots
      .filter((src) => src !== cover)
      .map((src) => ({ src, label: labelFromPath(src) })),
  ];

  if (images.length === 0) return null;

  const [lead, ...rest] = images;

  return (
    <section className="border-y border-[var(--border)] bg-[rgba(255,255,255,0.02)] py-16 md:py-20">
      <Container>
        <Reveal>
          <p className="mb-4 text-xs uppercase tracking-widest text-[var(--gold)]">
            Product screens
          </p>
          <h2 className="mb-10 max-w-2xl font-heading text-3xl font-bold text-white md:text-4xl">
            The public journey, as shipped
          </h2>
        </Reveal>

        <Reveal>
          <figure className="overflow-hidden rounded-sm border border-[var(--border)] bg-[#0a0a0c]">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={lead.src}
                alt={`${title} — ${lead.label}`}
                fill
                className="object-cover object-top"
                sizes="(max-width: 1280px) 100vw, 1120px"
                priority
              />
            </div>
            <figcaption className="border-t border-[var(--border)] px-5 py-3 text-sm text-[var(--silver)]">
              {lead.label}
            </figcaption>
          </figure>
        </Reveal>

        {rest.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {rest.map((image, i) => (
              <Reveal key={image.src} delay={0.08 * (i + 1)}>
                <figure className="overflow-hidden rounded-sm border border-[var(--border)] bg-[#0a0a0c]">
                  <div className="relative aspect-[16/10] w-full">
                    <Image
                      src={image.src}
                      alt={`${title} — ${image.label}`}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <figcaption className="border-t border-[var(--border)] px-5 py-3 text-sm text-[var(--silver)]">
                    {image.label}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
