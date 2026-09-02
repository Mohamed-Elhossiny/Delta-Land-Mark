import { Component, input } from '@angular/core';
import { LocalizePipe } from '../../pipes/localize-pipe';
import { LocalizedText } from '../../../core/models/site-content.model';

@Component({
  selector: 'app-page-hero',
  imports: [LocalizePipe],
  templateUrl: './page-hero.html',
  styleUrl: './page-hero.scss',
})
export class PageHero {
  readonly title = input.required<LocalizedText>();
  readonly subtitle = input<LocalizedText>();
  readonly imageUrl = input<string>('');
}
