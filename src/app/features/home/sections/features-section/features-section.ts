import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ContentService } from '../../../../core/services/content';
import { LocalizePipe } from '../../../../shared/pipes/localize-pipe';
import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal';
import { combineLatest, map } from 'rxjs';
import { resolveAsset } from '../../../../shared/utils/asset-url';

@Component({
  selector: 'app-features-section',
  imports: [AsyncPipe, LocalizePipe, ScrollRevealDirective],
  templateUrl: './features-section.html',
  styleUrl: './features-section.scss',
})
export class FeaturesSection {
  private readonly content = inject(ContentService);

  readonly vm$ = combineLatest([
    this.content.getFeatures(),
    this.content.getSiteContent().pipe(
      map((site) => site.pages.photos.gallery[3] ?? site.pages.photos.gallery[1] ?? site.pages.photos.gallery[0])
    ),
  ]).pipe(
    map(([features, imageAsset]) => ({
      features,
      image: resolveAsset(imageAsset),
    }))
  );

  formatIndex(index: number): string {
    return String(index + 1).padStart(2, '0');
  }
}
