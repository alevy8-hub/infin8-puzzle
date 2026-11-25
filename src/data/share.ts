/**
 * Public URL for shared puzzle links.
 * Override with VITE_SHARE_ORIGIN when building a preview (so the card meta is on the same path).
 * Live builds leave this unset and share the subscriber root.
 */
import type { Puzzle } from './puzzles'

const SHARE_ORIGIN =
  (import.meta.env && (import.meta.env.VITE_SHARE_ORIGIN as string | undefined)) ||
  'https://alevy8-hub.github.io/infin8-puzzle/'
export const SITE_URL = SHARE_ORIGIN.endsWith('/') ? SHARE_ORIGIN : `${SHARE_ORIGIN}/`

export type SharePayload = {
  /** Short in-game name, e.g. iNFiN8 Puzzle 9/∞ */
  label: string
  text: string
  url: string
  seed: string
  puzzle?: Puzzle
  levelName?: string
}

export const puzzleOrdinal = (roundNumber: number, index: number, roundSize = 8): number =>
  (roundNumber - 1) * roundSize + index + 1

export function shareLabel(ordinal: number | null): string {
  return ordinal === null ? 'iNFiN8 Puzzle ∞' : `iNFiN8 Puzzle ${ordinal}/∞`
}

/** The only line that precedes the share link. No puzzle number, no emoji, no extra lines. */
export const SHARE_HOOK = 'Most people get this wrong on the first try.'

export function shareText(_ordinal: number | null = null): string {
  return SHARE_HOOK
}

/** Visible share link: no https://, so the post doesn't start with a scheme. */
export function shareLinkDisplay(url: string): string {
  return url.replace(/^https:\/\//i, '')
}

/** Hook, a blank line, then the bare link — used for copy, native share, and intent text. */
export function sharePost(url: string, hook = SHARE_HOOK): string {
  return `${hook}\n\n${shareLinkDisplay(url)}`
}

export function shareUrl(seed: string, site = SITE_URL): string {
  const base = site.endsWith('/') ? site : `${site}/`
  return `${base}?seed=${encodeURIComponent(seed)}`
}

export function sharePayload(
  seed: string,
  ordinal: number | null,
  opts?: { site?: string; puzzle?: Puzzle; levelName?: string },
): SharePayload {
  const site = opts?.site ?? SITE_URL
  return {
    label: shareLabel(ordinal),
    text: shareText(ordinal),
    url: shareUrl(seed, site),
    seed,
    puzzle: opts?.puzzle,
    levelName: opts?.levelName,
  }
}

export type IntentName = 'x' | 'facebook' | 'threads' | 'whatsapp' | 'reddit'

export function intentUrls(text: string, url: string): Record<IntentName, string> {
  const post = sharePost(url, text)
  return {
    x: `https://x.com/intent/post?text=${encodeURIComponent(post)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(post)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(post)}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  }
}

export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

/** True when this browser can attach files to the native share sheet (iPhone Safari 15+ top-level). */
export function canShareFiles(files?: File[]): boolean {
  if (!canNativeShare() || typeof navigator.canShare !== 'function') return false
  try {
    const list =
      files && files.length
        ? files
        : [new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'infin8-puzzle.png', { type: 'image/png' })]
    return navigator.canShare({ files: list })
  } catch {
    return false
  }
}

/** Copy text. Tries the clipboard API, then a hidden textarea (better in some iframes). */
export async function copyText(value: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    /* fall through — common in cross-origin iframes */
  }
  try {
    if (typeof document === 'undefined') return false
    const ta = document.createElement('textarea')
    ta.value = value
    ta.setAttribute('readonly', '')
    ta.setAttribute('aria-hidden', 'true')
    ta.style.position = 'fixed'
    ta.style.top = '0'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    ta.setSelectionRange(0, value.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
