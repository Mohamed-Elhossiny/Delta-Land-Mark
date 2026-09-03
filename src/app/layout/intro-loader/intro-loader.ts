import { Component, output, signal, OnInit } from '@angular/core';
import { HEADER_LOGO_PATH } from '../../shared/utils/asset-url';

@Component({
  selector: 'app-intro-loader',
  templateUrl: './intro-loader.html',
  styleUrl: './intro-loader.scss',
})
export class IntroLoader implements OnInit {
  readonly finished = output<void>();
  readonly exiting = signal(false);
  readonly logoSrc = HEADER_LOGO_PATH;

  ngOnInit(): void {
    document.body.classList.add('loader-active');
    window.setTimeout(() => this.finish(), 2800);
  }

  private finish(): void {
    this.exiting.set(true);
    window.setTimeout(() => {
      document.body.classList.remove('loader-active');
      this.finished.emit();
    }, 700);
  }
}
