/**
 * Which level tiles are playable on the start screen.
 * Free build: only Beginner (index 0). Subscriber build: all three, from the start.
 */
export const isLevelOpen = (free: boolean, index: number): boolean => (free ? index === 0 : true)
