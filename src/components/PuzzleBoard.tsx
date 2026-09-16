import type { EquationRow, EquationToken, Puzzle } from '../data/puzzles'
import { Symbol } from './Symbol'
import './PuzzleBoard.css'

type PuzzleBoardProps = {
  puzzle: Puzzle
}

function TokenView({ token }: { token: EquationToken }) {
  switch (token.type) {
    case 'symbol':
      return <Symbol id={token.id} size="md" />
    case 'op':
      return <span className="in8-op">{token.value}</span>
    case 'number':
      return <span className="in8-num">{token.value}</span>
    case 'unknown':
      return <span className="in8-unknown">?</span>
  }
}

function EquationRowView({
  row,
  highlight,
}: {
  row: EquationRow
  highlight?: boolean
}) {
  return (
    <div className={`in8-eq-row${highlight ? ' in8-eq-row--final' : ''}`}>
      {row.tokens.map((token, i) => (
        <TokenView key={i} token={token} />
      ))}
    </div>
  )
}

export function PuzzleBoard({ puzzle }: PuzzleBoardProps) {
  return (
    <div className="in8-board" aria-label={`${puzzle.title} equations`}>
      {puzzle.rows.map((row, i) => (
        <EquationRowView key={i} row={row} />
      ))}
      <div className="in8-board-divider" aria-hidden />
      <EquationRowView row={puzzle.finalRow} highlight />
    </div>
  )
}
