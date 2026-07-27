import { Globe, Layers, Wrench, type LucideIcon } from "lucide-react";

/**
 * The three core capability groups.
 *
 * Everything listed here must be backed by work Kemma has actually delivered.
 * The previous version advertised Kubernetes, Docker, AWS, Go, Redis,
 * microservices, PyTorch, TensorFlow, LangChain, computer vision and MLOps —
 * none of which appear anywhere in the portfolio. Claims a technical buyer
 * can't see evidence for cost more credibility than the extra keywords win.
 *
 * AI belongs here only as applied capability (assisted workflows, integrating
 * existing AI services), not as model research or training.
 */
export interface Service {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  title: string;
  tagline: string;
  summary: string;
  /** What this service solves for the organisation buying it. */
  problems: string[];
  capabilities: string[];
  deliverables: string[];
  technologies: string[];
  /** Slugs of case studies that demonstrate this capability. */
  evidence: string[];
  href: string;
}

export const SERVICES: Service[] = [
  {
    id: "platforms",
    icon: Layers,
    iconColor: "#C89B3C",
    title: "Digital Platforms",
    tagline: "Systems that run real operations.",
    summary:
      "End-to-end systems that connect users, operations, payments, data and administration.",
    problems: [
      "Applications, approvals and records spread across forms, spreadsheets and email threads",
      "Manual payment reconciliation and no reliable audit trail",
      "Staff without a single place to review, decide and act",
      "Documents and certificates produced by hand, with no way to verify them",
    ],
    capabilities: [
      "Application and onboarding systems",
      "Customer and applicant portals",
      "Authentication and account management",
      "Administrative dashboards",
      "Payment integrations",
      "Document workflows",
      "Internal business systems",
      "Role-based access",
      "Data and reporting workflows",
    ],
    deliverables: [
      "A working platform in production, not a prototype",
      "Role-based administrative access for your team",
      "Payment processing wired to your provider",
      "Generated documents and public verification where the process needs it",
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "Paystack",
      "Resend",
      "REST APIs",
    ],
    evidence: ["isgm-platform", "constract"],
    href: "/services#platforms",
  },
  {
    id: "web",
    icon: Globe,
    iconColor: "#007B94",
    title: "Web Products and Experiences",
    tagline: "Clear, fast, and built to convert.",
    summary:
      "High-performance websites and web applications designed to communicate clearly, convert effectively and scale responsibly.",
    problems: [
      "A site that looks dated or loads slowly on the devices customers actually use",
      "Visitors who can't quickly tell what you do or what to do next",
      "Content that needs a developer every time it changes",
      "Growth limited by accessibility and performance debt",
    ],
    capabilities: [
      "Corporate and institutional websites",
      "Product websites",
      "E-commerce",
      "Content platforms",
      "Interactive experiences",
      "Responsive interface development",
      "Accessibility",
      "Internationalisation",
      "Performance optimisation",
      "SEO foundations",
    ],
    deliverables: [
      "A responsive site tested from small phones to large desktops",
      "Content your team can update without engineering support",
      "Accessibility and performance treated as requirements, not extras",
      "Metadata, structured data and sitemaps configured properly",
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "Contentful",
      "Vercel",
    ],
    evidence: ["kofi-asiedu-mahama", "estees-bakery", "ars-wovenu-memorial-chapel"],
    href: "/services#web",
  },
  {
    id: "engineering",
    icon: Wrench,
    iconColor: "#C89B3C",
    title: "Product Engineering and Modernisation",
    tagline: "Support for products that already matter.",
    summary:
      "Engineering support for organisations building, improving or modernising important digital products.",
    problems: [
      "A codebase that has become slow or risky to change",
      "A team that needs senior frontend depth for a defined stretch of work",
      "Accessibility or performance problems found late, close to a deadline",
      "Integrations and authentication flows nobody wants to touch",
    ],
    capabilities: [
      "React and Next.js development",
      "TypeScript architecture",
      "Frontend systems",
      "CMS integrations",
      "API integrations",
      "Authentication flows",
      "Testing and quality improvement",
      "Accessibility remediation",
      "Performance engineering",
      "Platform modernisation",
      "Technical audits",
      "AI-assisted workflow integration",
    ],
    deliverables: [
      "A written audit with findings ranked by impact, not a list of opinions",
      "Tests around the workflows that matter most",
      "Maintainable code your team can own after handover",
      "Measured before-and-after on performance and accessibility work",
    ],
    technologies: [
      "TypeScript",
      "Node.js",
      "GraphQL",
      "Vitest",
      "React Testing Library",
      "GitHub Actions",
      "Vercel",
    ],
    evidence: ["isgm-platform"],
    href: "/services#engineering",
  },
];
