import { Locale } from '../models/site-content.model';

export interface I18nFile {
  ui: Record<string, unknown>;
  content?: I18nContentOverlay;
}

export interface I18nContentOverlay {
  identity?: {
    tagline?: string;
    description?: string;
  };
  contact?: {
    address?: string;
  };
  pages?: {
    home?: {
      sections?: I18nHomeSectionPatch[];
    };
    integratedExperience?: {
      sections?: Array<{
        id?: string;
        title?: string;
        description?: string;
      }>;
    };
    brands?: {
      title?: string;
      subtitle?: string;
    };
    floorPlan?: {
      title?: string;
    };
    photos?: {
      title?: string;
    };
  };
}

export type I18nHomeSectionPatch = {
  type: string;
  headline?: string;
  title?: string;
  body?: string;
  subtitle?: string;
  ctas?: Array<{ text?: string }>;
  items?: Array<{
    label?: string;
    display?: string;
    text?: string;
    title?: string;
    description?: string;
    ctas?: Array<{ text?: string }>;
  }>;
};

export const NAV_LABEL_KEYS: Record<string, string> = {
  home: 'nav.home',
  brands: 'nav.brands',
  floorPlan: 'nav.floorPlan',
  photos: 'nav.photos',
};

export function getByPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, source);
}

export function uiText(dictionary: I18nFile | undefined, key: string): string {
  const value = getByPath(dictionary?.ui, key);
  return typeof value === 'string' ? value : key;
}

export function uiTextForLocale(
  dictionaries: Partial<Record<Locale, I18nFile>>,
  locale: Locale,
  key: string
): string {
  return uiText(dictionaries[locale], key);
}
