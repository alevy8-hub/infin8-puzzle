/**
 * Free public build: `VITE_FREE=1 vite build`.
 * Only DJ's original 8 Beginner puzzles; Intermediate/Advanced shown as locked "Subscribers" tiles.
 */
export const FREE: boolean = import.meta.env?.VITE_FREE === '1'

export const SUBSCRIBE_URL = 'https://x.com/DJAlevy8/creator-subscriptions/subscribe'

/** Free build keeps its own saves so it never touches subscriber progress or points on the same origin. */
export const storageKey = (key: string): string => (FREE ? key.replace('infin8-puzzle-', 'infin8-puzzle-free-') : key)
