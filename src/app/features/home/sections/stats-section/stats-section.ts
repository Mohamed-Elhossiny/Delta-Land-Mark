import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ContentService } from '../../../../core/services/content';
import { LocalizePipe } from '../../../../shared/pipes/localize-pipe';
import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal';
import { combineLatest, map } from 'rxjs';
import { resolveAsset } from '../../../../shared/utils/asset-url';

@Component({
  selector: 'app-stats-section',
  imports: [AsyncPipe, LocalizePipe, ScrollRevealDirective],
  templateUrl: './stats-section.html',
  styleUrl: './stats-section.scss',
})
export class StatsSection {
  private readonly content = inject(ContentService);

  readonly vm$ = combineLatest([
    this.content.getStats(),
    this.content.getSiteContent().pipe(
      map((site) => site.pages.photos.gallery[0] ?? site.pages.photos.gallery[2])
    ),
  ]).pipe(
    map(([stats, imageAsset]) => ({
      stats,
      image: resolveAsset(imageAsset),
    }))
  );
}
