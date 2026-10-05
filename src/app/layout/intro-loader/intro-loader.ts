import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ContentService } from '../../core/services/content';
import { HEADER_LOGO_PATH } from '../../shared/utils/asset-url';

interface DrawStroke {
  id: string;
  d: string;
  width: number;
  start: number;
  end: number;
}

const DRAW_MS = 2800;
const MAX_WAIT_MS = 12000;
const ROUTE_MIN_MS = 900;
const ROUTE_MAX_MS = 8000;
const IMAGE_TIMEOUT_MS = 8000;
const VIDEO_TIMEOUT_MS = 6000;
const FONT_TIMEOUT_MS = 4000;
const PRELOAD_CONCURRENCY = 8;

const STROKES: DrawStroke[] = [
  { id: 'magenta', d: 'M 9 0 L 9 128 L 96 126', width: 24, start: 0, end: 0.22 },
  {
    id: 'orange',
    d: 'M 42.5 108 L 42.5 8 L 100 8 C 128 6 138 22 148 42 C 160 62 166 96 158 122 C 150 140 142 150 138 152',
    width: 26,
    start: 0.12,
    end: 0.48,
  },
  { id: 'blue-cap', d: 'M 68 40 L 118 48', width: 34, start: 0.4, end: 0.56 },
  {
    id: 'blue',
    d: 'M 100 50 C 128 52 136 78 130 108 C 124 136 100 156 60 162 L 2 162',
    width: 24,
    start: 0.48,
    end: 0.74,
  },
  { id: 'delta', d: 'M 0 211 H 192', width: 46, start: 0.66, end: 0.88 },
  { id: 'landmark', d: 'M 0 253 H 192', width: 40, start: 0.8, end: 1 },
];

@Component({
  selector: 'app-intro-loader',
  templateUrl: './intro-loader.html',
  styleUrl: './intro-loader.scss',
})
export class IntroLoader implements AfterViewInit, OnDestroy {
  private readonly content = inject(ContentService);
  private readonly zone = inject(NgZone);

  readonly variant = input<'intro' | 'route'>('intro');
  readonly finished = output<void>();
  readonly exiting = signal(false);
  readonly waiting = signal(false);
  readonly logoSrc = HEADER_LOGO_PATH;
  readonly strokes = STROKES;

  private readonly logo = viewChild.required<ElementRef<SVGImageElement>>('logo');
  private readonly strokeEls = viewChildren<ElementRef<SVGPathElement>>('stroke');

  private assetsReady = false;
  private closed = false;
  private raf = 0;
  private exitTimer = 0;
  private startedAt = 0;
  private cycleStart = 0;
  private readonly reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ngAfterViewInit(): void {
    document.body.classList.add('loader-active');
    this.bindMask();
    this.startedAt = performance.now();
    this.cycleStart = this.startedAt;

    if (this.reduceMotion) {
      this.paint(1);
      void this.loadAssets().then(() => {
        const remaining = Math.max(0, 400 - (performance.now() - this.startedAt));
        this.exitTimer = window.setTimeout(() => this.finish(), remaining);
      });
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.raf = requestAnimationFrame(this.frame);
    });
    void this.loadAssets();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    window.clearTimeout(this.exitTimer);
    document.body.classList.remove('loader-active');
  }

  private bindMask(): void {
    const base = window.location.href.split('#')[0];
    this.logo().nativeElement.setAttribute('mask', `url("${base}#dlm-loader-mask")`);
  }

  private frame = (now: number): void => {
    const route = this.variant() === 'route';
    const progress = Math.min(1, (now - this.cycleStart) / DRAW_MS);
    this.paint(progress);

    const elapsed = now - this.startedAt;
    if (route && this.assetsReady && elapsed >= ROUTE_MIN_MS) {
      this.zone.run(() => this.finish());
      return;
    }

    const timedOut = elapsed >= (route ? ROUTE_MAX_MS : MAX_WAIT_MS);
    if (progress >= 1 && (this.assetsReady || timedOut)) {
      this.zone.run(() => this.finish());
      return;
    }

    if (progress >= 1) {
      this.zone.run(() => this.waiting.set(true));
      this.raf = requestAnimationFrame(this.hold);
      return;
    }

    this.raf = requestAnimationFrame(this.frame);
  };

  private hold = (now: number): void => {
    const maxWait = this.variant() === 'route' ? ROUTE_MAX_MS : MAX_WAIT_MS;
    if (this.assetsReady || now - this.startedAt >= maxWait) {
      this.zone.run(() => this.finish());
      return;
    }
    this.raf = requestAnimationFrame(this.hold);
  };

  private paint(progress: number): void {
    const paths = this.strokeEls();
    this.strokes.forEach((stroke, index) => {
      const el = paths[index]?.nativeElement;
      if (!el) return;
      const span = stroke.end - stroke.start;
      const local = Math.min(1, Math.max(0, (progress - stroke.start) / span));
      el.style.strokeDashoffset = String(1 - local);
    });
  }

  private async loadAssets(): Promise<void> {
    if (this.variant() === 'route') {
      try {
        await firstValueFrom(this.content.getSiteContent());
      } catch {
        // Leave the page usable if the content file fails.
      }
      this.assetsReady = true;
      return;
    }

    const images = new Set<string>([HEADER_LOGO_PATH]);
    try {
      const site = await firstValueFrom(this.content.getSiteContent());
      this.collectLocals(site, images);
    } catch {
      // A failed content request should not trap the intro.
    }

    await Promise.all([
      this.preloadImages([...images].filter((path) => this.isImage(path))),
      this.waitForVideo(),
      this.waitForFonts(),
    ]);
    this.assetsReady = true;
  }

  private collectLocals(value: unknown, out: Set<string>): void {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      value.forEach((item) => this.collectLocals(item, out));
      return;
    }
    for (const [key, child] of Object.entries(value)) {
      if (key === 'local' && typeof child === 'string' && child.length > 0) {
        out.add(child.startsWith('/') ? child : `/${child}`);
      } else {
        this.collectLocals(child, out);
      }
    }
  }

  private isImage(path: string): boolean {
    return /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(path);
  }

  private preloadImages(urls: string[]): Promise<void> {
    let cursor = 0;
    const loadNext = async (): Promise<void> => {
      while (cursor < urls.length) {
        const url = urls[cursor];
        cursor += 1;
        await this.loadImage(url);
      }
    };
    const workers = Array.from({ length: Math.min(PRELOAD_CONCURRENCY, urls.length) }, () => loadNext());
    return Promise.all(workers).then(() => undefined);
  }

  private loadImage(url: string): Promise<void> {
    return new Promise((resolve) => {
      const image = new Image();
      const timer = window.setTimeout(resolve, IMAGE_TIMEOUT_MS);
      const done = (): void => {
        window.clearTimeout(timer);
        resolve();
      };
      image.onload = done;
      image.onerror = done;
      image.src = url;
    });
  }

  private waitForVideo(): Promise<void> {
    return new Promise((resolve) => {
      const video = document.getElementById('site-bg-video') as HTMLVideoElement | null;
      if (!video || video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        resolve();
        return;
      }

      let timer = 0;
      const finish = (): void => {
        window.clearTimeout(timer);
        video.removeEventListener('canplay', finish);
        video.removeEventListener('error', finish);
        resolve();
      };
      timer = window.setTimeout(finish, VIDEO_TIMEOUT_MS);
      video.addEventListener('canplay', finish);
      video.addEventListener('error', finish);
    });
  }

  private waitForFonts(): Promise<void> {
    const ready = document.fonts?.ready ?? Promise.resolve();
    return new Promise((resolve) => {
      const timer = window.setTimeout(resolve, FONT_TIMEOUT_MS);
      void ready.finally(() => {
        window.clearTimeout(timer);
        resolve();
      });
    });
  }

  private finish(): void {
    if (this.closed) return;
    this.closed = true;
    cancelAnimationFrame(this.raf);
    this.waiting.set(false);
    this.exiting.set(true);
    this.exitTimer = window.setTimeout(() => {
      document.body.classList.remove('loader-active');
      this.finished.emit();
    }, 700);
  }
}
