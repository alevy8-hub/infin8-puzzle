import { useEffect, useState, type CSSProperties } from 'react'
import { symbolBox } from '../assets/symbolSize'
import type { EquationRow, EquationToken, Puzzle } from '../data/puzzles'
import { Symbol } from './Symbol'
import './PuzzleBoard.css'

type PuzzleBoardProps = {
  puzzle: Puzzle
}

type Layout = {
  unit: number
  dense: boolean
  /** gap between copies inside a group box, and the box's inner padding */
  groupGap: number
  groupPad: number
}

const BORDER = 1

function groupMetrics(unit: number) {
  return { groupGap: Math.max(3, Math.round(unit * 0.1)), groupPad: Math.max(3, Math.round(unit * 0.12)) }
}

function TokenView({ token, layout }: { token: EquationToken; layout: Layout }) {
  switch (token.type) {
    case 'symbol': {
      const count = token.count ?? 1
      if (count === 1) return <Symbol id={token.id} unit={layout.unit} />
      return (
        <span
          className="in8-group"
          style={{ gap: `${layout.groupGap}px`, padding: `${layout.groupPad}px` }}
          aria-label={`${count} × ${token.id.replace(/-/g, ' ')}`}
        >
          {Array.from({ length: count }, (_, i) => (
            <Symbol key={i} id={token.id} unit={layout.unit} />
          ))}
        </span>
      )
    }
    case 'op':
      return <span className="in8-op">{token.value}</span>
    case 'number':
      return <span className="in8-num">{token.value}</span>
    case 'unknown':
      return <span className="in8-unknown">?</span>
  }
}

function EquationRowView({ row, highlight, layout }: { row: EquationRow; highlight?: boolean; layout: Layout }) {
  return (
    <div className={`in8-eq-row${highlight ? ' in8-eq-row--final' : ''}`}>
      {row.tokens.map((token, i) => (
        <TokenView key={i} token={token} layout={layout} />
      ))}
    </div>
  )
}

/** Width a row needs at row unit `unit` (dense = tighter gaps and smaller ops). */
function rowWidth(row: EquationRow, unit: number, dense: boolean): number {
  const op = dense ? 13 : 18
  const digit = dense ? 13 : 15
  const gap = dense ? 5 : 7.5
  const { groupGap, groupPad } = groupMetrics(unit)
  let w = (row.tokens.length - 1) * gap
  for (const t of row.tokens) {
    if (t.type === 'symbol') {
      const n = t.count ?? 1
      const sw = symbolBox(t.id, unit).w
      w += n === 1 ? sw : n * sw + (n - 1) * groupGap + 2 * groupPad + 2 * BORDER
    } else if (t.type === 'number') w += String(t.value).length * digit + 2
    else if (t.type === 'unknown') w += dense ? 18 : 28
    else w += op
  }
  return w
}

/** One row unit for the whole board: the largest that keeps every row on one line. */
function boardLayout(puzzle: Puzzle, available: number): Layout {
  const rows = [...puzzle.rows, puzzle.finalRow]
  const MAX = 52
  if (rows.every((r) => rowWidth(r, MAX, false) <= available)) {
    return { unit: MAX, dense: false, ...groupMetrics(MAX) }
  }
  let unit = MAX - 1
  while (unit > 24 && rows.some((r) => rowWidth(r, unit, true) > available)) unit -= 1
  return { unit, dense: true, ...groupMetrics(unit) }
}

/** Space for a row inside the board: viewport minus app padding (2×16) and board padding (2×11.2). */
function availableWidth(): number {
  if (typeof window === 'undefined') return 298
  return Math.min(window.innerWidth, 472) - 58
}

function useAvailableWidth(): number {
  const [w, setW] = useState(availableWidth)
  useEffect(() => {
    const on = () => setW(availableWidth())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return w
}

export function PuzzleBoard({ puzzle }: PuzzleBoardProps) {
  const available = useAvailableWidth()
  const layout = boardLayout(puzzle, available)
  const style = { '--in8-unit': `${layout.unit}px` } as CSSProperties
  return (
    <div
      className={`in8-board${layout.dense ? ' in8-board--dense' : ''}`}
      style={style}
      aria-label={`${puzzle.title} equations`}
    >
      {puzzle.rows.map((row, i) => (
        <EquationRowView key={i} row={row} layout={layout} />
      ))}
      <div className="in8-board-divider" aria-hidden />
      <EquationRowView row={puzzle.finalRow} highlight layout={layout} />
    </div>
  )
}
