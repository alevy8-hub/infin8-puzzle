import type { SymbolId } from '../assets/symbols'
import { row } from './build'
import { evaluate, splitRow } from './evaluate'
import { finalSteps, groupNotes } from './explain'
import type { EquationToken, Puzzle } from './puzzles'
import { createRng, type Rng } from './random'
import { validatePuzzle } from './solver'
import { ALL_SYMBOLS, SYMBOL_NAMES } from './symbolNames'

export type LevelId = 'beginner' | 'intermediate' | 'advanced'
type Role = 'A' | 'B' | 'C'
type RoleValues = Record<Role, number>

type Variant = {
  name: string
  weight: number
  /** one pool of templates per clue line, in order */
  clues: string[][]
  finals: string[]
  /** optional first-step hint for the explanation */
  hint?: (v: RoleValues, n: Record<Role, string>) => string
}

type LevelSpec = {
  letter: 'B' | 'I' | 'A'
  ranges: Record<Role, [number, number]>
  maxClue: number
  maxAnswer: number
  multipleChoice: boolean
  variants: Variant[]
}

const NO_GROUP_FINALS_ADV = ['A + B × C', 'A × B − C', 'B × C − A', 'A − B + C × B', 'A + C ÷ B', 'C × B + A']

export const LEVEL_SPECS: Record<LevelId, LevelSpec> = {
  beginner: {
    letter: 'B',
    ranges: { A: [2, 9], B: [2, 6], C: [2, 5] },
    maxClue: 30,
    maxAnswer: 50,
    multipleChoice: true,
    variants: [
      {
        name: 'add-chain',
        weight: 1,
        clues: [
          ['A + A + A', 'A + A'],
          ['A + B + B', 'A + B', 'B + B + A'],
          ['B + C + C', 'C + B', 'C + C + C'],
        ],
        finals: ['A + B × C', 'A + B × C', 'A + B × C', 'A × B + C', 'A + B + C', 'A + B + C', 'A + B − C', 'A + C × B'],
      },
    ],
  },
  intermediate: {
    letter: 'I',
    ranges: { A: [3, 12], B: [2, 9], C: [2, 8] },
    maxClue: 99,
    maxAnswer: 99,
    multipleChoice: true,
    variants: [
      {
        name: 'mixed',
        weight: 65,
        clues: [
          ['A + A + A', 'A + A', 'A × A'],
          ['A − B', 'A + B + B', 'A ÷ B', 'A × B'],
          ['B × C', 'B + C + C', 'B − C', 'C × C', 'B ÷ C', 'C + C + B'],
        ],
        finals: ['A + B × C', 'A × B − C', 'A − B ÷ C', 'A + B ÷ C', 'C + A ÷ B', 'A × C + B', 'B × C − A', 'A + B − C'],
      },
      {
        name: 'pair',
        weight: 35,
        clues: [
          ['2:A + 2:A', 'A + A + A'],
          ['2:A + B', '2:A − B', 'B × A'],
          ['B × C', 'B + C + C', 'B − C', 'C + C + B'],
        ],
        finals: ['2:A + B × C', '2:A − B + C', 'B × C + 2:A', '2:A + B − C'],
      },
    ],
  },
  advanced: {
    letter: 'A',
    ranges: { A: [3, 12], B: [2, 9], C: [2, 9] },
    maxClue: 99,
    maxAnswer: 120,
    multipleChoice: false,
    variants: [
      {
        name: 'joint',
        weight: 35,
        clues: [['A + B'], ['A − B'], ['B × C', 'C + C + A', 'C × C', 'C − B']],
        finals: NO_GROUP_FINALS_ADV,
        hint: (v, n) =>
          `Add the top two clues: 2 × ${n.A} = ${v.A + v.B} + ${v.A - v.B}, so ${n.A} = ${v.A} and ${n.B} = ${v.B}.`,
      },
      {
        name: 'precedence-clue',
        weight: 35,
        clues: [['A + A + A', 'A + A'], ['A + A × B', 'A × B − A', 'B + A × B'], ['C + C + B', 'B × C', 'C − B', 'C × C', 'A ÷ C']],
        finals: NO_GROUP_FINALS_ADV,
        hint: (v, n) => `Clue 2 has a trap: × comes first, which gives ${n.B} = ${v.B}.`,
      },
      {
        name: 'group',
        weight: 30,
        clues: [['3:A + 3:A', '3:A + A'], ['2:A + B', 'B × 2:A', '2:A − B'], ['B − C', 'C × C', 'B + C + C', 'C + B']],
        finals: ['2:A + B × C', 'B × C − 2:A', '2:A × B − C', '2:A + C − B'],
      },
    ],
  },
}

function subst(template: string, ids: Record<Role, SymbolId>): string {
  return template.replace(/\b([ABC])\b/g, (_, r: Role) => ids[r])
}

const tokensOf = (t: string) => row(`${t} = ?`).tokens

function buildChoices(answer: number, finalTokens: EquationToken[], values: Puzzle['values'], rng: Rng): number[] {
  const [lhs] = splitRow(finalTokens)
  const traps: (number | null)[] = [
    evaluate(lhs, values, false), // left to right
    evaluate(
      lhs.map((t) => (t.type === 'symbol' ? { ...t, count: 1 } : t)),
      values,
    ), // group read as one symbol
    evaluate(
      lhs.map((t) => (t.type === 'op' ? { ...t, value: '+' as const } : t)),
      values,
    ), // everything added
    evaluate(
      lhs.map((t) => (t.type === 'op' && t.value === '×' ? { ...t, value: '+' as const } : t)),
      values,
    ), // × read as +
  ]
  const out = [answer]
  for (const t of traps) {
    if (out.length >= 4) break
    if (t !== null && t >= 0 && !out.includes(t)) out.push(t)
  }
  const offsets = [1, -1, 2, -2, 3, -3, 4, 5, -4, 6, 10, -5, 7, -6, 8, 9]
  while (out.length < 4) {
    const cand = answer + rng.pick(offsets)
    if (cand >= 0 && !out.includes(cand)) out.push(cand)
  }
  // seeded shuffle
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = rng.int(0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export type GenStats = { attempts: number; variant: string; final: string; clues: string[] }

/** One deterministic puzzle for (level, seed). Every result passed validatePuzzle. */
export function generatePuzzle(level: LevelId, seed: number, stats?: GenStats): Puzzle {
  const spec = LEVEL_SPECS[level]
  const rng = createRng(`${level}:${seed}`)
  for (let attempt = 1; attempt <= 5000; attempt += 1) {
    const variant = rng.weighted(spec.variants.map((v) => [v, v.weight] as const))
    const pool = [...ALL_SYMBOLS]
    const ids = {} as Record<Role, SymbolId>
    for (const r of ['A', 'B', 'C'] as Role[]) ids[r] = pool.splice(rng.int(0, pool.length - 1), 1)[0]
    const v = {} as RoleValues
    for (const r of ['A', 'B', 'C'] as Role[]) v[r] = rng.int(...spec.ranges[r])
    if (v.A === v.B || v.B === v.C || v.A === v.C) continue
    const values: Puzzle['values'] = { [ids.A]: v.A, [ids.B]: v.B, [ids.C]: v.C }

    const clueTemplates = variant.clues.map((p) => rng.pick(p))
    const finalTemplate = rng.pick(variant.finals)
    let ok = true
    const rows = clueTemplates.map((t) => {
      const lhs = tokensOf(subst(t, ids)).slice(0, -2)
      const rhs = evaluate(lhs, values)
      if (rhs === null || rhs <= 0 || rhs > spec.maxClue) ok = false
      return { tokens: [...lhs, { type: 'op', value: '=' }, { type: 'number', value: rhs ?? 0 }] as EquationToken[] }
    })
    if (!ok) continue
    const finalRow = { tokens: tokensOf(subst(finalTemplate, ids)) }
    // skip finals that just repeat a clue's left side (answer would be readable straight off a clue)
    const key = (ts: EquationToken[]) => ts.map((t) => JSON.stringify(t)).join(' ')
    const finalKey = key(splitRow(finalRow.tokens)[0])
    if (rows.some((r) => finalKey.startsWith(key(splitRow(r.tokens)[0])))) continue
    const answer = evaluate(splitRow(finalRow.tokens)[0], values)
    if (answer === null || answer <= 0 || answer > spec.maxAnswer) continue

    const names = { A: SYMBOL_NAMES[ids.A], B: SYMBOL_NAMES[ids.B], C: SYMBOL_NAMES[ids.C] }
    const parts = [
      ...(variant.hint ? [variant.hint(v, names)] : []),
      ...groupNotes({ rows, finalRow, values }),
      finalSteps(finalRow, values),
    ]
    const code = `${spec.letter}-${seed}`
    const puzzle: Puzzle = {
      id: code,
      title: `iNFiN8 Puzzle // ${code}`,
      prompt: 'Can you solve it?',
      values,
      symbolsUsed: [ids.A, ids.B, ids.C],
      rows,
      finalRow,
      correctAnswer: answer,
      choices: spec.multipleChoice ? buildChoices(answer, finalRow.tokens, values, rng) : [],
      explanation: parts.join(' '),
    }
    if (validatePuzzle(puzzle, { multipleChoice: spec.multipleChoice }).length) continue
    if (stats) Object.assign(stats, { attempts: attempt, variant: variant.name, final: finalTemplate, clues: clueTemplates })
    return puzzle
  }
  throw new Error(`generator gave up for ${level}:${seed}`)
}

/** Parse a shared code like "I-482913" → level + seed. */
export function parseCode(code: string): { level: LevelId; seed: number } | null {
  const m = /^([BIA])-?(\d{1,9})$/i.exec(code.trim())
  if (!m) return null
  const level = (Object.keys(LEVEL_SPECS) as LevelId[]).find((l) => LEVEL_SPECS[l].letter === m[1].toUpperCase())
  return level ? { level, seed: Number(m[2]) } : null
}
