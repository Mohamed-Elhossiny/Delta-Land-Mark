import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from '../../core/services/locale';
import { LocalizedText } from '../../core/models/site-content.model';
import { localize } from '../utils/asset-url';

@Pipe({ name: 'localize', standalone: true, pure: false })
export class LocalizePipe implements PipeTransform {
  private readonly locale = inject(LocaleService);

  transform(value: LocalizedText | undefined): string {
    return localize(value, this.locale.locale());
  }
}
