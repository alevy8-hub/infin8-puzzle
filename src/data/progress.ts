import type { SectionId } from './levels'

export type SectionProgress = {
  /** index of the next unsolved puzzle in this run */
  index: number
  /** wrong submissions in this run */
  misses: number
  /** section cleared at least once (unlocks the next one) */
  cleared: boolean
  /** fewest misses on a full clear */
  bestMisses: number | null
}

export type Progress = Record<SectionId, SectionProgress>

const KEY = 'infin8-puzzle-progress-v1'

const fresh = (): SectionProgress => ({ index: 0, misses: 0, cleared: false, bestMisses: null })

export const emptyProgress = (): Progress => ({
  beginner: fresh(),
  intermediate: fresh(),
  advanced: fresh(),
})

export function loadProgress(): Progress {
  const base = emptyProgress()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<Progress>
    for (const id of Object.keys(base) as SectionId[]) {
      const p = parsed[id]
      if (p && typeof p === 'object') base[id] = { ...base[id], ...p }
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
