"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { ProjectMeta } from "@/lib/projects";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

interface Props {
  meta: ProjectMeta;
  content: string;
}

const mdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-heading font-bold text-3xl text-white mt-12 mb-4" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-heading font-semibold text-xl text-white mt-8 mb-3" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-[var(--silver)] leading-relaxed mb-4" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="flex flex-col gap-2 mb-6" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="flex items-start gap-3 text-[var(--silver)]">
      <span className="text-[var(--gold)] mt-1 shrink-0">—</span>
      <span {...props} />
    </li>
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="text-[var(--gold)] font-semibold" {...props} />
  ),
};

export function CaseStudyContent({ meta, content }: Props) {
  return (
    <article>
      {/* Hero */}
      <section className="relative pt-40 pb-20 bg-[var(--dark-bg)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,155,60,0.06)_0%,transparent_60%)] pointer-events-none" />

        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--muted)] hover:text-[var(--gold)] transition-colors mb-8"
            >
              ← Back to Work
            </Link>

            <div className="flex gap-2 flex-wrap mb-6">
              {meta.tags?.map((tag) => (
                <span key={tag} className="text-xs uppercase tracking-widest text-[var(--gold)] border border-[rgba(200,155,60,0.3)] px-3 py-1 rounded-sm">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl text-white mb-6 max-w-4xl">
              {meta.title}
            </h1>
            <p className="text-[var(--silver)] text-xl max-w-2xl mb-10">{meta.summary}</p>

            {/* Meta row */}
            <div className="flex flex-wrap gap-10 border-t border-[var(--border)] pt-8">
              {meta.client && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">Client</p>
                  <p className="text-white font-medium">{meta.client}</p>
                </div>
              )}
              {meta.role && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">Role</p>
                  <p className="text-white font-medium">{meta.role}</p>
                </div>
              )}
              {meta.year && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">Year</p>
                  <p className="text-white font-medium">{meta.year}</p>
                </div>
              )}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Cover image */}
      {meta.cover && (
        <motion.div
          layoutId={`project-${meta.slug}`}
          className="relative aspect-[21/9] overflow-hidden"
        >
          <Image
            src={meta.cover}
            alt={meta.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--dark-bg)]" />
        </motion.div>
      )}

      {/* MDX body */}
      <section className="py-16 bg-[var(--dark-bg)]">
        <Container narrow>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Render MDX as plain HTML since next-mdx-remote serialize must be called server-side */}
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: "" }}
            />
            {/* We use the mdxComponents style and render content directly */}
            <ContentRenderer content={content} />
          </motion.div>
        </Container>
      </section>

      {/* Navigation */}
      <section className="py-16 border-t border-[var(--border)] bg-[var(--dark-bg)]">
        <Container className="flex justify-between items-center">
          <Link href="/work">
            <Button variant="secondary">← All Work</Button>
          </Link>
          <Link href="/contact">
            <Button>Start a Project</Button>
          </Link>
        </Container>
      </section>
    </article>
  );
}

function ContentRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="font-heading font-bold text-3xl text-white mt-12 mb-4">
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="font-heading font-semibold text-xl text-white mt-8 mb-3">
          {line.replace("### ", "")}
        </h3>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={key++} className="flex items-start gap-3 text-[var(--silver)] mb-2">
          <span className="text-[var(--gold)] mt-1 shrink-0">—</span>
          <span dangerouslySetInnerHTML={{ __html: parseInline(line.replace("- ", "")) }} />
        </li>
      );
    } else if (line.trim() !== "") {
      elements.push(
        <p key={key++} className="text-[var(--silver)] leading-relaxed mb-4"
           dangerouslySetInnerHTML={{ __html: parseInline(line) }}
        />
      );
    }
  }

  return <div>{elements}</div>;
}

function parseInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--gold)] font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}
