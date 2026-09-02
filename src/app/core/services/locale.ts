import { Injectable, computed, signal } from '@angular/core';
import { Locale } from '../models/site-content.model';

const LOCALE_STORAGE_KEY = 'delta-landmark-locale';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  readonly locale = signal<Locale>(this.readStoredLocale());
  readonly direction = computed(() => (this.locale() === 'ar' ? 'rtl' : 'ltr'));

  constructor() {
    this.applyDocument(this.locale());
  }

  setLocale(locale: Locale): void {
    this.locale.set(locale);
    this.applyDocument(locale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore storage errors */
    }
  }

  toggle(): void {
    this.setLocale(this.locale() === 'ar' ? 'en' : 'ar');
  }

  private readStoredLocale(): Locale {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored === 'en' || stored === 'ar') return stored;
    } catch {
      /* ignore */
    }
    return 'ar';
  }

  private applyDocument(locale: Locale): void {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }
}
