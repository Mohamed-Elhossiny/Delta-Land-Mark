import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-split-cta',
  imports: [RouterLink],
  templateUrl: './split-cta.html',
  styleUrl: './split-cta.scss',
})
export class SplitCta {
  readonly label = input.required<string>();
  readonly href = input.required<string>();
  readonly external = input(false);
}
