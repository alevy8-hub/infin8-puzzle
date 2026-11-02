import type { SymbolId } from '../assets/symbols'
import type { EquationRow, EquationToken, Operator, Puzzle } from './puzzles'

const OPS: Operator[] = ['+', '−', '×', '÷', '=']

/**
 * Parse a compact row like "2:headphones + dj × star = 42" or "crown − dj = ?".
 * "2:id" is a group (pair) of the symbol, worth 2 × its value.
 */
export function row(src: string): EquationRow {
  const tokens: EquationToken[] = src
    .trim()
    .split(/\s+/)
    .map((t): EquationToken => {
      if ((OPS as string[]).includes(t)) return { type: 'op', value: t as Operator }
      if (t === '?') return { type: 'unknown' }
      if (/^\d+$/.test(t)) return { type: 'number', value: Number(t) }
      const m = /^(\d+):(.+)$/.exec(t)
      if (m) return { type: 'symbol', id: m[2] as SymbolId, count: Number(m[1]) }
      return { type: 'symbol', id: t as SymbolId }
    })
  return { tokens }
}

type Def = {
  id: string
  values: Partial<Record<SymbolId, number>>
  clues: string[]
  final: string
  answer: number
  choices: number[]
  explanation: string
}

export function makePuzzle(d: Def): Puzzle {
  return {
    id: d.id,
    title: `iNFiN8 Puzzle // ${d.id}`,
    prompt: 'Can you solve it?',
    values: d.values,
    symbolsUsed: Object.keys(d.values) as SymbolId[],
    rows: d.clues.map(row),
    finalRow: row(d.final),
    correctAnswer: d.answer,
    choices: d.choices,
    explanation: d.explanation,
  }
}
