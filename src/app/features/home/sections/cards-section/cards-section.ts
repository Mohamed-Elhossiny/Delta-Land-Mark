import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ContentService } from '../../../../core/services/content';
import { LocalizePipe } from '../../../../shared/pipes/localize-pipe';
import { SectionShell } from '../../../../shared/components/section-shell/section-shell';
import { PrimaryCta } from '../../../../shared/components/primary-cta/primary-cta';
import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal';
import { map, combineLatest } from 'rxjs';

/** Background image per home card (by index). */
const CARD_BACKGROUNDS = [
  '/assets/integrated-experience/018-exterior-view-of-the-sign-at-the-front-of-a-hotel.jpg',
  '/assets/integrated-experience/004-Screenshot-2026-07-13-150255.png',
  '/assets/photos/044-Whisk_bdb3a72ebd8890ab0e943a9b7466a884dr.png',
  '/assets/floor-plan/015-Screenshot-2026-06-24-005729.png',
  '/assets/brands/004-preview-928x522-1.jpg',
  '/assets/home/076-Pic-42.jpg',
] as const;

@Component({
  selector: 'app-cards-section',
  imports: [AsyncPipe, LocalizePipe, SectionShell, PrimaryCta, ScrollRevealDirective],
  templateUrl: './cards-section.html',
  styleUrl: './cards-section.scss',
})
export class CardsSection {
  private readonly content = inject(ContentService);

  readonly cards$ = combineLatest([
    this.content.getCards(),
    this.content.getSiteContent(),
  ]).pipe(
    map(([section, site]) =>
      (section?.items ?? []).map((item, index) => {
        const ctas =
          item.ctas.length > 0
            ? item.ctas.map((cta) => this.content.mapCta(cta))
            : [
                this.content.mapCta({
                  url: site.contact.whatsapp,
                  text: { ar: 'تواصل معنا الآن', en: 'Contact us now' },
                }),
              ];

        return {
          ...item,
          image: CARD_BACKGROUNDS[index] ?? CARD_BACKGROUNDS[0],
          ctas,
        };
      })
    )
  );
}
