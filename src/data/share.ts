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

/** Public site path shown in every share post. No https://, no seed. */
export const SHARE_PAGE = 'djalevy8.com/free'

/** Rotating first lines. The same puzzle seed always gets the same hook. */
export const SHARE_HOOKS = [
  'Most people get this wrong on the first try.',
  "Looks easy. It's not.",
  'Only a few get this on the first try.',
] as const

/** One reason line, rotated independently of the hook. */
export const SHARE_REASONS = [
  'No calculator. Just your brain.',
  'Sharpens your focus in 60 seconds.',
  'Quick brain training. No cheating.',
] as const

/** FNV-1a, stable across sessions and builds. */
function fnv1a(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function hookForSeed(seed: string): string {
  return SHARE_HOOKS[fnv1a(seed) % SHARE_HOOKS.length]
}

/** Salted separately so the reason is not locked to the hook index. */
export function reasonForSeed(seed: string): string {
  return SHARE_REASONS[fnv1a(`${seed}:reason`) % SHARE_REASONS.length]
}

export function shareLinkDisplay(_url?: string): string {
  return SHARE_PAGE
}

/** Full post for the native sheet, Copy link, and the panel preview. Line breaks are exact. */
export function sharePost(seed: string): string {
  return `${hookForSeed(seed)} 🧩\n\n${reasonForSeed(seed)}\n\nNothing to lose. Everything to gain.\n${SHARE_PAGE}`
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
    text: hookForSeed(seed),
    url: shareUrl(seed, site),
    seed,
    puzzle: opts?.puzzle,
    levelName: opts?.levelName,
  }
}

export type IntentName = 'x' | 'facebook' | 'threads' | 'whatsapp' | 'reddit'

export function intentUrls(seed: string, url: string): Record<IntentName, string> {
  const post = sharePost(seed)
  return {
    x: `https://x.com/intent/post?text=${encodeURIComponent(post)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(post)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(post)}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(hookForSeed(seed))}`,
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
