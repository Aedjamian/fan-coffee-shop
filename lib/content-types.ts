export type MenuItem = {
  id: string;
  name: string;
  price: string;
  description?: string;
};

export type MenuCategory = {
  id: string;
  title: string;
  subtitle: string;
  featured?: boolean;
  items: MenuItem[];
};

export type CustomSection = {
  /** Stable key for React and storage — do not reassign after create. */
  id: string;
  /** Optional URL hash for in-page links (e.g. specials → #specials). */
  anchor?: string;
  eyebrow?: string;
  heading: string;
  body: string;
  linkLabel?: string;
  linkHref?: string;
};

export type SiteContent = {
  brand: {
    nameStrong: string;
    nameSub: string;
  };
  hero: {
    tag: string;
    titleBefore: string;
    titleEmphasis: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  menuSection: {
    heading: string;
    subtitle: string;
  };
  menuCategories: MenuCategory[];
  about: {
    heading: string;
    body: string;
  };
  catering: {
    eyebrow: string;
    heading: string;
    body: string;
    note: string;
    ctaLabel: string;
    bullets: string[];
  };
  visit: {
    heading: string;
    subtitle: string;
    hours: string;
    addressLine1: string;
    addressLine2: string;
    mapsQuery: string;
    phone: string;
    phoneTel: string;
  };
  footer: {
    text: string;
  };
  customSections: CustomSection[];
};
