import { Component, input, output, inject, HostListener, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content';
import { LocaleService } from '../../core/services/locale';
import { ThemeService } from '../../core/services/theme';
import { TranslatePipe } from '../../shared/pipes/translate-pipe';
import { map } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [AsyncPipe, RouterLink, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly overlay = input(true);
  readonly menuOpen = input(false);
  readonly toggleMenu = output<void>();

  private readonly content = inject(ContentService);
  readonly locale = inject(LocaleService);
  private readonly theme = inject(ThemeService);

  readonly scrolled = signal(false);
  readonly whatsapp$ = this.content.getSiteContent().pipe(map((c) => c.contact.whatsapp));

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 48);
  }

  toggleLocale(): void {
    this.locale.toggle();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }
}
