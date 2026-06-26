/** Single source of truth for the three core service offerings. */
export interface Service {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  tagline: string;
  summary: string;
  capabilities: string[];
  technologies: string[];
  href: string;
}

export const SERVICES: Service[] = [
  {
    id: "software",
    icon: "⚙️",
    iconColor: "#C89B3C",
    title: "Software Engineering",
    tagline: "Robust, scalable systems built to last.",
    summary:
      "From microservices architectures to monolithic modernisation, we engineer software that performs under pressure and grows with your business.",
    capabilities: [
      "Backend API design & development",
      "Microservices & distributed systems",
      "Database design & optimisation",
      "DevOps, CI/CD & cloud infrastructure",
      "Legacy system modernisation",
      "Performance engineering & load testing",
    ],
    technologies: ["Node.js", "Python", "Go", "PostgreSQL", "Redis", "AWS", "Docker", "Kubernetes"],
    href: "/services#software",
  },
  {
    id: "web",
    icon: "🌐",
    iconColor: "#007B94",
    title: "Web Platforms",
    tagline: "Experiences that convert, retain and delight.",
    summary:
      "We design and build high-performance web platforms — from marketing sites to complex SaaS dashboards — with a relentless focus on user experience and business outcomes.",
    capabilities: [
      "Product design & prototyping",
      "Next.js / React / Vue applications",
      "E-commerce & marketplace platforms",
      "CMS-powered content platforms",
      "Progressive web apps (PWA)",
      "Accessibility & internationalisation",
    ],
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Sanity", "Vercel"],
    href: "/services#web",
  },
  {
    id: "ai",
    icon: "🤖",
    iconColor: "#C89B3C",
    title: "Intelligent Digital Solutions",
    tagline: "AI that works in the real world.",
    summary:
      "We build AI-powered products grounded in practical business value — not hype. From recommendation engines to natural-language interfaces, we deploy models that move metrics.",
    capabilities: [
      "Machine learning model development",
      "Natural language processing (NLP)",
      "Computer vision applications",
      "Predictive analytics & forecasting",
      "AI product strategy & roadmapping",
      "MLOps & model monitoring",
    ],
    technologies: ["Python", "PyTorch", "TensorFlow", "LangChain", "OpenAI", "Hugging Face", "FastAPI"],
    href: "/services#ai",
  },
];
