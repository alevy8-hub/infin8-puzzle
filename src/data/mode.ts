/**
 * Free public build: `VITE_FREE=1 vite build`.
 * Only DJ's original 8 Beginner puzzles; Intermediate/Advanced shown as locked "Subscribers" tiles.
 */
export const FREE: boolean = import.meta.env?.VITE_FREE === '1'

export const SUBSCRIBE_URL = 'https://x.com/DJAlevy8/creator-subscriptions/subscribe'

/** Free build keeps its own saves so it never touches subscriber progress or points on the same origin. */
export const storageKey = (key: string): string => (FREE ? key.replace('infin8-puzzle-', 'infin8-puzzle-free-') : key)

/**
 * Test link `?demo=unlock` (subscriber build): shows the song unlock card at once, purely in memory.
 * Never writes localStorage (every save path checks this), so real points/unlocks stay untouched.
 */
const DEMO_PARAM: string | null =
  FREE || typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('demo')

/** `?demo=unlock` → song 1 card; `?demo=unlock2` or `?demo=breaking` → song 2; `?demo=unlock3` or `?demo=lightwaves` → song 3; `?demo=unlock4` or `?demo=shudder` → song 4. null = not a demo. */
export const DEMO_SONG_INDEX: number | null =
  DEMO_PARAM === 'unlock' ? 0 : DEMO_PARAM === 'unlock2' || DEMO_PARAM === 'breaking'
      ? 1
      : DEMO_PARAM === 'unlock3' || DEMO_PARAM === 'lightwaves'
        ? 2
        : DEMO_PARAM === 'unlock4' || DEMO_PARAM === 'shudder'
          ? 3
          : null

export const DEMO_UNLOCK: boolean = DEMO_SONG_INDEX !== null
