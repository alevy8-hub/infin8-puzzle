import type { LevelId } from './levels'
import { DEMO_UNLOCK, FREE, freeStorageKey, storageKey } from './mode'
import { importFreeProgress } from './migrate'

export type RoundState = {
  number: number
  seed: number
  index: number
  misses: number
  firstTry: number
  /** current puzzle already had a wrong answer */
  missedCurrent: boolean
  /** points earned so far this round (missing in older saves) */
  points?: number
}

export type LevelProgress = {
  roundsCleared: number
  /** best first-try score out of 8 */
  bestScore: number | null
  round: RoundState | null
  /** last finished round, for the round-complete screen */
  lastRound: { number: number; firstTry: number; misses: number; points?: number } | null
}

export type Progress = Record<LevelId, LevelProgress>

const KEY = storageKey('infin8-puzzle-progress-v2')
const OLD_KEY = storageKey('infin8-puzzle-progress-v1')

const fresh = (): LevelProgress => ({ roundsCleared: 0, bestScore: null, round: null, lastRound: null })

export const emptyProgress = (): Progress => ({
  beginner: fresh(),
  intermediate: fresh(),
  advanced: fresh(),
})

function readProgress(storage: string): Progress | null {
  const raw = localStorage.getItem(storage)
  if (!raw) return null
  const parsed = JSON.parse(raw) as Partial<Progress>
  const base = emptyProgress()
  for (const id of Object.keys(base) as LevelId[]) {
    const p = parsed[id]
    if (p && typeof p === 'object') base[id] = { ...base[id], ...p }
  }
  return base
}

function readLegacyProgress(): Progress {
  const base = emptyProgress()
  const old = localStorage.getItem(OLD_KEY)
  if (old) {
    const parsed = JSON.parse(old) as Record<string, { cleared?: boolean }>
    for (const id of Object.keys(base) as LevelId[]) {
      if (parsed[id]?.cleared) base[id].roundsCleared = 1
    }
  }
  return base
}

export function loadProgress(): Progress {
  let base = emptyProgress()
  try {
    base = readProgress(KEY) ?? readLegacyProgress()
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  if (FREE || DEMO_UNLOCK) return base
  try {
    const free = readProgress(freeStorageKey('infin8-puzzle-progress-v2'))
    if (!free) return base
    const { next, changed } = importFreeProgress(base, free)
    if (!changed) return base
    saveProgress(next)
    return next
  } catch {
    return base
  }
}

export function saveProgress(p: Progress): void {
  try {
    if (DEMO_UNLOCK) return
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* ignore (private mode etc.) */
  }
}
