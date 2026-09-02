import { Directive, ElementRef, inject, input, OnDestroy, OnInit } from '@angular/core';

export type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'scale';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  readonly delay = input(0);
  readonly variant = input<RevealVariant>('up');

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const node = this.el.nativeElement;
    node.classList.add('reveal', `reveal--${this.variant()}`);

    if (this.delay()) {
      node.style.transitionDelay = `${this.delay()}ms`;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.classList.add('reveal--visible');
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('reveal--visible');
          this.observer?.unobserve(node);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -12% 0px' }
    );

    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
