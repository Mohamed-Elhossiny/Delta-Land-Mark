import { MediaAsset } from '../../core/models/site-content.model';

/** Header logo — Delta Landmark identity mark. */
export const HEADER_LOGO_PATH = '/assets/identity/logo-header.png';

/** Site-wide looping background video (intro + every page). */
export const SITE_VIDEO_PATH = '/assets/video/delta.mp4';

/** @deprecated Use SITE_VIDEO_PATH — kept for leftover hero section code. */
export const HERO_VIDEO_PATH = SITE_VIDEO_PATH;

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

export function localize(
  text: { ar?: string; en?: string } | undefined,
  locale: 'ar' | 'en',
): string {
  if (!text) return '';
  return (locale === 'en' ? text.en : text.ar) ?? text.ar ?? text.en ?? '';
}
