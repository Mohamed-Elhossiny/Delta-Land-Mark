import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ContentService } from '../../../core/services/content';
import { PageHero } from '../../../shared/components/page-hero/page-hero';
import { SectionShell } from '../../../shared/components/section-shell/section-shell';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal';
import { resolveAsset } from '../../../shared/utils/asset-url';
import { map } from 'rxjs';

@Component({
  selector: 'app-photos',
  imports: [AsyncPipe, PageHero, SectionShell, ScrollRevealDirective],
  templateUrl: './photos.html',
  styleUrl: './photos.scss',
})
export class Photos {
  readonly vm$ = inject(ContentService).getSiteContent().pipe(
    map((c) => ({
      page: c.pages.photos,
      heroImage: resolveAsset(c.pages.photos.gallery[1] ?? c.pages.photos.gallery[0]),
      gallery: c.pages.photos.gallery.map((item) => ({
        ...item,
        src: resolveAsset(item),
      })),
    }))
  );
}
