import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Locale } from '../models/site-content.model';
import { I18nContentOverlay, I18nFile, uiTextForLocale } from '../i18n/i18n.types';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);
  private readonly dictionaries = signal<Partial<Record<Locale, I18nFile>>>({});
  readonly ready = signal(false);

  constructor() {
    forkJoin({
      ar: this.http.get<I18nFile>('assets/i18n/ar.json'),
      en: this.http.get<I18nFile>('assets/i18n/en.json'),
    }).subscribe({
      next: ({ ar, en }) => {
        this.dictionaries.set({ ar, en });
        this.ready.set(true);
      },
      error: () => {
        this.ready.set(true);
      },
    });
  }

  translate(key: string, locale?: Locale): string {
    const active = locale ?? 'ar';
    return uiTextForLocale(this.dictionaries(), active, key);
  }

  getContentOverlay(locale: Locale): I18nContentOverlay | undefined {
    if (locale !== 'en') return undefined;
    return this.dictionaries().en?.content;
  }
}
