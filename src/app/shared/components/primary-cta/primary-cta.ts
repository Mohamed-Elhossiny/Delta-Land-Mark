import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-primary-cta',
  imports: [RouterLink],
  templateUrl: './primary-cta.html',
  styleUrl: './primary-cta.scss',
})
export class PrimaryCta {
  readonly label = input.required<string>();
  readonly href = input.required<string>();
  readonly external = input(false);
  readonly variant = input<'primary' | 'ghost'>('primary');
}
