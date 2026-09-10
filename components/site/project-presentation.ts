export const projectPresentation: Record<
  string,
  {
    name: string;
    headline: string;
    image?: string;
    alt?: string;
    domain?: string;
    tone?: string;
  }
> = {
  "isgm-platform": {
    name: "ISGM",
    headline: "One institution. One connected platform.",
    image: "/design/isgm.png",
    alt: "ISGM homepage showing a smiling woman receiving her certificate",
    domain: "pisgm.org",
    tone: "isgm",
  },
  "estees-bakery": {
    name: "Cakes by Estee",
    headline: "A personal touch. An effortless order.",
    image: "/design/bakery.png",
    alt: "Cakes by Estee storefront and cake ordering experience",
    domain: "esteesbakery.com",
    tone: "bakery",
  },
  constract: {
    name: "Constract",
    headline: "A marketplace. Many moving parts.",
  },
  "kofi-asiedu-mahama": {
    name: "Kofi Asiedu Mahama",
    headline: "From the author. Directly to the reader.",
  },
  "ars-wovenu-memorial-chapel": {
    name: "Wovenu Memorial Chapel",
    headline: "A digital home. For a living community.",
  },
};
