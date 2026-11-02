import type { Puzzle } from '../data/puzzles'
import { Symbol } from './Symbol'
import './Feedback.css'

export type FeedbackState = 'idle' | 'correct' | 'incorrect'

type FeedbackProps = {
  state: FeedbackState
  puzzle: Puzzle
  onTryAgain?: () => void
}

export function Feedback({ state, puzzle, onTryAgain }: FeedbackProps) {
  if (state === 'idle') return null

  if (state === 'correct') {
    return (
      <div className="in8-feedback in8-feedback--correct" role="status">
        <p className="in8-feedback-title">Correct</p>
        <ul className="in8-values" aria-label="Symbol values">
          {puzzle.symbolsUsed.map((id) => (
            <li key={id} className="in8-value-chip">
              <Symbol id={id} unit={34} />
              <span className="in8-value-num">= {puzzle.values[id]}</span>
            </li>
          ))}
        </ul>
        <p className="in8-feedback-body">{puzzle.explanation}</p>
      </div>
    )
  }

  return (
    <div className="in8-feedback in8-feedback--incorrect" role="status">
      <p className="in8-feedback-title">Not quite</p>
      <p className="in8-feedback-body">
        Check the clues again — × and ÷ come before + and −.
      </p>
      {onTryAgain ? (
        <button type="button" className="in8-try-again" onClick={onTryAgain}>
          Try again
        </button>
      ) : null}
    </div>
  )
}
