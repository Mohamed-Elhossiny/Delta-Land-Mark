import { Injectable, signal } from '@angular/core';

const THEME_KEY = 'delta-landmark-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly synthesized = signal(false);

  constructor() {
    this.restore();
  }

  toggle(): void {
    const apply = (): void => {
      const next = !this.synthesized();
      this.synthesized.set(next);
      this.apply(next);
    };

    const startViewTransition = (
      document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }
    ).startViewTransition;

    startViewTransition ? startViewTransition(apply) : apply();
  }

  private restore(): void {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'synthesized') {
        this.synthesized.set(true);
        this.apply(true);
      }
    } catch {
      /* ignore */
    }
  }

  private apply(synthesized: boolean): void {
    if (synthesized) {
      document.body.setAttribute('data-theme', 'synthesized');
    } else {
      document.body.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem(THEME_KEY, synthesized ? 'synthesized' : 'obsidian');
    } catch {
      /* ignore */
    }
  }
}
