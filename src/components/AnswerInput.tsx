import './AnswerInput.css'

type AnswerInputProps = {
  choices: number[]
  selected: number | null
  customValue: string
  disabled?: boolean
  onSelectChoice: (value: number) => void
  onCustomChange: (value: string) => void
  onSubmit: () => void
}

export function AnswerInput({
  choices,
  selected,
  customValue,
  disabled = false,
  onSelectChoice,
  onCustomChange,
  onSubmit,
}: AnswerInputProps) {
  const canSubmit =
    !disabled && (selected !== null || customValue.trim().length > 0)

  return (
    <div className="in8-answer">
      <p className="in8-answer-label">Your answer</p>
      <div className="in8-choices" role="group" aria-label="Answer choices">
        {choices.map((choice) => {
          const active = selected === choice
          return (
            <button
              key={choice}
              type="button"
              className={`in8-choice${active ? ' in8-choice--active' : ''}`}
              aria-pressed={active}
              disabled={disabled}
              onClick={() => onSelectChoice(choice)}
            >
              {choice}
            </button>
          )
        })}
      </div>

      <div className="in8-custom-row">
        <label className="in8-custom-label" htmlFor="in8-custom-answer">
          Or enter a number
        </label>
        <input
          id="in8-custom-answer"
          className="in8-custom-input"
          type="number"
          inputMode="numeric"
          placeholder="?"
          value={customValue}
          disabled={disabled}
          onChange={(e) => onCustomChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canSubmit) onSubmit()
          }}
        />
      </div>

      <button
        type="button"
        className="in8-submit"
        disabled={!canSubmit}
        onClick={onSubmit}
      >
        Check
      </button>
    </div>
  )
}
