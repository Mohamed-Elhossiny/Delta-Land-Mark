import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ContentService } from '../../../../core/services/content';
import { LocalizePipe } from '../../../../shared/pipes/localize-pipe';
import { SectionShell } from '../../../../shared/components/section-shell/section-shell';
import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal';
import { combineLatest, map } from 'rxjs';
import { resolveAsset } from '../../../../shared/utils/asset-url';

@Component({
  selector: 'app-about-section',
  imports: [AsyncPipe, LocalizePipe, SectionShell, ScrollRevealDirective],
  templateUrl: './about-section.html',
  styleUrl: './about-section.scss',
})
export class AboutSection {
  private readonly content = inject(ContentService);

  readonly vm$ = combineLatest([
    this.content.getAbout(),
    this.content.getSiteContent().pipe(
      map((site) => site.pages.photos.gallery[4] ?? site.pages.photos.gallery[2] ?? site.pages.photos.gallery[0])
    ),
  ]).pipe(
    map(([about, imageAsset]) => ({
      about,
      image: resolveAsset(imageAsset),
    }))
  );
}
