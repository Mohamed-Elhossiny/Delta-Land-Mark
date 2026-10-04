import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ContentService } from '../../../core/services/content';
import { PageHero } from '../../../shared/components/page-hero/page-hero';
import { SectionShell } from '../../../shared/components/section-shell/section-shell';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal';
import { TranslatePipe } from '../../../shared/pipes/translate-pipe';
import { resolveAsset } from '../../../shared/utils/asset-url';
import { map } from 'rxjs';

@Component({
  selector: 'app-brands',
  imports: [AsyncPipe, PageHero, SectionShell, ScrollRevealDirective, TranslatePipe],
  templateUrl: './brands.html',
  styleUrl: './brands.scss',
})
export class Brands {
  private readonly rail = viewChild<ElementRef<HTMLElement>>('rail');
  readonly atStart = signal(true);
  readonly atEnd = signal(false);

  private dragging = false;
  private pointerInside = false;
  private reducedMotion = false;
  private dragOriginX = 0;
  private dragOriginScroll = 0;
  private autoplayId = 0;
  private resumeId = 0;
  private animationFrame = 0;
  private stepLock = false;

  readonly vm$ = inject(ContentService).getSiteContent().pipe(
    map((c) => ({
      page: c.pages.brands,
      heroImage: resolveAsset(c.pages.photos.gallery[0]),
      brands: c.pages.brands.items.map((brand) => ({
        ...brand,
        logoSrc: resolveAsset(brand.logo),
      })),
    }))
  );

  constructor() {
    effect((onCleanup) => {
      const el = this.rail()?.nativeElement;
      if (!el) return;

      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const onResize = () => this.updateEdges(el);
      const observer = new ResizeObserver(onResize);
      observer.observe(el);
      el.querySelectorAll('img').forEach((img) => observer.observe(img));

      const onHide = () => {
        if (document.hidden) this.stopAutoplay();
        else if (!this.pointerInside) this.queueResume(el, 600);
      };

      window.addEventListener('resize', onResize);
      document.addEventListener('visibilitychange', onHide);
      this.updateEdges(el);
      this.queueResume(el, 900);

      onCleanup(() => {
        observer.disconnect();
        window.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onHide);
        this.stopAutoplay();
        window.clearTimeout(this.resumeId);
        window.cancelAnimationFrame(this.animationFrame);
      });
    });
  }

  onUserHold(): void {
    this.pointerInside = true;
    this.stopAutoplay();
  }

  onUserRelease(rail: HTMLElement): void {
    this.pointerInside = false;
    if (this.dragging) return;
    this.queueResume(rail, 1200);
  }

  onControl(rail: HTMLElement, towardEnd: boolean): void {
    this.stopAutoplay();
    this.scrollStep(rail, towardEnd);
    if (!this.pointerInside) this.queueResume(rail, 2800);
  }

  onScroll(rail: HTMLElement): void {
    this.updateEdges(rail);
  }

  scrollStep(rail: HTMLElement, towardEnd: boolean): void {
    const item = rail.querySelector<HTMLElement>('.brand-rail__item');
    const gap = parseFloat(getComputedStyle(rail).columnGap || '0') || 0;
    const amount = (item?.offsetWidth ?? 180) + gap;
    this.glideTo(rail, rail.scrollLeft + this.axisDelta(rail, towardEnd ? amount : -amount));
  }

  onPointerDown(event: PointerEvent, rail: HTMLElement): void {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    this.dragging = true;
    this.stopAutoplay();
    this.cancelGlide(rail);
    this.dragOriginX = event.clientX;
    this.dragOriginScroll = rail.scrollLeft;
    rail.classList.add('is-dragging');
    rail.setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent, rail: HTMLElement): void {
    if (!this.dragging) return;
    const dx = event.clientX - this.dragOriginX;
    const rtl = getComputedStyle(rail).direction === 'rtl';
    rail.scrollLeft = this.dragOriginScroll + (rtl ? dx : -dx);
  }

  onPointerUp(rail: HTMLElement): void {
    if (!this.dragging) return;
    this.dragging = false;
    rail.classList.remove('is-dragging');
    this.updateEdges(rail);
    if (!this.pointerInside) this.queueResume(rail, 1200);
  }

  onKeydown(event: KeyboardEvent, rail: HTMLElement): void {
    const rtl = getComputedStyle(rail).direction === 'rtl';
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    this.stopAutoplay();
    this.scrollStep(rail, event.key === 'ArrowRight' ? !rtl : rtl);
    if (!this.pointerInside) this.queueResume(rail, 2800);
  }

  private queueResume(rail: HTMLElement, delay: number): void {
    window.clearTimeout(this.resumeId);
    if (this.reducedMotion || this.pointerInside || this.dragging) return;
    this.resumeId = window.setTimeout(() => this.beginAutoplay(rail), delay);
  }

  private beginAutoplay(rail: HTMLElement): void {
    this.stopAutoplay();
    if (this.reducedMotion || this.pointerInside || this.dragging) return;
    if (rail.scrollWidth <= rail.clientWidth + 1) return;

    this.autoplayId = window.setInterval(() => {
      if (this.pointerInside || this.dragging || this.stepLock) return;
      this.stepLock = true;
      if (this.atEnd()) {
        this.glideTo(rail, 0);
      } else {
        this.scrollStep(rail, true);
      }
      window.setTimeout(() => {
        this.stepLock = false;
      }, 520);
    }, 1800);
  }

  private stopAutoplay(): void {
    window.clearInterval(this.autoplayId);
    this.autoplayId = 0;
    window.clearTimeout(this.resumeId);
    this.resumeId = 0;
  }

  private glideTo(rail: HTMLElement, target: number): void {
    window.cancelAnimationFrame(this.animationFrame);
    const start = rail.scrollLeft;
    const change = target - start;
    if (Math.abs(change) < 1) {
      this.updateEdges(rail);
      return;
    }

    if (this.reducedMotion) {
      rail.scrollLeft = target;
      this.updateEdges(rail);
      return;
    }

    const duration = 420;
    const started = performance.now();
    rail.classList.add('is-animating');

    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - (1 - progress) ** 3;
      rail.scrollLeft = start + change * eased;
      if (progress < 1) {
        this.animationFrame = window.requestAnimationFrame(tick);
        return;
      }
      rail.classList.remove('is-animating');
      this.updateEdges(rail);
    };

    this.animationFrame = window.requestAnimationFrame(tick);
  }

  private cancelGlide(rail: HTMLElement): void {
    window.cancelAnimationFrame(this.animationFrame);
    this.animationFrame = 0;
    rail.classList.remove('is-animating');
  }

  private axisDelta(rail: HTMLElement, towardEnd: number): number {
    const rtl = getComputedStyle(rail).direction === 'rtl';
    return rtl ? -towardEnd : towardEnd;
  }

  private updateEdges(rail: HTMLElement): void {
    const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const pos = Math.abs(rail.scrollLeft);
    this.atStart.set(pos <= 2);
    this.atEnd.set(max <= 2 || pos >= max - 2);
  }
}
