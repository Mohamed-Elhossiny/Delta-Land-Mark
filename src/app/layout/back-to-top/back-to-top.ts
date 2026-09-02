import { Component, HostListener, inject, signal } from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate-pipe';
import { SmoothScrollService } from '../../core/services/smooth-scroll';

@Component({
  selector: 'app-back-to-top',
  imports: [TranslatePipe],
  templateUrl: './back-to-top.html',
  styleUrl: './back-to-top.scss',
})
export class BackToTop {
  private readonly smoothScroll = inject(SmoothScrollService);
  readonly visible = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.visible.set(window.scrollY > 420);
  }

  scrollToTop(): void {
    this.smoothScroll.scrollToTop();
  }
}
