import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ContentService } from '../../../core/services/content';
import { LocalizePipe } from '../../../shared/pipes/localize-pipe';
import { TranslatePipe } from '../../../shared/pipes/translate-pipe';
import { FluidNodeDirective } from '../../../shared/directives/fluid-node';
import { HERO_VIDEO_PATH, resolveAsset } from '../../../shared/utils/asset-url';
import {
  AboutSection,
  CardsSection as CardsSectionModel,
  CategoriesSection,
  ContactSection,
  HeroSection,
  StatsSection,
} from '../../../core/models/site-content.model';

const CARD_SPANS = ['bio-span-4', 'bio-span-4', 'bio-span-4', 'bio-span-12'] as const;

const CARD_BACKGROUNDS = [
  '/assets/photos/018-Whisk_36153d35fd8c943ac1244c9087a6f7eadr-1.png',
  '/assets/floor-plan/015-Screenshot-2026-06-24-005729.png',
  '/assets/photos/044-Whisk_bdb3a72ebd8890ab0e943a9b7466a884dr.png',
  '/assets/home/038-Project-4.jpg',
] as const;

type HomeCardVm = CardsSectionModel['items'][number] & {
  span: string;
  image: string;
  ctas: ReturnType<ContentService['mapCta']>[];
};

type HomeVm = {
  heroHeadline: HeroSection['headline'] | undefined;
  contactCta: ReturnType<ContentService['mapCta']>;
  statValue: string;
  statShort: string;
  statLabel: StatsSection['items'][number]['label'] | undefined;
  about: AboutSection | undefined;
  location: CardsSectionModel['items'][number] | undefined;
  quote: CardsSectionModel['items'][number] | undefined;
  cards: HomeCardVm[];
  categories: CategoriesSection | undefined;
  contact: ContactSection | undefined;
  contactCtas: ReturnType<ContentService['mapCta']>[];
  portalImage: string;
  video: string;
};

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, NgClass, RouterLink, LocalizePipe, TranslatePipe, FluidNodeDirective],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements AfterViewInit {
  private readonly content = inject(ContentService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly portal = viewChild<ElementRef<HTMLElement>>('organicBreach');
  private readonly portalVideo = viewChild<ElementRef<HTMLVideoElement>>('portalVideo');

  readonly usePosterFallback = signal(false);
  private ticking = false;

  readonly vm$ = this.content.getSiteContent().pipe(
    map((site): HomeVm => {
      const sections = site.pages.home.sections;
      const hero = sections.find((s) => s.type === 'hero') as HeroSection | undefined;
      const stats = sections.find((s) => s.type === 'stats') as StatsSection | undefined;
      const about = sections.find((s) => s.type === 'about') as AboutSection | undefined;
      const cards = sections.find((s) => s.type === 'cards') as CardsSectionModel | undefined;
      const categories = sections.find((s) => s.type === 'categories') as CategoriesSection | undefined;
      const contact = sections.find((s) => s.type === 'contact') as ContactSection | undefined;
      const stat = stats?.items[0];
      const rawStat = Number(stat?.value ?? 52000);

      return {
        heroHeadline: hero?.headline,
        contactCta: this.content.mapCta({
          url: site.contact.whatsapp,
          text: { ar: 'تواصل معنا الآن', en: 'Contact us now' },
        }),
        statValue: Number.isFinite(rawStat) ? rawStat.toLocaleString('en-US') : '52,000',
        statShort: Number.isFinite(rawStat) ? `${Math.round(rawStat / 1000)}k` : '52k',
        statLabel: stat?.label,
        about,
        location: cards?.items[0],
        quote: cards?.items[1],
        cards: (cards?.items ?? []).slice(2).map((item, index) => ({
          ...item,
          span: CARD_SPANS[index] ?? 'bio-span-4',
          image: CARD_BACKGROUNDS[index] ?? CARD_BACKGROUNDS[0],
          ctas:
            item.ctas.length > 0
              ? item.ctas.map((cta) => this.content.mapCta(cta))
              : [this.content.mapCta({ url: site.contact.whatsapp, text: { ar: 'تواصل معنا الآن', en: 'Contact us now' } })],
        })),
        categories,
        contact,
        contactCtas: (contact?.ctas ?? []).map((cta) => this.content.mapCta(cta)),
        portalImage: resolveAsset(site.pages.photos.gallery[2] ?? site.pages.photos.gallery[0]),
        video: HERO_VIDEO_PATH,
      };
    })
  );

  ngAfterViewInit(): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = (): void => {
      if (prefersReducedMotion.matches) {
        this.usePosterFallback.set(true);
      } else {
        this.playVideo();
      }
    };
    syncMotion();
    prefersReducedMotion.addEventListener('change', syncMotion);
    this.destroyRef.onDestroy(() => prefersReducedMotion.removeEventListener('change', syncMotion));
  }

  onVideoReady(): void {
    if (!this.usePosterFallback()) {
      this.playVideo();
    }
  }

  onVideoError(): void {
    this.usePosterFallback.set(true);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.ticking) return;
    this.ticking = true;
    window.requestAnimationFrame(() => {
      const portal = this.portal()?.nativeElement;
      if (portal) {
        const scrolled = window.scrollY;
        portal.style.transform = `translate3d(0, ${scrolled * 0.12}px, 0) scale(${1 + scrolled * 0.0004}) rotate(${scrolled * 0.01}deg)`;
      }
      this.ticking = false;
    });
  }

  private playVideo(): void {
    const video = this.portalVideo()?.nativeElement;
    if (!video) return;
    video.play().catch(() => this.usePosterFallback.set(true));
  }
}
