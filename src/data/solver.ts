import type { SymbolId } from '../assets/symbols'
import { evaluate, splitRow } from './evaluate'
import type { EquationToken, Puzzle } from './puzzles'

/**
 * Exhaustive search bound. Every clue template caps its result at ≤ 99 and each clue
 * pins its new unknown to at most (result + known values), so no value can exceed ~120;
 * 150 leaves margin. The verify script re-checks with a higher bound.
 */
export const SOLVER_LIMIT = 150

export const symbolsIn = (tokens: EquationToken[]): SymbolId[] =>
  tokens.flatMap((t) => (t.type === 'symbol' ? [t.id] : []))

/** All positive-integer assignments (1..limit) satisfying every clue row. Stops after 2. */
export function solveClues(p: Puzzle, limit = SOLVER_LIMIT): Record<string, number>[] {
  const rows = p.rows.map((r) => {
    const [lhs, rhs] = splitRow(r.tokens)
    return { lhs, rhs: rhs?.type === 'number' ? rhs.value : NaN, syms: new Set(symbolsIn(r.tokens)) }
  })
  const vars = [...new Set(rows.flatMap((r) => [...r.syms]))]
  const checkAt = vars.map(() => [] as typeof rows)
  for (const r of rows) {
    const depth = Math.max(...[...r.syms].map((s) => vars.indexOf(s)))
    if (depth >= 0) checkAt[depth].push(r)
  }
  const sols: Record<string, number>[] = []
  const vals: Partial<Record<SymbolId, number>> = {}
  const rec = (d: number) => {
    if (sols.length > 1) return
    if (d === vars.length) {
      sols.push({ ...vals } as Record<string, number>)
      return
    }
    for (let v = 1; v <= limit && sols.length < 2; v += 1) {
      vals[vars[d]] = v
      if (checkAt[d].every((r) => evaluate(r.lhs, vals) === r.rhs)) rec(d + 1)
    }
    delete vals[vars[d]]
  }
  rec(0)
  return sols
}

/** Returns a list of problems; empty means the puzzle is valid. */
export function validatePuzzle(
  p: Puzzle,
  opts: { multipleChoice: boolean; limit?: number },
): string[] {
  const errs: string[] = []
  for (const r of p.rows) {
    const [, rhs] = splitRow(r.tokens)
    if (rhs?.type !== 'number' || !(rhs.value > 0)) errs.push('clue result must be a positive number')
  }
  const clueSyms = new Set(p.rows.flatMap((r) => symbolsIn(r.tokens)))
  for (const id of symbolsIn(p.finalRow.tokens)) {
    if (!clueSyms.has(id)) errs.push(`final uses ${id} which no clue defines`)
  }
  const sols = solveClues(p, opts.limit)
  if (sols.length !== 1) errs.push(`${sols.length === 0 ? 'no' : 'multiple'} solutions`)
  const sol = sols[0] ?? {}
  const keys = Object.keys(p.values)
  if (keys.length !== Object.keys(sol).length || keys.some((k) => sol[k] !== p.values[k as SymbolId])) {
    errs.push('stored values do not match solution')
  }
  for (const v of Object.values(p.values)) {
    if (!Number.isInteger(v) || (v as number) < 1) errs.push('value not a positive integer')
  }
  const [flhs, frhs] = splitRow(p.finalRow.tokens)
  if (frhs?.type !== 'unknown') errs.push('final row must end in ?')
  const ans = evaluate(flhs, p.values)
  if (ans === null) errs.push('final has a non-whole division')
  if (ans !== p.correctAnswer) errs.push(`final evaluates to ${ans}, stored ${p.correctAnswer}`)
  if (!(Number.isInteger(p.correctAnswer) && p.correctAnswer > 0)) errs.push('answer not a positive integer')
  if (opts.multipleChoice) {
    const c = p.choices
    if (c.length !== 4) errs.push(`${c.length} choices`)
    if (new Set(c).size !== c.length) errs.push('duplicate choices')
    if (!c.includes(p.correctAnswer)) errs.push('answer missing from choices')
    if (c.some((x) => !Number.isInteger(x) || x < 0)) errs.push('choice not a non-negative integer')
  }
  if (!p.explanation.includes(String(p.correctAnswer))) errs.push('explanation lacks the answer')
  return errs
}
