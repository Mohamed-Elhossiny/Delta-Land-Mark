import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ContentService } from '../../../../core/services/content';
import { LocalizePipe } from '../../../../shared/pipes/localize-pipe';
import { PrimaryCta } from '../../../../shared/components/primary-cta/primary-cta';
import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal';
import { combineLatest, map } from 'rxjs';
import { resolveAsset } from '../../../../shared/utils/asset-url';

@Component({
  selector: 'app-contact-section',
  imports: [AsyncPipe, LocalizePipe, PrimaryCta, ScrollRevealDirective],
  templateUrl: './contact-section.html',
  styleUrl: './contact-section.scss',
})
export class ContactSection {
  private readonly content = inject(ContentService);

  readonly vm$ = combineLatest([
    this.content.getContact(),
    this.content.getSiteContent().pipe(
      map((site) => site.pages.photos.gallery[1] ?? site.pages.photos.gallery[0])
    ),
  ]).pipe(
    map(([section, imageAsset]) => ({
      section,
      image: resolveAsset(imageAsset),
      ctas: (section?.ctas ?? []).map((cta) => this.content.mapCta(cta)),
    }))
  );
}
