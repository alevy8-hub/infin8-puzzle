/**
 * Machine-verifies every puzzle:
 *  - clue rows have exactly one positive-integer solution (exhaustive search 1..LIMIT with pruning)
 *  - that solution matches the stored values; final row evaluates to the stored answer
 *  - 4 distinct non-negative integer choices, answer included, left-to-right trap included
 *  - every symbol id has a PNG in public/assets/symbols
 * Run: npm run verify
 */
import { existsSync } from 'node:fs'
import { evaluate, splitRow } from '../src/data/evaluate'
import { sections } from '../src/data/levels'
import type { EquationToken, Puzzle } from '../src/data/puzzles'
import type { SymbolId } from '../src/assets/symbols'

const LIMIT = Number(process.env.VERIFY_LIMIT ?? 300)
let failures = 0
const fail = (p: Puzzle, msg: string) => {
  failures += 1
  console.log(`  ✗ ${p.id}: ${msg}`)
}

const symbolsIn = (tokens: EquationToken[]) =>
  tokens.flatMap((t) => (t.type === 'symbol' ? [t.id] : []))

function solve(p: Puzzle): Record<string, number>[] {
  const rows = p.rows.map((r) => {
    const [lhs, rhs] = splitRow(r.tokens)
    if (rhs?.type !== 'number') throw new Error(`${p.id}: clue result must be a number`)
    return { lhs, rhs: rhs.value, syms: new Set(symbolsIn(r.tokens)) }
  })
  const vars = [...new Set(rows.flatMap((r) => [...r.syms]))] as SymbolId[]
  // rows to check once the var at depth d has been assigned
  const checkAt = vars.map(() => [] as typeof rows)
  for (const r of rows) {
    const depth = Math.max(...[...r.syms].map((s) => vars.indexOf(s as SymbolId)))
    checkAt[depth].push(r)
  }
  const sols: Record<string, number>[] = []
  const vals: Partial<Record<SymbolId, number>> = {}
  const rec = (d: number) => {
    if (d === vars.length) {
      sols.push({ ...vals } as Record<string, number>)
      return
    }
    for (let v = 1; v <= LIMIT; v += 1) {
      vals[vars[d]] = v
      if (checkAt[d].every((r) => evaluate(r.lhs, vals) === r.rhs)) rec(d + 1)
    }
    delete vals[vars[d]]
  }
  rec(0)
  return sols
}

let total = 0
for (const section of sections) {
  console.log(`\n${section.name} (${section.puzzles.length} puzzles)`)
  if (section.puzzles.length !== 8) failures += 1
  for (const p of section.puzzles) {
    total += 1
    const before = failures
    const all = [...p.rows, p.finalRow].flatMap((r) => symbolsIn(r.tokens))
    for (const id of new Set(all)) {
      if (!existsSync(`public/assets/symbols/${id}.png`)) fail(p, `missing asset ${id}.png`)
    }
    const clueSyms = new Set(p.rows.flatMap((r) => symbolsIn(r.tokens)))
    for (const id of symbolsIn(p.finalRow.tokens)) {
      if (!clueSyms.has(id)) fail(p, `final uses ${id} which no clue defines`)
    }
    const sols = solve(p)
    if (sols.length !== 1) fail(p, `${sols.length} solutions in 1..${LIMIT}: ${JSON.stringify(sols.slice(0, 3))}`)
    const sol = sols[0] ?? {}
    const keys = Object.keys(p.values)
    if (keys.length !== Object.keys(sol).length || keys.some((k) => sol[k] !== p.values[k as SymbolId])) {
      fail(p, `stored values ${JSON.stringify(p.values)} ≠ solution ${JSON.stringify(sol)}`)
    }
    const [flhs, frhs] = splitRow(p.finalRow.tokens)
    if (frhs?.type !== 'unknown') fail(p, 'final row must end in ?')
    const ans = evaluate(flhs, p.values)
    if (ans !== p.correctAnswer) fail(p, `final evaluates to ${ans}, stored ${p.correctAnswer}`)
    if (!(Number.isInteger(p.correctAnswer) && p.correctAnswer > 0)) fail(p, 'answer not a positive integer')
    const c = p.choices
    if (c.length !== 4) fail(p, `${c.length} choices`)
    if (new Set(c).size !== c.length) fail(p, `duplicate choices ${c}`)
    if (!c.includes(p.correctAnswer)) fail(p, 'answer missing from choices')
    if (c.some((x) => !Number.isInteger(x) || x < 0)) fail(p, 'choice not a non-negative integer')
    const ltr = evaluate(flhs, p.values, false)
    const trapNote =
      ltr === null || ltr === ans
        ? 'n/a (same or non-whole)'
        : c.includes(ltr)
          ? `${ltr} ✓`
          : `${ltr} MISSING`
    if (ltr !== null && ltr !== ans && !c.includes(ltr)) fail(p, `left-to-right trap ${ltr} not in choices`)
    if (!p.explanation.includes(String(p.correctAnswer))) fail(p, 'explanation does not state the answer')
    const vals = Object.entries(p.values).map(([k, v]) => `${k}=${v}`).join(', ')
    console.log(
      `  ${failures === before ? '✓' : '✗'} ${p.id}  [${vals}]  answer ${ans}  choices ${c.join('/')}  LTR trap: ${trapNote}`,
    )
  }
}
console.log(`\n${total} puzzles checked, ${failures} failure(s).`)
process.exit(failures ? 1 : 0)
