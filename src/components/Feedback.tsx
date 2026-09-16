import './Feedback.css'

export type FeedbackState = 'idle' | 'correct' | 'incorrect'

type FeedbackProps = {
  state: FeedbackState
  correctAnswer: number
  onTryAgain?: () => void
}

export function Feedback({ state, correctAnswer, onTryAgain }: FeedbackProps) {
  if (state === 'idle') return null

  if (state === 'correct') {
    return (
      <div className="in8-feedback in8-feedback--correct" role="status">
        <p className="in8-feedback-title">Correct</p>
        <p className="in8-feedback-body">
          Order of operations: multiply before add. Answer is {correctAnswer}.
        </p>
      </div>
    )
  }

  return (
    <div className="in8-feedback in8-feedback--incorrect" role="status">
      <p className="in8-feedback-title">Not quite</p>
      <p className="in8-feedback-body">
        Check the clues again — and remember × before +.
      </p>
      {onTryAgain ? (
        <button type="button" className="in8-try-again" onClick={onTryAgain}>
          Try again
        </button>
      ) : null}
    </div>
  )
}
