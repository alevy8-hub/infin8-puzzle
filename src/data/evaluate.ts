import type { SymbolId } from '../assets/symbols'
import type { EquationToken } from './puzzles'

type Values = Partial<Record<SymbolId, number>>

/** Numeric value of a term token, or null if unknown/missing. */
function termValue(t: EquationToken, values: Values): number | null {
  if (t.type === 'number') return t.value
  if (t.type === 'symbol') {
    const v = values[t.id]
    return v === undefined ? null : v * (t.count ?? 1)
  }
  return null
}

/**
 * Evaluate an expression (tokens without "= result").
 * precedence=true: × ÷ before + − (correct). false: strictly left to right (common trap).
 * Every ÷ must divide exactly; returns null otherwise.
 */
export function evaluate(tokens: EquationToken[], values: Values, precedence = true): number | null {
  const terms: number[] = []
  const ops: string[] = []
  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i]
    if (i % 2 === 0) {
      const v = termValue(t, values)
      if (v === null) return null
      terms.push(v)
    } else {
      if (t.type !== 'op' || t.value === '=') return null
      ops.push(t.value)
    }
  }
  const apply = (a: number, op: string, b: number): number | null => {
    if (op === '+') return a + b
    if (op === '−') return a - b
    if (op === '×') return a * b
    if (b === 0 || a % b !== 0) return null
    return a / b
  }
  if (!precedence) {
    let acc = terms[0]
    for (let i = 0; i < ops.length; i += 1) {
      const r = apply(acc, ops[i], terms[i + 1])
      if (r === null) return null
      acc = r
    }
    return acc
  }
  // pass 1: × ÷
  const t2: number[] = [terms[0]]
  const o2: string[] = []
  for (let i = 0; i < ops.length; i += 1) {
    if (ops[i] === '×' || ops[i] === '÷') {
      const r = apply(t2[t2.length - 1], ops[i], terms[i + 1])
      if (r === null) return null
      t2[t2.length - 1] = r
    } else {
      o2.push(ops[i])
      t2.push(terms[i + 1])
    }
  }
  let acc = t2[0]
  for (let i = 0; i < o2.length; i += 1) acc = apply(acc, o2[i], t2[i + 1]) as number
  return acc
}

/** Split a row into [left tokens, right token] at "=". */
export function splitRow(tokens: EquationToken[]): [EquationToken[], EquationToken] {
  const eq = tokens.findIndex((t) => t.type === 'op' && t.value === '=')
  return [tokens.slice(0, eq), tokens[eq + 1]]
}
