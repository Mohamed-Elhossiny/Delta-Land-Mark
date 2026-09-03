import { Component, input, output, inject, HostListener, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ContentService } from '../../core/services/content';
import { LocaleService } from '../../core/services/locale';
import { TranslatePipe } from '../../shared/pipes/translate-pipe';
import { LocalizePipe } from '../../shared/pipes/localize-pipe';
import { LiquidBtnDirective } from '../../shared/directives/liquid-btn';
import { HEADER_LOGO_PATH } from '../../shared/utils/asset-url';
import { map } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [AsyncPipe, RouterLink, RouterLinkActive, TranslatePipe, LocalizePipe, LiquidBtnDirective],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly overlay = input(true);
  readonly menuOpen = input(false);
  readonly toggleMenu = output<void>();

  private readonly content = inject(ContentService);
  readonly locale = inject(LocaleService);

  readonly scrolled = signal(false);
  readonly logoSrc = HEADER_LOGO_PATH;
  readonly nav$ = this.content.getNavigation();
  readonly whatsapp$ = this.content.getSiteContent().pipe(map((c) => c.contact.whatsapp));

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 50);
  }

  toggleLocale(): void {
    this.locale.toggle();
  }
}
