import { MDXRemote } from "next-mdx-remote/rsc";
import { Container } from "@/components/ui/Container";

const components = {
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
    <ul className="flex flex-col gap-2 mb-6 list-none" {...props} />
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="flex items-start gap-3 text-[var(--silver)]" {...props}>
      <span className="text-[var(--gold)] mt-1 shrink-0" aria-hidden="true">—</span>
      <span>{children}</span>
    </li>
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="text-[var(--gold)] font-semibold" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-[var(--gold)] underline underline-offset-4 hover:brightness-125 transition-all"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="bg-[rgba(255,255,255,0.06)] text-[var(--gold)] px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLElement>) => (
    <blockquote className="border-l-2 border-[var(--gold)] pl-6 my-6 italic text-[var(--silver)]" {...props} />
  ),
};

interface MdxSectionProps {
  content: string;
}

export async function MdxSection({ content }: MdxSectionProps) {
  return (
    <section className="py-16 bg-[var(--dark-bg)]">
      <Container narrow>
        <MDXRemote source={content} components={components} />
      </Container>
    </section>
  );
}
