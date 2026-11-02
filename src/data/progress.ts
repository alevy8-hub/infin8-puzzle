import type { LevelId } from './levels'

export type RoundState = {
  number: number
  seed: number
  index: number
  misses: number
  firstTry: number
  /** current puzzle already had a wrong answer */
  missedCurrent: boolean
}

export type LevelProgress = {
  roundsCleared: number
  /** best first-try score out of 8 */
  bestScore: number | null
  round: RoundState | null
  /** last finished round, for the round-complete screen */
  lastRound: { number: number; firstTry: number; misses: number } | null
}

export type Progress = Record<LevelId, LevelProgress>

const KEY = 'infin8-puzzle-progress-v2'
const OLD_KEY = 'infin8-puzzle-progress-v1'

const fresh = (): LevelProgress => ({ roundsCleared: 0, bestScore: null, round: null, lastRound: null })

export const emptyProgress = (): Progress => ({
  beginner: fresh(),
  intermediate: fresh(),
  advanced: fresh(),
})

export function loadProgress(): Progress {
  const base = emptyProgress()
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Progress>
      for (const id of Object.keys(base) as LevelId[]) {
        const p = parsed[id]
        if (p && typeof p === 'object') base[id] = { ...base[id], ...p }
      }
      return base
    }
    // carry over unlocks from the earlier 3-section preview
    const old = localStorage.getItem(OLD_KEY)
    if (old) {
      const parsed = JSON.parse(old) as Record<string, { cleared?: boolean }>
      for (const id of Object.keys(base) as LevelId[]) {
        if (parsed[id]?.cleared) base[id].roundsCleared = 1
      }
    }
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return base
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* ignore (private mode etc.) */
  }
}
