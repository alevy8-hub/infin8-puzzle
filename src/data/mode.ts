/**
 * Free public build: `VITE_FREE=1 vite build`.
 * Only DJ's original 8 Beginner puzzles; Intermediate/Advanced shown as locked "Subscribers" tiles.
 */
export const FREE: boolean = import.meta.env?.VITE_FREE === '1'

export const SUBSCRIBE_URL = 'https://x.com/DJAlevy8/creator-subscriptions/subscribe'

/**
 * Free build writes to its own keys so it never overwrites subscriber later-round progress
 * on the same origin (alevy8-hub.github.io). The subscriber build imports those free saves
 * (see migrate.ts) so points and the original-8 Beginner run carry over after someone subscribes.
 */
export const freeStorageKey = (key: string): string => key.replace('infin8-puzzle-', 'infin8-puzzle-free-')
export const storageKey = (key: string): string => (FREE ? freeStorageKey(key) : key)

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
