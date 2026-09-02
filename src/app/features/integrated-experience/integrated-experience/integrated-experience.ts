import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ContentService } from '../../../core/services/content';
import { LocalizePipe } from '../../../shared/pipes/localize-pipe';
import { PageHero } from '../../../shared/components/page-hero/page-hero';
import { SectionShell } from '../../../shared/components/section-shell/section-shell';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal';
import { resolveAsset } from '../../../shared/utils/asset-url';
import { map } from 'rxjs';

@Component({
  selector: 'app-integrated-experience',
  imports: [AsyncPipe, LocalizePipe, PageHero, SectionShell, ScrollRevealDirective],
  templateUrl: './integrated-experience.html',
  styleUrl: './integrated-experience.scss',
})
export class IntegratedExperience {
  readonly vm$ = inject(ContentService).getSiteContent().pipe(
    map((c) => ({
      sections: c.pages.integratedExperience.sections.map((section) => ({
        ...section,
        imageSrc: resolveAsset(section.image),
      })),
      heroImage: resolveAsset(c.pages.integratedExperience.sections[0]?.image),
    }))
  );
}
