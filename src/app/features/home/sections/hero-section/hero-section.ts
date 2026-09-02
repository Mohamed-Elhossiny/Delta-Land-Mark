import {
  Component,
  inject,
  signal,
  viewChild,
  ElementRef,
  AfterViewInit,
  DestroyRef,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ContentService } from '../../../../core/services/content';
import { LocalizePipe } from '../../../../shared/pipes/localize-pipe';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';
import { PrimaryCta } from '../../../../shared/components/primary-cta/primary-cta';
import { combineLatest, map } from 'rxjs';
import { resolveAsset, HERO_VIDEO_PATH } from '../../../../shared/utils/asset-url';
import { heroEnter } from '../../../../shared/animations/app.animations';

@Component({
  selector: 'app-hero-section',
  imports: [AsyncPipe, LocalizePipe, TranslatePipe, PrimaryCta],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
  animations: [heroEnter],
})
export class HeroSection implements AfterViewInit {
  private readonly content = inject(ContentService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly heroVideo = viewChild<ElementRef<HTMLVideoElement>>('heroVideo');

  readonly isPaused = signal(true);
  readonly usePosterFallback = signal(false);

  readonly vm$ = combineLatest([
    this.content.getHero(),
    this.content.getSiteContent().pipe(map((c) => c.pages.photos.gallery[2] ?? c.pages.photos.gallery[0])),
  ]).pipe(
    map(([hero, heroImage]) => ({
      hero,
      poster: resolveAsset(heroImage),
      video: HERO_VIDEO_PATH,
      ctas: (hero?.ctas ?? []).map((cta) => this.content.mapCta(cta)),
    }))
  );

  ngAfterViewInit(): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncMotion = (): void => {
      if (prefersReducedMotion.matches) {
        this.usePosterFallback.set(true);
        this.pauseVideo();
      } else {
        this.playVideo();
      }
    };

    syncMotion();
    prefersReducedMotion.addEventListener('change', syncMotion);
    this.destroyRef.onDestroy(() => prefersReducedMotion.removeEventListener('change', syncMotion));
  }

  onVideoReady(): void {
    if (!this.usePosterFallback()) {
      this.playVideo();
    }
  }

  onVideoError(): void {
    this.usePosterFallback.set(true);
  }

  toggleVideo(event: Event): void {
    event.preventDefault();
    if (this.usePosterFallback()) return;

    if (this.isPaused()) {
      this.playVideo();
    } else {
      this.pauseVideo();
    }
  }

  private playVideo(): void {
    const video = this.heroVideo()?.nativeElement;
    if (!video) return;

    video
      .play()
      .then(() => this.isPaused.set(false))
      .catch(() => {
        this.isPaused.set(true);
      });
  }

  private pauseVideo(): void {
    const video = this.heroVideo()?.nativeElement;
    if (!video) return;
    video.pause();
    this.isPaused.set(true);
  }
}
