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
  private dragOriginX = 0;
  private dragOriginScroll = 0;

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

      const onWheel = (event: WheelEvent) => {
        if (el.scrollWidth <= el.clientWidth + 1) return;
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
        event.preventDefault();
        el.scrollBy({ left: this.axisDelta(el, event.deltaY) });
      };

      const onResize = () => this.updateEdges(el);
      const observer = new ResizeObserver(onResize);
      observer.observe(el);
      el.querySelectorAll('img').forEach((img) => observer.observe(img));

      el.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('resize', onResize);
      this.updateEdges(el);

      onCleanup(() => {
        observer.disconnect();
        el.removeEventListener('wheel', onWheel);
        window.removeEventListener('resize', onResize);
      });
    });
  }

  onScroll(rail: HTMLElement): void {
    this.updateEdges(rail);
  }

  scrollStep(rail: HTMLElement, towardEnd: boolean): void {
    const item = rail.querySelector<HTMLElement>('.brand-rail__item');
    const gap = parseFloat(getComputedStyle(rail).columnGap || '0') || 0;
    const amount = (item?.offsetWidth ?? 180) + gap;
    rail.scrollBy({ left: this.axisDelta(rail, towardEnd ? amount : -amount), behavior: 'smooth' });
  }

  onPointerDown(event: PointerEvent, rail: HTMLElement): void {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    this.dragging = true;
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
  }

  onKeydown(event: KeyboardEvent, rail: HTMLElement): void {
    const rtl = getComputedStyle(rail).direction === 'rtl';
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.scrollStep(rail, !rtl);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.scrollStep(rail, rtl);
    }
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
