import { DEMO_UNLOCK, FREE } from './mode'

/**
 * Points needed to unlock song 1. Change this one number to retune.
 * A perfect Beginner round is ~145 pts (8 × 15 first-try + 20 round bonus + day-1 streak 5),
 * so 250 ≈ two Beginner rounds (or one Intermediate round) in a good session, or a couple of days of casual play.
 */
export const SONG_UNLOCK_POINTS = 250
/** Points needed to unlock song 2 (subscriber build only). */
export const SONG_2_UNLOCK_POINTS = 500
/** Points needed to unlock song 3 (subscriber build only). */
export const SONG_3_UNLOCK_POINTS = 750

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
  /** never unlockable (or shown) in the free build */
  subscriberOnly?: boolean
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

export const SONG_2: Song = {
  id: 'breaking',
  title: 'Breaking',
  artist: 'DJ ALEVY8',
  audio: asset('music/breaking.mp3'),
  cover: asset('music/breaking.jpg'),
  threshold: SONG_2_UNLOCK_POINTS,
  subscriberOnly: true,
}

export const SONG_3: Song = {
  id: 'light-waves',
  title: 'Light Waves',
  artist: 'DJ ALEVY8',
  audio: asset('music/light-waves.mp3'),
  cover: asset('music/light-waves.jpg'),
  threshold: SONG_3_UNLOCK_POINTS,
  subscriberOnly: true,
}

/** All songs, in unlock order. */
export const ALL_SONGS: Song[] = [SONG_1, SONG_2, SONG_3]
/** Songs available in this build (free build hides subscriber-only songs). */
export const SONGS: Song[] = FREE ? ALL_SONGS.filter((s) => !s.subscriberOnly) : ALL_SONGS

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

/** Adds every song whose threshold the total reaches; never removes an unlock. Returns `u` unchanged if nothing new. */
export function withEarnedUnlocks(u: Unlocks, totalPoints: number, now: Date = new Date()): Unlocks {
  let out = u
  for (const song of SONGS) {
    if (out[song.id] || totalPoints < song.threshold) continue
    out = { ...out, [song.id]: { at: now.toISOString(), seen: false } }
  }
  return out
}
