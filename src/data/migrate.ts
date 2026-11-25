import type { LevelId } from './levels'
import type { PointsState } from './points'
import type { LevelProgress, Progress } from './progress'

/**
 * One-way import of free-build saves into the subscriber build.
 * The free build keeps writing to its own keys so it cannot overwrite a
 * subscriber's later generated rounds. The subscriber build adds any free
 * points not yet imported, and carries over Beginner progress on the
 * original 8 when the subscriber Beginner run has not moved past them.
 */
export const FREE_IMPORT_KEY = 'infin8-puzzle-free-import-v1'

export type FreeImportState = {
  pointsTotal: number
  byLevel: Record<LevelId, number>
}

export const emptyImport = (): FreeImportState => ({
  pointsTotal: 0,
  byLevel: { beginner: 0, intermediate: 0, advanced: 0 },
})

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0)

export function parseImport(raw: string | null): FreeImportState {
  const base = emptyImport()
  if (!raw) return base
  try {
    const p = JSON.parse(raw) as Partial<FreeImportState> | null
    if (!p || typeof p !== 'object') return base
    base.pointsTotal = num(p.pointsTotal)
    for (const id of Object.keys(base.byLevel) as LevelId[]) base.byLevel[id] = num(p.byLevel?.[id])
  } catch {
    /* ignore */
  }
  return base
}

function pickStreak(sub: PointsState, free: PointsState): Pick<PointsState, 'streak' | 'lastSolveDay'> {
  if (!free.lastSolveDay) return { streak: sub.streak, lastSolveDay: sub.lastSolveDay }
  if (!sub.lastSolveDay) return { streak: free.streak, lastSolveDay: free.lastSolveDay }
  if (free.lastSolveDay > sub.lastSolveDay) return { streak: free.streak, lastSolveDay: free.lastSolveDay }
  if (sub.lastSolveDay > free.lastSolveDay) return { streak: sub.streak, lastSolveDay: sub.lastSolveDay }
  return { streak: Math.max(sub.streak, free.streak), lastSolveDay: sub.lastSolveDay }
}

export function importFreePoints(
  sub: PointsState,
  free: PointsState,
  imported: FreeImportState,
): { next: PointsState; imported: FreeImportState; changed: boolean } {
  const dTotal = Math.max(0, free.total - imported.pointsTotal)
  const dLevel: Record<LevelId, number> = {
    beginner: Math.max(0, free.byLevel.beginner - imported.byLevel.beginner),
    intermediate: Math.max(0, free.byLevel.intermediate - imported.byLevel.intermediate),
    advanced: Math.max(0, free.byLevel.advanced - imported.byLevel.advanced),
  }
  const streak = pickStreak(sub, free)
  const streakChanged = streak.streak !== sub.streak || streak.lastSolveDay !== sub.lastSolveDay
  if (dTotal === 0 && dLevel.beginner === 0 && dLevel.intermediate === 0 && dLevel.advanced === 0 && !streakChanged) {
    return { next: sub, imported, changed: false }
  }
  return {
    next: {
      total: sub.total + dTotal,
      byLevel: {
        beginner: sub.byLevel.beginner + dLevel.beginner,
        intermediate: sub.byLevel.intermediate + dLevel.intermediate,
        advanced: sub.byLevel.advanced + dLevel.advanced,
      },
      streak: streak.streak,
      lastSolveDay: streak.lastSolveDay,
    },
    imported: {
      pointsTotal: Math.max(imported.pointsTotal, free.total),
      byLevel: {
        beginner: Math.max(imported.byLevel.beginner, free.byLevel.beginner),
        intermediate: Math.max(imported.byLevel.intermediate, free.byLevel.intermediate),
        advanced: Math.max(imported.byLevel.advanced, free.byLevel.advanced),
      },
    },
    changed: true,
  }
}

const maxScore = (a: number | null, b: number | null): number | null => {
  if (a === null) return b
  if (b === null) return a
  return Math.max(a, b)
}

/** Subscriber has already left the original 8 (cleared a Beginner round, or started a later one). */
export function subscriberBeganPastOriginal8(p: LevelProgress): boolean {
  return p.roundsCleared > 0 || (p.round !== null && p.round.number > 1)
}

export function mergeLevelProgress(sub: LevelProgress, free: LevelProgress): LevelProgress {
  if (subscriberBeganPastOriginal8(sub)) return sub
  if (free.roundsCleared > sub.roundsCleared) {
    return {
      roundsCleared: free.roundsCleared,
      bestScore: maxScore(sub.bestScore, free.bestScore),
      round: free.round,
      lastRound: free.lastRound ?? sub.lastRound,
    }
  }
  const subIdx = sub.round?.index ?? 0
  const freeIdx = free.round?.index ?? 0
  if (free.roundsCleared === sub.roundsCleared && freeIdx > subIdx) {
    return {
      ...sub,
      round: free.round,
      lastRound: sub.lastRound ?? free.lastRound,
      bestScore: maxScore(sub.bestScore, free.bestScore),
    }
  }
  const best = maxScore(sub.bestScore, free.bestScore)
  const lastRound = sub.lastRound ?? free.lastRound
  if (best !== sub.bestScore || lastRound !== sub.lastRound) return { ...sub, bestScore: best, lastRound }
  return sub
}

export function importFreeProgress(sub: Progress, free: Progress): { next: Progress; changed: boolean } {
  let changed = false
  const next: Progress = { ...sub }
  for (const id of Object.keys(sub) as LevelId[]) {
    const merged = mergeLevelProgress(sub[id], free[id])
    if (merged !== sub[id]) {
      next[id] = merged
      changed = true
    }
  }
  return { next, changed }
}
