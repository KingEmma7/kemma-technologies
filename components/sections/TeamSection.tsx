"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const team = [
  {
    name: "Emmanuel Asante",
    role: "Founder & CEO",
    bio: "Software architect with 12 years of experience across fintech and enterprise platforms. Alumnus of KNUST and MIT OpenCourseWare.",
    initials: "EA",
  },
  {
    name: "Akosua Boateng",
    role: "Chief Technology Officer",
    bio: "Leads platform engineering and AI research. Former senior engineer at a leading Pan-African payments company.",
    initials: "AB",
  },
  {
    name: "Kwame Osei",
    role: "Head of Design",
    bio: "10 years shaping digital products for global brands. Passionate about design systems that scale across cultures and contexts.",
    initials: "KO",
  },
  {
    name: "Abena Mensah",
    role: "Head of Client Solutions",
    bio: "Translates complex business challenges into clear technical briefs. Specialist in agritech and financial services.",
    initials: "AM",
  },
];

export function TeamSection() {
  return (
    <Section light>
      <Reveal>
        <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">The team</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-[#111] mb-16">
          People behind the work
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {team.map((member, i) => (
          <Reveal key={member.name} delay={i * 0.1}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="group flex flex-col gap-4"
            >
              {/* Avatar */}
              <div className="relative w-full aspect-square bg-gradient-to-br from-[#C89B3C22] to-[#007B9422] rounded-sm overflow-hidden flex items-center justify-center border border-transparent group-hover:border-[var(--gold)] transition-colors duration-300">
                <span className="font-heading font-bold text-5xl text-[var(--gold)] opacity-40 group-hover:opacity-80 transition-opacity duration-300">
                  {member.initials}
                </span>
                {/* Hover overlay */}
                <motion.div
                  className="absolute inset-0 bg-[rgba(200,155,60,0.05)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>

              <div>
                <h3 className="font-heading font-semibold text-lg text-[#111]">{member.name}</h3>
                <p className="text-xs uppercase tracking-widest text-[var(--gold)] mt-0.5 mb-2">{member.role}</p>
                <p className="text-sm text-[#555] leading-relaxed">{member.bio}</p>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
