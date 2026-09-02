import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ContentService } from '../../../../core/services/content';
import { LocalizePipe } from '../../../../shared/pipes/localize-pipe';
import { SectionShell } from '../../../../shared/components/section-shell/section-shell';
import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal';
import { map } from 'rxjs';
import { resolveAsset } from '../../../../shared/utils/asset-url';

@Component({
  selector: 'app-categories-section',
  imports: [AsyncPipe, LocalizePipe, SectionShell, ScrollRevealDirective],
  templateUrl: './categories-section.html',
  styleUrl: './categories-section.scss',
})
export class CategoriesSection {
  readonly vm$ = inject(ContentService).getCategories().pipe(
    map((section) => ({
      section,
      image: resolveAsset(section?.images?.[0]),
    }))
  );
}
