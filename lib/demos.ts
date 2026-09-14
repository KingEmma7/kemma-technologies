import pacePreview from "@/public/demo-previews/pace.webp";
import sillPreview from "@/public/demo-previews/sill.webp";
import aframPreview from "@/public/demo-previews/afram.webp";

export const demos = [
  {
    id: "pace",
    image: pacePreview,
    name: "PACE",
    category: "Gym & fitness",
    title: "From finding a class to a first session.",
    description:
      "A bold, welcoming training club. Explore the weekly timetable, meet the coaches and walk through a trial booking.",
    features: ["Filter classes by day and training type", "Explore coaches and membership options", "Try a simulated trial booking"],
    imageAlt: "PACE gym demo with cobalt blue typography, a Find your own pace headline and training photography",
  },
  {
    id: "sill",
    image: sillPreview,
    name: "SILL",
    category: "Property & real estate",
    title: "A considered way to find a home.",
    description:
      "An editorial property collection. Narrow the search, spend time with a home’s details and build a shortlist worth returning to.",
    features: ["Filter and sort fictional properties", "Save favourites on this device", "Preview a viewing enquiry"],
    imageAlt: "SILL property demo with architectural typography and an illustrative house photograph",
  },
  {
    id: "afram",
    image: aframPreview,
    name: "Afram Advisory",
    category: "Professional services",
    title: "Turn a business challenge into a clear brief.",
    description:
      "A thoughtful consultancy experience. Find the right expertise, read practical fieldnotes and prepare a guided consultation brief.",
    features: ["Explore services and fictional scenarios", "Search practical business fieldnotes", "Build a simulated consultation brief"],
    imageAlt: "Afram Advisory consultancy demo with plum accents and a clear business operations introduction",
  },
] as const;

export function demoEnquiry(name: string) {
  return `https://wa.me/233545559070?text=${encodeURIComponent(`Hi Kemma, I tried the ${name} demo and would like to discuss a similar website for my business.`)}`;
}
