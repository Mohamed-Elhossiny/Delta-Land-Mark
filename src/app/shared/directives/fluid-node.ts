import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appFluidNode]',
  standalone: true,
  host: { class: 'fluid-node' },
})
export class FluidNodeDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  @HostListener('mousemove', ['$event'])
  onMove(event: MouseEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.el.nativeElement.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
    this.el.nativeElement.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
  }
}
