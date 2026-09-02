import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ContentService } from '../../../core/services/content';
import { PageHero } from '../../../shared/components/page-hero/page-hero';
import { SectionShell } from '../../../shared/components/section-shell/section-shell';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal';
import { resolveAsset } from '../../../shared/utils/asset-url';
import { map } from 'rxjs';

@Component({
  selector: 'app-floor-plan',
  imports: [AsyncPipe, PageHero, SectionShell, ScrollRevealDirective],
  templateUrl: './floor-plan.html',
  styleUrl: './floor-plan.scss',
})
export class FloorPlan {
  readonly vm$ = inject(ContentService).getSiteContent().pipe(
    map((c) => ({
      page: c.pages.floorPlan,
      heroImage: resolveAsset(c.pages.floorPlan.images[0]),
      images: c.pages.floorPlan.images.map((image) => ({
        ...image,
        src: resolveAsset(image),
      })),
    }))
  );
}
