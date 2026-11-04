import type { LevelId } from './levels'
import { DEMO_UNLOCK, storageKey } from './mode'

/** Base points per solve. */
export const BASE_POINTS: Record<LevelId, number> = { beginner: 10, intermediate: 20, advanced: 40 }
export const FIRST_TRY_MULTIPLIER = 1.5
export const STREAK_BONUS_PER_DAY = 5
export const STREAK_BONUS_CAP = 50

export type PointsState = {
  total: number
  byLevel: Record<LevelId, number>
  /** consecutive local calendar days with at least one solve */
  streak: number
  /** local YYYY-MM-DD of the last solve */
  lastSolveDay: string | null
}

export type Award = {
  total: number
  base: number
  firstTryBonus: number
  streakBonus: number
  /** streak day the bonus was for (0 when no bonus) */
  streakDay: number
  roundBonus: number
}

const KEY = storageKey('infin8-puzzle-points-v1')

const fresh = (): PointsState => ({
  total: 0,
  byLevel: { beginner: 0, intermediate: 0, advanced: 0 },
  streak: 0,
  lastSolveDay: null,
})

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0)

export function dayKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function yesterdayKey(now: Date): string {
  return dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))
}

export function loadPoints(): PointsState {
  const base = fresh()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const p = JSON.parse(raw) as Partial<PointsState> | null
    if (!p || typeof p !== 'object') return base
    base.total = num(p.total)
    for (const id of Object.keys(base.byLevel) as LevelId[]) base.byLevel[id] = num(p.byLevel?.[id])
    base.streak = num(p.streak)
    base.lastSolveDay = typeof p.lastSolveDay === 'string' ? p.lastSolveDay : null
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return base
}

export function savePoints(p: PointsState): void {
  try {
    if (DEMO_UNLOCK) return
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* ignore (private mode etc.) */
  }
}

/** Streak still alive (solved today or yesterday); otherwise 0. */
export function currentStreak(p: PointsState, now: Date = new Date()): number {
  if (p.lastSolveDay === dayKey(now) || p.lastSolveDay === yesterdayKey(now)) return p.streak
  return 0
}

/** Points for one correct solve; returns the award and the next saved state. */
export function awardSolve(
  p: PointsState,
  level: LevelId,
  firstTry: boolean,
  roundCleared: boolean,
  now: Date = new Date(),
): { award: Award; next: PointsState } {
  const base = BASE_POINTS[level]
  const firstTryBonus = firstTry ? Math.round(base * FIRST_TRY_MULTIPLIER) - base : 0
  const today = dayKey(now)
  let streak = p.streak
  let streakBonus = 0
  let streakDay = 0
  if (p.lastSolveDay !== today) {
    streak = p.lastSolveDay === yesterdayKey(now) ? p.streak + 1 : 1
    streakDay = streak
    streakBonus = Math.min(STREAK_BONUS_PER_DAY * streak, STREAK_BONUS_CAP)
  }
  const roundBonus = roundCleared ? base * 2 : 0
  const total = base + firstTryBonus + streakBonus + roundBonus
  return {
    award: { total, base, firstTryBonus, streakBonus, streakDay, roundBonus },
    next: {
      total: p.total + total,
      byLevel: { ...p.byLevel, [level]: p.byLevel[level] + total },
      streak,
      lastSolveDay: today,
    },
  }
}

export const formatPoints = (n: number) => n.toLocaleString('en-US')
