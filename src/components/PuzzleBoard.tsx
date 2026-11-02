import type { CSSProperties } from 'react'
import type { EquationRow, EquationToken, Puzzle } from '../data/puzzles'
import { Symbol } from './Symbol'
import './PuzzleBoard.css'

type PuzzleBoardProps = {
  puzzle: Puzzle
}

const GROUP_OVERLAP = 0.2

function TokenView({ token }: { token: EquationToken }) {
  switch (token.type) {
    case 'symbol': {
      const count = token.count ?? 1
      if (count === 1) return <Symbol id={token.id} size="md" />
      return (
        <span className="in8-group" aria-label={`${count} × ${token.id.replace(/-/g, ' ')}`}>
          {Array.from({ length: count }, (_, i) => (
            <Symbol key={i} id={token.id} size="md" />
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

function EquationRowView({ row, highlight }: { row: EquationRow; highlight?: boolean }) {
  return (
    <div className={`in8-eq-row${highlight ? ' in8-eq-row--final' : ''}`}>
      {row.tokens.map((token, i) => (
        <TokenView key={i} token={token} />
      ))}
    </div>
  )
}

/** Width a row needs at symbol size `sym` (dense = tighter gaps and smaller ops). */
function rowWidth(row: EquationRow, sym: number, dense: boolean): number {
  const op = dense ? 13 : 18
  const digit = dense ? 13 : 15
  const gap = dense ? 5 : 7.5
  let w = (row.tokens.length - 1) * gap
  for (const t of row.tokens) {
    if (t.type === 'symbol') {
      const n = t.count ?? 1
      w += sym * (1 + (1 - GROUP_OVERLAP) * (n - 1)) + (n > 1 ? 10 : 0)
    } else if (t.type === 'number') w += String(t.value).length * digit + 2
    else if (t.type === 'unknown') w += dense ? 18 : 28
    else w += op
  }
  return w
}

/** Pick one symbol size for the whole board so the longest row fits a 360px phone. */
function boardLayout(puzzle: Puzzle): { sym: number; dense: boolean } {
  const AVAILABLE = 298
  const rows = [...puzzle.rows, puzzle.finalRow]
  if (rows.every((r) => rowWidth(r, 48, false) <= AVAILABLE)) return { sym: 48, dense: false }
  let sym = 47
  while (sym > 24 && rows.some((r) => rowWidth(r, sym, true) > AVAILABLE)) sym -= 1
  return { sym, dense: true }
}

export function PuzzleBoard({ puzzle }: PuzzleBoardProps) {
  const { sym, dense } = boardLayout(puzzle)
  const style = { '--in8-sym': `${sym}px` } as CSSProperties
  return (
    <div
      className={`in8-board${dense ? ' in8-board--dense' : ''}`}
      style={style}
      aria-label={`${puzzle.title} equations`}
    >
      {puzzle.rows.map((row, i) => (
        <EquationRowView key={i} row={row} />
      ))}
      <div className="in8-board-divider" aria-hidden />
      <EquationRowView row={puzzle.finalRow} highlight />
    </div>
  )
}
