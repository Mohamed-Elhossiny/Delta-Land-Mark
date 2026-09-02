import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ContentService } from '../../../core/services/content';
import { PageHero } from '../../../shared/components/page-hero/page-hero';
import { SectionShell } from '../../../shared/components/section-shell/section-shell';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal';
import { resolveAsset } from '../../../shared/utils/asset-url';
import { map } from 'rxjs';

@Component({
  selector: 'app-brands',
  imports: [AsyncPipe, PageHero, SectionShell, ScrollRevealDirective],
  templateUrl: './brands.html',
  styleUrl: './brands.scss',
})
export class Brands {
  readonly vm$ = inject(ContentService).getSiteContent().pipe(
    map((c) => ({
      page: c.pages.brands,
      heroImage: resolveAsset(c.pages.photos.gallery[0]),
      brands: c.pages.brands.items.map((brand) => ({
        ...brand,
        logoSrc: resolveAsset(brand.logo),
      })),
    }))
  );
}
