import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { BurgerMenu } from '../burger-menu/burger-menu';
import { IntroLoader } from '../intro-loader/intro-loader';
import { BackToTop } from '../back-to-top/back-to-top';
import { routeAnimations } from '../../shared/animations/app.animations';
import { SmoothScrollService } from '../../core/services/smooth-scroll';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Header, Footer, BurgerMenu, IntroLoader, BackToTop],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  animations: [routeAnimations],
})
export class Shell implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly smoothScroll = inject(SmoothScrollService);

  readonly menuOpen = signal(false);
  readonly loaderDone = signal(false);
  readonly heroOverlay = signal(true);

  ngOnInit(): void {
    this.syncHeroOverlay();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.syncHeroOverlay();
        this.smoothScroll.scrollToTop();
      });
  }

  ngOnDestroy(): void {
    this.smoothScroll.stop();
  }

  onLoaderFinished(): void {
    this.loaderDone.set(true);
    this.smoothScroll.start();
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

  private syncHeroOverlay(): void {
    this.heroOverlay.set(this.router.url === '/');
  }
}
