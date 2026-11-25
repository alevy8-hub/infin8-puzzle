/**
 * Checks that free-build points and Beginner progress import into the
 * subscriber build once, without overwriting a later subscriber run.
 * Run: npx tsx scripts/verify-migrate.ts
 */
import { emptyImport, importFreePoints, importFreeProgress, mergeLevelProgress } from '../src/data/migrate'
import { isLevelOpen } from '../src/data/unlock'
import { emptyProgress, type LevelProgress } from '../src/data/progress'
import type { PointsState } from '../src/data/points'

let failed = 0
const check = (name: string, cond: boolean, detail = '') => {
  failed += cond ? 0 : 1
  console.log(`  ${cond ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`)
}

const freshLevel = (): LevelProgress => ({ roundsCleared: 0, bestScore: null, round: null, lastRound: null })
const pts = (total: number, beginner = total, lastSolveDay: string | null = '2026-11-25', streak = 1): PointsState => ({
  total,
  byLevel: { beginner, intermediate: 0, advanced: 0 },
  streak,
  lastSolveDay,
})
const midFree = (index: number, points = 40): LevelProgress => ({
  roundsCleared: 0,
  bestScore: null,
  round: { number: 1, seed: 1, index, misses: 0, firstTry: index, missedCurrent: false, points },
  lastRound: null,
})

console.log('importFreePoints')
{
  const empty = pts(0, 0, null, 0)
  const { next, imported, changed } = importFreePoints(empty, pts(185, 185), emptyImport())
  check("DJ's case: 185 free pts appear on an empty subscriber save", changed && next.total === 185 && next.byLevel.beginner === 185)
  check('records 185 as already imported', imported.pointsTotal === 185 && imported.byLevel.beginner === 185)
  const again = importFreePoints(next, pts(185, 185), imported)
  check('does not add the same 185 twice', !again.changed && again.next.total === 185)
  const more = importFreePoints(next, pts(205, 205), imported)
  check('adds only new free points earned later', more.changed && more.next.total === 205 && more.imported.pointsTotal === 205)
}
{
  const sub = pts(80, 40, '2026-11-25', 2)
  sub.byLevel.intermediate = 40
  const { next } = importFreePoints(sub, pts(185, 185, '2026-11-24', 1), emptyImport())
  check('adds free pts on top of existing subscriber pts', next.total === 265 && next.byLevel.beginner === 225 && next.byLevel.intermediate === 40)
  check('keeps the more recent subscriber streak day', next.lastSolveDay === '2026-11-25' && next.streak === 2)
}

console.log('importFreeProgress')
{
  const free = emptyProgress()
  free.beginner = midFree(2)
  const { next, changed } = importFreeProgress(emptyProgress(), free)
  check("DJ's case: Beginner continues at 2/8", changed && next.beginner.round?.index === 2 && next.beginner.roundsCleared === 0)
  check('Intermediate stays locked (no Beginner round cleared yet)', next.intermediate.roundsCleared === 0 && next.intermediate.round === null)
}
{
  const free = emptyProgress()
  free.beginner = { roundsCleared: 1, bestScore: 7, round: null, lastRound: { number: 1, firstTry: 7, misses: 1, points: 145 } }
  const { next } = importFreeProgress(emptyProgress(), free)
  check('finishing the free 8 carries over a cleared Beginner round (unlocks Intermediate)', next.beginner.roundsCleared === 1 && next.beginner.bestScore === 7)
}
{
  const sub = emptyProgress()
  sub.beginner = midFree(1)
  const free = emptyProgress()
  free.beginner = midFree(2)
  const { next } = importFreeProgress(sub, free)
  check('takes the further of two in-progress original-8 runs', next.beginner.round?.index === 2)
}
{
  const sub = emptyProgress()
  sub.beginner = {
    roundsCleared: 1,
    bestScore: 6,
    round: { number: 2, seed: 99, index: 3, misses: 0, firstTry: 3, missedCurrent: false },
    lastRound: { number: 1, firstTry: 6, misses: 2 },
  }
  const free = emptyProgress()
  free.beginner = midFree(2)
  const merged = mergeLevelProgress(sub.beginner, free.beginner)
  check("does not overwrite a subscriber's later Beginner round", merged === sub.beginner && merged.round?.number === 2 && merged.round.index === 3)
}

console.log('isLevelOpen')
{
  check('subscriber: Beginner, Intermediate and Advanced are all open', isLevelOpen(false, 0) && isLevelOpen(false, 1) && isLevelOpen(false, 2))
  check('free: only Beginner is open', isLevelOpen(true, 0) && !isLevelOpen(true, 1) && !isLevelOpen(true, 2))
}

if (failed) {
  console.error(`\n${failed} check(s) failed`)
  process.exit(1)
}
console.log('\nAll migrate checks passed')
