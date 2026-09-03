import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appLiquidBtn]',
  standalone: true,
  host: { class: 'liquid-btn' },
})
export class LiquidBtnDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  @HostListener('mousemove', ['$event'])
  onMove(event: MouseEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.el.nativeElement.style.setProperty('--x', `${event.clientX - rect.left}px`);
    this.el.nativeElement.style.setProperty('--y', `${event.clientY - rect.top}px`);
  }
}
