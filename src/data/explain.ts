import { splitRow } from './evaluate'
import type { EquationRow, Puzzle } from './puzzles'
import { SYMBOL_NAMES } from './symbolNames'

/** "A pair of Headphones = 2 × 6 = 12." for every group shown anywhere in the puzzle. */
export function groupNotes(p: Pick<Puzzle, 'rows' | 'finalRow' | 'values'>): string[] {
  const seen = new Set<string>()
  const notes: string[] = []
  for (const r of [...p.rows, p.finalRow]) {
    for (const t of r.tokens) {
      if (t.type !== 'symbol' || (t.count ?? 1) === 1) continue
      const key = `${t.id}:${t.count}`
      if (seen.has(key)) continue
      seen.add(key)
      const v = p.values[t.id] ?? 0
      const n = t.count as number
      const name = SYMBOL_NAMES[t.id]
      notes.push(
        n === 2
          ? `A pair of ${name} = 2 × ${v} = ${2 * v}.`
          : `A group of ${n} ${name} = ${n} × ${v} = ${n * v}.`,
      )
    }
  }
  return notes
}

/** Step-by-step evaluation of the final line, ending in the answer. */
export function finalSteps(row: EquationRow, values: Puzzle['values']): string {
  const [lhs] = splitRow(row.tokens)
  const terms: number[] = []
  const ops: string[] = []
  lhs.forEach((t, i) => {
    if (i % 2 === 0) {
      if (t.type === 'number') terms.push(t.value)
      else if (t.type === 'symbol') terms.push((values[t.id] ?? 0) * (t.count ?? 1))
    } else if (t.type === 'op') ops.push(t.value)
  })
  // collapse × ÷ chains
  const chains: string[] = []
  const reduced: number[] = []
  const rest: string[] = []
  let i = 0
  let usedMul = false
  let usedDiv = false
  while (i < terms.length) {
    let acc = terms[i]
    let text = `${acc}`
    let j = i
    while (j < ops.length && (ops[j] === '×' || ops[j] === '÷')) {
      const b = terms[j + 1]
      if (ops[j] === '×') {
        acc *= b
        usedMul = true
      } else {
        acc /= b
        usedDiv = true
      }
      text += ` ${ops[j]} ${b}`
      j += 1
    }
    if (j > i) chains.push(`${text} = ${acc}`)
    reduced.push(acc)
    if (j < ops.length) rest.push(ops[j])
    i = j + 1
  }
  let restText = `${reduced[0]}`
  let total = reduced[0]
  rest.forEach((op, k) => {
    const b = reduced[k + 1]
    total = op === '+' ? total + b : total - b
    restText += ` ${op} ${b}`
  })
  restText += ` = ${total}`
  if (chains.length === 0) {
    return rest.every((o) => o === '+')
      ? `Add them up: ${restText}.`
      : `Only + and −, so go left to right: ${restText}.`
  }
  const verb = usedMul && usedDiv ? '× and ÷ first' : usedMul ? 'Multiply first' : 'Divide first'
  if (rest.length === 0) return `${verb}: ${chains.join(', ')}.`
  return `${verb}: ${chains.join(' and ')}, then ${restText}.`
}
