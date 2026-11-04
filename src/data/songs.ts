import { DEMO_UNLOCK } from './mode'

/**
 * Points needed to unlock song 1. Change this one number to retune.
 * A perfect Beginner round is ~145 pts (8 × 15 first-try + 20 round bonus + day-1 streak 5),
 * so 250 ≈ two Beginner rounds (or one Intermediate round) in a good session, or a couple of days of casual play.
 */
export const SONG_UNLOCK_POINTS = 250

export const DOWNLOAD_URL = 'https://www.djalevy8.com/download'
export const SUPPORT_URL = 'https://x.com/DJAlevy8/creator-subscriptions/subscribe'

export type Song = {
  id: string
  title: string
  artist: string
  audio: string
  cover: string
  /** total points needed */
  threshold: number
}

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export const SONG_1: Song = {
  id: 'above-the-silence',
  title: 'Above The Silence',
  artist: 'DJ ALEVY8',
  audio: asset('music/above-the-silence.mp3'),
  cover: asset('music/above-the-silence.jpg'),
  threshold: SONG_UNLOCK_POINTS,
}

export type Unlocks = Record<string, { at: string; seen: boolean }>

// Shared by the free and subscriber builds (same origin): a song unlocked in free also shows for subscribers.
const KEY = 'infin8-puzzle-unlocks-v1'

export function loadUnlocks(): Unlocks {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : null
    if (!parsed || typeof parsed !== 'object') return {}
    const out: Unlocks = {}
    for (const [id, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (v && typeof v === 'object') {
        const e = v as { at?: unknown; seen?: unknown }
        out[id] = {
          at: typeof e.at === 'string' ? e.at : '',
          seen: e.seen === true,
        }
      }
    }
    return out
  } catch {
    return {}
  }
}

export function saveUnlocks(u: Unlocks): void {
  try {
    if (DEMO_UNLOCK) return
    localStorage.setItem(KEY, JSON.stringify(u))
  } catch {
    /* ignore (private mode etc.) */
  }
}

/** Adds the song once total points reach its threshold; never removes an unlock. */
export function withEarnedUnlocks(u: Unlocks, totalPoints: number, now: Date = new Date()): Unlocks {
  if (u[SONG_1.id] || totalPoints < SONG_1.threshold) return u
  return { ...u, [SONG_1.id]: { at: now.toISOString(), seen: false } }
}
