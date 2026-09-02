import { Injectable, inject } from '@angular/core';
import { LocaleService } from './locale';
import { I18nService } from './i18n';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private readonly localeService = inject(LocaleService);
  private readonly i18n = inject(I18nService);

  readonly locale = this.localeService.locale;
  readonly direction = this.localeService.direction;

  t(key: string): string {
    return this.i18n.translate(key, this.locale());
  }

  instant(key: string, locale?: 'ar' | 'en'): string {
    return this.i18n.translate(key, locale ?? this.locale());
  }
}
