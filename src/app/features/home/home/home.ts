import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  viewChild,
} from '@angular/core';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ContentService } from '../../../core/services/content';
import { LocalizePipe } from '../../../shared/pipes/localize-pipe';
import { TranslatePipe } from '../../../shared/pipes/translate-pipe';
import { LiquidBtnDirective } from '../../../shared/directives/liquid-btn';
import {
  CardsSection as CardsSectionModel,
  HeroSection,
  StatsSection,
} from '../../../core/models/site-content.model';

const FEATURE_ICONS = ['map', 'grid', 'store'] as const;

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, NgTemplateOutlet, RouterLink, LocalizePipe, TranslatePipe, LiquidBtnDirective],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements AfterViewInit {
  private readonly content = inject(ContentService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly heroContent = viewChild<ElementRef<HTMLElement>>('heroContent');
  private readonly featuresGrid = viewChild<ElementRef<HTMLElement>>('featuresGrid');

  readonly featureIcons = FEATURE_ICONS;

  readonly vm$ = this.content.getSiteContent().pipe(
    map((site) => {
      const sections = site.pages.home.sections;
      const hero = sections.find((s) => s.type === 'hero') as HeroSection | undefined;
      const stats = sections.find((s) => s.type === 'stats') as StatsSection | undefined;
      const cards = sections.find((s) => s.type === 'cards') as CardsSectionModel | undefined;

      return {
        name: site.identity.name,
        tagline: site.identity.tagline,
        headline: hero?.headline,
        phone: site.contact.phone,
        whatsapp: site.contact.whatsapp,
        maps: site.contact.maps,
        statLabel: stats?.items[0]?.label,
        features: (cards?.items ?? []).slice(0, 3).map((item, index) => ({
          ...item,
          icon: FEATURE_ICONS[index] ?? 'map',
          cta: item.ctas[0] ? this.content.mapCta(item.ctas[0]) : undefined,
        })),
      };
    })
  );

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    const bindReveals = (): void => {
      document.querySelectorAll('.reveal-up:not(.active)').forEach((el) => observer.observe(el));
    };

    const sub = this.vm$.subscribe(() => queueMicrotask(bindReveals));
    this.destroyRef.onDestroy(() => {
      observer.disconnect();
      sub.unsubscribe();
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollY = window.scrollY;
    const hero = this.heroContent()?.nativeElement;
    const grid = this.featuresGrid()?.nativeElement;

    if (hero) {
      hero.style.transform = `translateY(${scrollY * 0.4}px)`;
      hero.style.opacity = String(Math.max(0, 1 - scrollY / 600));
    }

    if (grid) {
      grid.style.transform = `translateY(-${scrollY * 0.15}px)`;
    }
  }
}
