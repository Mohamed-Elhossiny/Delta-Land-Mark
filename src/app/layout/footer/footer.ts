import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content';
import { LocalizePipe } from '../../shared/pipes/localize-pipe';
import { TranslatePipe } from '../../shared/pipes/translate-pipe';
import { HEADER_LOGO_PATH } from '../../shared/utils/asset-url';

@Component({
  selector: 'app-footer',
  imports: [AsyncPipe, RouterLink, LocalizePipe, TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private readonly content = inject(ContentService);
  readonly site$ = this.content.getSiteContent();
  readonly logoSrc = HEADER_LOGO_PATH;
}
