import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-section-shell',
  imports: [NgClass],
  templateUrl: './section-shell.html',
  styleUrl: './section-shell.scss',
})
export class SectionShell {
  readonly tone = input<'light' | 'gray' | 'warm' | 'dark'>('light');
  readonly padded = input(true);
}
