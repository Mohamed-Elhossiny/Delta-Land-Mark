import { Component, input, output, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content';
import { LocalizePipe } from '../../shared/pipes/localize-pipe';
import { TranslatePipe } from '../../shared/pipes/translate-pipe';

@Component({
  selector: 'app-burger-menu',
  imports: [AsyncPipe, RouterLink, LocalizePipe, TranslatePipe],
  templateUrl: './burger-menu.html',
  styleUrl: './burger-menu.scss',
})
export class BurgerMenu {
  readonly open = input(false);
  readonly close = output<void>();

  private readonly content = inject(ContentService);
  readonly nav$ = this.content.getNavigation();

  onNavigate(): void {
    this.close.emit();
  }
}
