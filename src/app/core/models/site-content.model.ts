export type Locale = 'ar' | 'en';

export interface LocalizedText {
  ar?: string;
  en?: string;
}

export interface MediaAsset {
  local?: string;
  originalUrl?: string;
  originalFilename?: string;
  alt?: string;
}

export interface CtaLink {
  url: string;
  text: LocalizedText;
}

export interface NavItem {
  id: string;
  label: LocalizedText;
  legacyUrl: string;
  path: string;
}

export interface SiteContent {
  identity: {
    name: LocalizedText;
    tagline: LocalizedText;
    description: LocalizedText;
    colors: Record<string, string>;
    logo: MediaAsset;
    language: string;
    direction: 'rtl' | 'ltr';
  };
  contact: {
    phone: string;
    whatsapp: string;
    facebook: string;
    maps: string;
    address: LocalizedText;
  };
  navigation: NavItem[];
  pages: {
    home: {
      sections: HomeSection[];
    };
    integratedExperience: {
      slug: string;
      sections: ExperienceSection[];
    };
    brands: {
      title: LocalizedText;
      subtitle: LocalizedText;
      items: BrandItem[];
    };
    floorPlan: {
      title: LocalizedText;
      images: MediaAsset[];
    };
    photos: {
      title: LocalizedText;
      gallery: MediaAsset[];
    };
  };
}

export type HomeSection =
  | HeroSection
  | StatsSection
  | FeaturesSection
  | AboutSection
  | CardsSection
  | CategoriesSection
  | ContactSection;

export interface HeroSection {
  type: 'hero';
  headline: LocalizedText;
  ctas: CtaLink[];
  images: MediaAsset[];
}

export interface StatsSection {
  type: 'stats';
  items: Array<{
    label: LocalizedText;
    value: string;
    unit: string;
    display: LocalizedText;
  }>;
}

export interface FeaturesSection {
  type: 'features';
  items: Array<{ text: LocalizedText }>;
}

export interface AboutSection {
  type: 'about';
  title: LocalizedText;
  body: LocalizedText;
}

export interface CardsSection {
  type: 'cards';
  items: Array<{
    title: LocalizedText;
    description: LocalizedText;
    ctas: CtaLink[];
  }>;
}

export interface CategoriesSection {
  type: 'categories';
  title: LocalizedText;
  subtitle: LocalizedText;
  items: Array<{
    title: LocalizedText;
    description?: LocalizedText;
  }>;
  images: MediaAsset[];
}

export interface ContactSection {
  type: 'contact';
  title: LocalizedText;
  subtitle: LocalizedText;
  ctas: CtaLink[];
}

export interface ExperienceSection {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  image: MediaAsset;
}

export interface BrandItem {
  name: string;
  logo: MediaAsset;
}
