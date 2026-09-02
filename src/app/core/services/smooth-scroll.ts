import { Injectable, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Lenis from 'lenis';

@Injectable({ providedIn: 'root' })
export class SmoothScrollService implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private lenis?: Lenis;
  private rafId = 0;
  private enabled = false;

  private readonly brandEasing = (t: number): number => Math.min(1, 1.001 - Math.pow(2, -10 * t));

  start(): void {
    if (!isPlatformBrowser(this.platformId) || this.lenis) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.lenis = new Lenis({
      duration: 1.35,
      easing: this.brandEasing,
      smoothWheel: true,
      wheelMultiplier: 0.78,
      touchMultiplier: 1,
      autoRaf: false,
    });

    this.enabled = true;

    const raf = (time: number): void => {
      this.lenis?.raf(time);
      this.rafId = requestAnimationFrame(raf);
    };
    this.rafId = requestAnimationFrame(raf);
  }

  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    this.lenis?.destroy();
    this.lenis = undefined;
    this.enabled = false;
  }

  pause(): void {
    this.lenis?.stop();
  }

  resume(): void {
    if (this.enabled) {
      this.lenis?.start();
    }
  }

  scrollToTop(): void {
    if (this.lenis) {
      this.lenis.scrollTo(0, {
        duration: 2.75,
        easing: this.brandEasing,
      });
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
