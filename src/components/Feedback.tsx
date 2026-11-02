import type { Award } from '../data/points'
import type { Puzzle } from '../data/puzzles'
import { Symbol } from './Symbol'
import './Feedback.css'

export type FeedbackState = 'idle' | 'correct' | 'incorrect'

type FeedbackProps = {
  state: FeedbackState
  puzzle: Puzzle
  /** points earned for this solve (omitted on shared puzzles) */
  gain?: Award | null
  onTryAgain?: () => void
}

function PointsGain({ gain }: { gain: Award }) {
  const parts: string[] = []
  if (gain.firstTryBonus > 0) parts.push(`first try +${gain.firstTryBonus}`)
  if (gain.streakBonus > 0) parts.push(`day ${gain.streakDay} streak +${gain.streakBonus}`)
  if (gain.roundBonus > 0) parts.push(`round clear +${gain.roundBonus}`)
  return (
    <p className="in8-feedback-gain">
      <span className="in8-feedback-gain-num">+{gain.total} pts</span>
      {parts.length ? <span className="in8-feedback-gain-detail"> · {parts.join(' · ')}</span> : null}
    </p>
  )
}

export function Feedback({ state, puzzle, gain, onTryAgain }: FeedbackProps) {
  if (state === 'idle') return null

  if (state === 'correct') {
    return (
      <div className="in8-feedback in8-feedback--correct" role="status">
        <p className="in8-feedback-title">Correct</p>
        {gain ? <PointsGain gain={gain} /> : null}
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
