import { useState } from 'react'
import { AnswerInput } from './components/AnswerInput'
import { Feedback, type FeedbackState } from './components/Feedback'
import { PuzzleBoard } from './components/PuzzleBoard'
import { puzzle001 } from './data/puzzles'
import './App.css'

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function App() {
  const puzzle = puzzle001
  const [choices] = useState(() => shuffle(puzzle.choices))
  const [selected, setSelected] = useState<number | null>(null)
  const [customValue, setCustomValue] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState>('idle')

  const resolvedAnswer = (): number | null => {
    if (customValue.trim() !== '') {
      const n = Number(customValue)
      return Number.isFinite(n) ? n : null
    }
    return selected
  }

  const handleSelectChoice = (value: number) => {
    setSelected(value)
    setCustomValue('')
    setFeedback('idle')
  }

  const handleCustomChange = (value: string) => {
    setCustomValue(value)
    setSelected(null)
    setFeedback('idle')
  }

  const handleSubmit = () => {
    const answer = resolvedAnswer()
    if (answer === null) return
    setFeedback(answer === puzzle.correctAnswer ? 'correct' : 'incorrect')
  }

  const handleTryAgain = () => {
    setFeedback('idle')
    setSelected(null)
    setCustomValue('')
  }

  const locked = feedback === 'correct'

  return (
    <div className="in8-app">
      <header className="in8-header">
        <p className="in8-brand">
          iNFiN<span className="in8-brand-8">8</span>
        </p>
        <p className="in8-tagline">Beyond Limits</p>
        <h1 className="in8-title">{puzzle.title}</h1>
        <p className="in8-prompt">{puzzle.prompt}</p>
      </header>

      <main className="in8-main">
        <PuzzleBoard puzzle={puzzle} />
        <AnswerInput
          choices={choices}
          selected={selected}
          customValue={customValue}
          disabled={locked}
          onSelectChoice={handleSelectChoice}
          onCustomChange={handleCustomChange}
          onSubmit={handleSubmit}
        />
        <Feedback
          state={feedback}
          correctAnswer={puzzle.correctAnswer}
          onTryAgain={feedback === 'incorrect' ? handleTryAgain : undefined}
        />
      </main>

      <footer className="in8-footer">
        <span className="in8-footer-line">Hear / See / Feel</span>
      </footer>
    </div>
  )
}

export default App
