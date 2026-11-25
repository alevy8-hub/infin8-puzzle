/**
 * Public URL for shared puzzle links.
 * Override with VITE_SHARE_ORIGIN when building a preview (so the card meta is on the same path).
 * Live builds leave this unset and share the subscriber root.
 */
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
}

export const puzzleOrdinal = (roundNumber: number, index: number, roundSize = 8): number =>
  (roundNumber - 1) * roundSize + index + 1

export function shareLabel(ordinal: number | null): string {
  return ordinal === null ? 'iNFiN8 Puzzle ∞' : `iNFiN8 Puzzle ${ordinal}/∞`
}

export function shareText(ordinal: number | null): string {
  return `Can you solve ${shareLabel(ordinal)}? 🧠`
}

export function shareUrl(seed: string, site = SITE_URL): string {
  const base = site.endsWith('/') ? site : `${site}/`
  return `${base}?seed=${encodeURIComponent(seed)}`
}

export function sharePayload(seed: string, ordinal: number | null, site = SITE_URL): SharePayload {
  return { label: shareLabel(ordinal), text: shareText(ordinal), url: shareUrl(seed, site), seed }
}

export type IntentName = 'x' | 'facebook' | 'threads' | 'whatsapp' | 'reddit'

export function intentUrls(text: string, url: string): Record<IntentName, string> {
  const withLink = `${text} ${url}`
  return {
    x: `https://x.com/intent/post?text=${encodeURIComponent(withLink)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(withLink)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(withLink)}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  }
}

export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
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
