import { Component, inject, output, signal, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ContentService } from '../../core/services/content';
import { map } from 'rxjs';

@Component({
  selector: 'app-intro-loader',
  imports: [AsyncPipe],
  templateUrl: './intro-loader.html',
  styleUrl: './intro-loader.scss',
})
export class IntroLoader implements OnInit {
  private readonly content = inject(ContentService);

  readonly finished = output<void>();
  readonly exiting = signal(false);

  readonly brandName$ = this.content.getSiteContent().pipe(map((c) => c.identity.name.ar));

  ngOnInit(): void {
    document.body.classList.add('loader-active');
    window.setTimeout(() => this.finish(), 2200);
  }

  private finish(): void {
    this.exiting.set(true);
    window.setTimeout(() => {
      document.body.classList.remove('loader-active');
      this.finished.emit();
    }, 700);
  }
}
