import { MediaAsset } from '../../core/models/site-content.model';

/** Header logo — resized variant to avoid oversized image warnings (NG0913). */
export const HEADER_LOGO_PATH = '/assets/identity/logo-header.png';

/** Hero background loop video. */
export const HERO_VIDEO_PATH = '/assets/hero/hero-loop.mp4';

/** Resolve image URL — prefers bundled local assets, falls back to remote originalUrl. */
export function resolveAsset(asset?: MediaAsset | null): string {
  if (!asset) return '';
  if (asset.local) {
    const path = asset.local.startsWith('/') ? asset.local : `/${asset.local}`;
    return path;
  }
  if (asset.originalUrl) return asset.originalUrl;
  return '';
}

export function localize(text: { ar?: string; en?: string } | undefined, locale: 'ar' | 'en'): string {
  if (!text) return '';
  return (locale === 'en' ? text.en : text.ar) ?? text.ar ?? text.en ?? '';
}
