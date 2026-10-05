import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { BurgerMenu } from '../burger-menu/burger-menu';
import { IntroLoader } from '../intro-loader/intro-loader';
import { BackToTop } from '../back-to-top/back-to-top';
import { ContactFab } from '../contact-fab/contact-fab';
import { routeAnimations } from '../../shared/animations/app.animations';
import { SmoothScrollService } from '../../core/services/smooth-scroll';

interface LoaderRun {
  id: number;
  variant: 'intro' | 'route';
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Header, Footer, BurgerMenu, IntroLoader, BackToTop, ContactFab],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  animations: [routeAnimations],
})
export class Shell implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly smoothScroll = inject(SmoothScrollService);

  readonly menuOpen = signal(false);
  readonly heroOverlay = signal(true);
  readonly loaders = signal<LoaderRun[]>([{ id: 0, variant: 'intro' }]);

  private introFinished = false;
  private nextLoaderId = 1;
  private navSub?: Subscription;

  ngOnInit(): void {
    this.playBackgroundVideo();
    this.navSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.onNavigate(event);
        return;
      }
      if (event instanceof NavigationEnd) {
        this.smoothScroll.scrollToTop();
      }
    });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
    this.smoothScroll.stop();
  }

  onLoaderFinished(id: number): void {
    this.loaders.update((list) => list.filter((item) => item.id !== id));
    if (!this.introFinished && id === 0) {
      this.introFinished = true;
      this.smoothScroll.start();
    }
  }

  private onNavigate(event: NavigationStart): void {
    if (!this.introFinished) return;
    const current = this.router.url.split(/[?#]/)[0];
    const next = event.url.split(/[?#]/)[0];
    if (current === next) return;

    const id = this.nextLoaderId++;
    this.loaders.set([{ id, variant: 'route' }]);
  }

  toggleMenu(): void {
    const next = !this.menuOpen();
    this.menuOpen.set(next);
    document.body.classList.toggle('menu-open', next);
    if (next) {
      this.smoothScroll.pause();
    } else {
      this.smoothScroll.resume();
    }
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    document.body.classList.remove('menu-open');
    this.smoothScroll.resume();
  }

  prepareRoute(outlet: RouterOutlet): string {
    return outlet.isActivated ? outlet.activatedRoute.snapshot.url.map((s) => s.path).join('/') || 'home' : '';
  }

  private playBackgroundVideo(): void {
    const video = document.getElementById('site-bg-video') as HTMLVideoElement | null;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;

    const tryPlay = (): void => {
      void video.play().catch(() => undefined);
    };

    video.addEventListener('canplay', tryPlay);
    document.addEventListener('pointerdown', tryPlay, { once: true });
    tryPlay();
  }
}
