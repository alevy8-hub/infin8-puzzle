/**
 * Verifies the frozen V1 Beginner puzzles and N generated puzzles per level.
 * Each generated puzzle is re-checked independently with a higher solver bound.
 * Run: npm run verify        (N defaults to 10000; VERIFY_N=20000 npm run verify)
 */
import { existsSync } from 'node:fs'
import { evaluate, splitRow } from '../src/data/evaluate'
import { generatePuzzle, LEVEL_SPECS, type GenStats, type LevelId } from '../src/data/generator'
import { beginnerPuzzles, type Puzzle } from '../src/data/puzzles'
import { symbolsIn, validatePuzzle } from '../src/data/solver'

const N = Number(process.env.VERIFY_N ?? 10000)
const DEEP_LIMIT = 400
let failures = 0

const assetErrs = (p: Puzzle) =>
  [...new Set([...p.rows, p.finalRow].flatMap((r) => symbolsIn(r.tokens)))]
    .filter((id) => !existsSync(`public/assets/symbols/${id}.png`))
    .map((id) => `missing asset ${id}.png`)

console.log('Frozen V1 Beginner (round 1)')
for (const p of beginnerPuzzles) {
  const errs = [...validatePuzzle(p, { multipleChoice: true, limit: 1000 }), ...assetErrs(p)]
  failures += errs.length ? 1 : 0
  console.log(`  ${errs.length ? '✗' : '✓'} ${p.id} answer ${p.correctAnswer} ${errs.join('; ')}`)
}

const range = () => ({ min: Infinity, max: -Infinity })
const upd = (r: { min: number; max: number }, v: number) => {
  r.min = Math.min(r.min, v)
  r.max = Math.max(r.max, v)
}

for (const level of Object.keys(LEVEL_SPECS) as LevelId[]) {
  const spec = LEVEL_SPECS[level]
  const t0 = Date.now()
  let fails = 0
  let attempts = 0
  let maxAttempts = 0
  const values = range()
  const clueNums = range()
  const answers = range()
  const ops: Record<string, number> = { '+': 0, '−': 0, '×': 0, '÷': 0 }
  const finalOps: Record<string, number> = { '+': 0, '−': 0, '×': 0, '÷': 0 }
  const variants: Record<string, number> = {}
  const finals: Record<string, number> = {}
  const symbolUse: Record<string, number> = {}
  let withGroup = 0
  let ltrTrap = 0
  let ltrApplicable = 0
  const ids = new Set<string>()
  const clueCounts: Record<number, number> = {}
  const sampleAnswers: number[] = []
  for (let i = 0; i < N; i += 1) {
    const seed = 100000 + i * 7 + 13
    const st = {} as GenStats
    let p: Puzzle
    try {
      p = generatePuzzle(level, seed, st)
    } catch (e) {
      fails += 1
      console.log(`  ✗ ${level}:${seed} ${String(e)}`)
      continue
    }
    // determinism: same seed → same puzzle
    const again = generatePuzzle(level, seed)
    const errs = [
      ...validatePuzzle(p, { multipleChoice: spec.multipleChoice, limit: i < 2000 ? DEEP_LIMIT : undefined }),
      ...assetErrs(p),
      ...(JSON.stringify(again) !== JSON.stringify(p) ? ['not deterministic'] : []),
      ...(spec.multipleChoice ? [] : p.choices.length ? ['typed level has choices'] : []),
      ...(p.rows.length > 4 ? ['more than 4 clue lines'] : []),
    ]
    if (errs.length) {
      fails += 1
      if (fails <= 5) console.log(`  ✗ ${p.id}: ${errs.join('; ')}`)
    }
    ids.add(JSON.stringify([p.rows, p.finalRow]))
    attempts += st.attempts
    maxAttempts = Math.max(maxAttempts, st.attempts)
    variants[st.variant] = (variants[st.variant] ?? 0) + 1
    finals[st.final] = (finals[st.final] ?? 0) + 1
    clueCounts[p.rows.length] = (clueCounts[p.rows.length] ?? 0) + 1
    Object.values(p.values).forEach((v) => upd(values, v as number))
    p.symbolsUsed.forEach((s) => (symbolUse[s] = (symbolUse[s] ?? 0) + 1))
    for (const r of p.rows) {
      const [lhs, rhs] = splitRow(r.tokens)
      if (rhs.type === 'number') upd(clueNums, rhs.value)
      lhs.forEach((t) => t.type === 'op' && (ops[t.value] += 1))
    }
    const [flhs] = splitRow(p.finalRow.tokens)
    flhs.forEach((t) => t.type === 'op' && (finalOps[t.value] += 1))
    if ([...p.rows, p.finalRow].some((r) => r.tokens.some((t) => t.type === 'symbol' && (t.count ?? 1) > 1))) withGroup += 1
    upd(answers, p.correctAnswer)
    if (sampleAnswers.length < 100000) sampleAnswers.push(p.correctAnswer)
    const ltr = evaluate(flhs, p.values, false)
    if (spec.multipleChoice && ltr !== null && ltr !== p.correctAnswer && ltr >= 0) {
      ltrApplicable += 1
      if (p.choices.includes(ltr)) ltrTrap += 1
    }
  }
  failures += fails
  sampleAnswers.sort((a, b) => a - b)
  const median = sampleAnswers[Math.floor(sampleAnswers.length / 2)]
  const pct = (n: number) => `${((100 * n) / N).toFixed(1)}%`
  console.log(`\n${level.toUpperCase()}: ${N} generated, ${fails} failure(s), ${ids.size} distinct, ${((Date.now() - t0) / 1000).toFixed(1)}s`)
  console.log(`  symbol values ${values.min}–${values.max} · clue results ${clueNums.min}–${clueNums.max} · answers ${answers.min}–${answers.max} (median ${median})`)
  console.log(`  clue ops ${JSON.stringify(ops)} · final ops ${JSON.stringify(finalOps)}`)
  console.log(`  clue lines ${JSON.stringify(clueCounts)} · with pair/group ${pct(withGroup)} · variants ${JSON.stringify(variants)}`)
  console.log(`  finals ${JSON.stringify(finals)}`)
  console.log(`  generator attempts avg ${(attempts / N).toFixed(1)}, max ${maxAttempts} · all 16 symbols used: ${Object.keys(symbolUse).length === 16}`)
  if (spec.multipleChoice) console.log(`  left-to-right trap offered when it differs: ${ltrTrap}/${ltrApplicable}`)
}
console.log(`\nTotal failures: ${failures}`)
process.exit(failures ? 1 : 0)
