import { Injectable, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, filter, map, shareReplay } from 'rxjs';
import {
  AboutSection,
  CardsSection,
  CategoriesSection,
  ContactSection,
  CtaLink,
  FeaturesSection,
  HeroSection,
  HomeSection,
  LocalizedText,
  NavItem,
  SiteContent,
  StatsSection,
} from '../models/site-content.model';
import { LocaleService } from './locale';
import { I18nService } from './i18n';
import { I18nHomeSectionPatch, NAV_LABEL_KEYS } from '../i18n/i18n.types';

const ROUTE_MAP: Record<string, string> = {
  '/': '/',
  '/plane/': '/brands',
  '/brands/': '/floor-plan',
  '/photos/': '/photos',
};

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly locale = inject(LocaleService);
  private readonly i18n = inject(I18nService);

  private readonly rawContent$ = this.http
    .get<SiteContent>('assets/data/delta-landmark.json')
    .pipe(shareReplay(1));

  private readonly content$ = combineLatest([
    this.rawContent$,
    toObservable(this.locale.locale),
    toObservable(this.i18n.ready).pipe(filter(Boolean)),
  ]).pipe(
    map(([content, locale]) => this.localizeContent(content, locale)),
    shareReplay(1)
  );

  getSiteContent(): Observable<SiteContent> {
    return this.content$;
  }

  getNavigation(): Observable<NavItem[]> {
    return this.content$.pipe(
      map((c) =>
        c.navigation.map((item) => ({
          ...item,
          path: ROUTE_MAP[item.path] ?? item.path,
          label: {
            ar: this.i18n.translate(NAV_LABEL_KEYS[item.id] ?? item.id, 'ar'),
            en: this.i18n.translate(NAV_LABEL_KEYS[item.id] ?? item.id, 'en'),
          },
        }))
      )
    );
  }

  getHomeSection<T extends HomeSection['type']>(
    type: T
  ): Observable<Extract<HomeSection, { type: T }> | undefined> {
    return this.content$.pipe(
      map((c) => c.pages.home.sections.find((s) => s.type === type) as Extract<HomeSection, { type: T }> | undefined)
    );
  }

  getHero(): Observable<HeroSection | undefined> {
    return this.getHomeSection('hero');
  }

  getStats(): Observable<StatsSection | undefined> {
    return this.getHomeSection('stats');
  }

  getFeatures(): Observable<FeaturesSection | undefined> {
    return this.getHomeSection('features');
  }

  getAbout(): Observable<AboutSection | undefined> {
    return this.getHomeSection('about');
  }

  getCards(): Observable<CardsSection | undefined> {
    return this.getHomeSection('cards');
  }

  getCategories(): Observable<CategoriesSection | undefined> {
    return this.getHomeSection('categories');
  }

  getContact(): Observable<ContactSection | undefined> {
    return this.getHomeSection('contact');
  }

  resolveLink(url: string): string {
    if (url.includes('تجربة-متكاملة') || url.includes('%d8%aa%d8%ac%d8%b1%d8%a8%d8%a9')) {
      return '/integrated-experience';
    }
    if (url.includes('/plane/')) return '/brands';
    if (url.includes('/brands/') && !url.includes('maps')) return '/floor-plan';
    if (url.includes('/photos/')) return '/photos';
    if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      return url;
    }
    return url;
  }

  isExternal(url: string): boolean {
    return url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:');
  }

  mapCta(cta: CtaLink): CtaLink & { resolvedUrl: string; external: boolean } {
    const resolvedUrl = this.resolveLink(cta.url);
    return { ...cta, resolvedUrl, external: this.isExternal(resolvedUrl) };
  }

  private localizeContent(content: SiteContent, locale: 'ar' | 'en'): SiteContent {
    if (locale === 'ar') return content;

    const en = this.i18n.getContentOverlay('en');
    if (!en) return content;

    const enHomeSections = en.pages?.home?.sections ?? [];

    const homeSections = content.pages.home.sections.map((section) => {
      const patch = enHomeSections.find((s) => s.type === section.type);
      if (!patch) return section;
      return mergeSection(section, patch);
    });

    return {
      ...content,
      identity: {
        ...content.identity,
        tagline: pickText(content.identity.tagline, en.identity?.tagline),
        description: pickText(content.identity.description, en.identity?.description),
      },
      contact: {
        ...content.contact,
        address: pickText(content.contact.address, en.contact?.address),
      },
      pages: {
        ...content.pages,
        home: { sections: homeSections },
        brands: {
          ...content.pages.brands,
          title: pickText(content.pages.brands.title, en.pages?.brands?.title),
          subtitle: pickText(content.pages.brands.subtitle, en.pages?.brands?.subtitle),
        },
        floorPlan: {
          ...content.pages.floorPlan,
          title: pickText(content.pages.floorPlan.title, en.pages?.floorPlan?.title),
        },
        photos: {
          ...content.pages.photos,
          title: pickText(content.pages.photos.title, en.pages?.photos?.title),
        },
        integratedExperience: {
          ...content.pages.integratedExperience,
          sections: content.pages.integratedExperience.sections.map((section, index) => {
            const patch = en.pages?.integratedExperience?.sections?.[index];
            return patch
              ? {
                  ...section,
                  title: pickText(section.title, patch.title),
                  description: pickText(section.description, patch.description),
                }
              : section;
          }),
        },
      },
    };
  }
}

function pickText(base: LocalizedText, overlay?: string): LocalizedText {
  return {
    ar: base.ar ?? '',
    en: overlay ?? base.en ?? base.ar ?? '',
  };
}

function mergeSection(base: HomeSection, patch: I18nHomeSectionPatch): HomeSection {
  switch (base.type) {
    case 'hero':
      return {
        ...base,
        headline: pickText(base.headline, patch.headline),
        ctas: base.ctas.map((cta, i) => ({
          ...cta,
          text: pickText(cta.text, patch.ctas?.[i]?.text),
        })),
      };
    case 'stats':
      return {
        ...base,
        items: base.items.map((item, i) => ({
          ...item,
          label: pickText(item.label, patch.items?.[i]?.label),
          display: pickText(item.display, patch.items?.[i]?.display),
        })),
      };
    case 'features':
      return {
        ...base,
        items: base.items.map((item, i) => ({
          text: pickText(item.text, patch.items?.[i]?.text),
        })),
      };
    case 'about':
      return {
        ...base,
        title: pickText(base.title, patch.title),
        body: pickText(base.body, patch.body),
      };
    case 'cards':
      return {
        ...base,
        items: base.items.map((item, i) => ({
          ...item,
          title: pickText(item.title, patch.items?.[i]?.title),
          description: pickText(item.description, patch.items?.[i]?.description),
          ctas: item.ctas.map((cta, j) => ({
            ...cta,
            text: pickText(cta.text, patch.items?.[i]?.ctas?.[j]?.text),
          })),
        })),
      };
    case 'categories':
      return {
        ...base,
        title: pickText(base.title, patch.title),
        subtitle: pickText(base.subtitle, patch.subtitle),
        items: base.items.map((item, i) => ({
          ...item,
          title: pickText(item.title, patch.items?.[i]?.title),
          description: item.description
            ? pickText(item.description, patch.items?.[i]?.description)
            : undefined,
        })),
      };
    case 'contact':
      return {
        ...base,
        title: pickText(base.title, patch.title),
        subtitle: pickText(base.subtitle, patch.subtitle),
        ctas: base.ctas.map((cta, i) => ({
          ...cta,
          text: pickText(cta.text, patch.ctas?.[i]?.text),
        })),
      };
    default:
      return base;
  }
}
