import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content';
import { LocalizePipe } from '../../shared/pipes/localize-pipe';
import { TranslatePipe } from '../../shared/pipes/translate-pipe';
import { SplitCta } from '../../shared/components/split-cta/split-cta';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal';
import { map } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [AsyncPipe, RouterLink, LocalizePipe, TranslatePipe, SplitCta, ScrollRevealDirective],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private readonly content = inject(ContentService);

  readonly site$ = this.content.getSiteContent();
  readonly nav$ = this.content.getNavigation();
  readonly whatsapp$ = this.site$.pipe(map((c) => c.contact.whatsapp));
}
