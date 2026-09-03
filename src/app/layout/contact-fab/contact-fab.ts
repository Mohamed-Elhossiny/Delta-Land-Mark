import { Component, HostListener, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { ContentService } from '../../core/services/content';
import { TranslatePipe } from '../../shared/pipes/translate-pipe';

@Component({
  selector: 'app-contact-fab',
  imports: [AsyncPipe, TranslatePipe],
  templateUrl: './contact-fab.html',
  styleUrl: './contact-fab.scss',
})
export class ContactFab {
  private readonly content = inject(ContentService);
  readonly open = signal(false);

  readonly vm$ = this.content.getSiteContent().pipe(
    map((site) => ({
      phoneHref: this.toTel(site.contact.phone),
      whatsapp: site.contact.whatsapp,
      facebook: site.contact.facebook,
      maps: site.contact.maps,
    }))
  );

  toggle(): void {
    this.open.update((value) => !value);
  }

  close(): void {
    this.open.set(false);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  private toTel(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) return `tel:+20${digits.slice(1)}`;
    if (digits.startsWith('20')) return `tel:+${digits}`;
    return `tel:${digits}`;
  }
}
