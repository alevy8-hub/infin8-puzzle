import { useState } from 'react'
import { AnswerInput } from './components/AnswerInput'
import { Feedback, type FeedbackState } from './components/Feedback'
import { PuzzleBoard } from './components/PuzzleBoard'
import { puzzles } from './data/puzzles'
import './App.css'

type Screen = 'start' | 'playing' | 'series-complete'

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const puzzle = puzzles[puzzleIndex]
  const [choices, setChoices] = useState(() => shuffle(puzzles[0].choices))
  const [selected, setSelected] = useState<number | null>(null)
  const [customValue, setCustomValue] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState>('idle')

  const resetAnswerState = (nextIndex: number) => {
    const nextPuzzle = puzzles[nextIndex]
    setPuzzleIndex(nextIndex)
    setChoices(shuffle(nextPuzzle.choices))
    setSelected(null)
    setCustomValue('')
    setFeedback('idle')
  }

  const startPuzzle = (index: number) => {
    resetAnswerState(index)
    setScreen('playing')
  }

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
    const isCorrect = answer === puzzle.correctAnswer
    setFeedback(isCorrect ? 'correct' : 'incorrect')
    if (isCorrect && puzzleIndex >= puzzles.length - 1) {
      setScreen('series-complete')
    }
  }

  const handleTryAgain = () => {
    setFeedback('idle')
    setSelected(null)
    setCustomValue('')
  }

  const handleNextPuzzle = () => {
    if (puzzleIndex < puzzles.length - 1) {
      resetAnswerState(puzzleIndex + 1)
    }
  }

  const handlePlayAgain = () => {
    startPuzzle(0)
  }

  const handleStart = () => {
    startPuzzle(0)
  }

  const locked = feedback === 'correct'
  const isLastPuzzle = puzzleIndex >= puzzles.length - 1
  const progressLabel = `Puzzle ${puzzle.id} of ${puzzles.length}`
  const completeLabel = `${puzzles.length} / ${puzzles.length} COMPLETE`

  if (screen === 'start') {
    return (
      <div className="in8-app">
        <header className="in8-header in8-header-start">
          <p className="in8-brand">
            iNFiN<span className="in8-brand-8">8</span>
          </p>
          <p className="in8-tagline">Beyond Limits</p>
          <p className="in8-series">Puzzle Series</p>
          <button type="button" className="in8-progress-btn in8-start-btn" onClick={handleStart}>
            START
          </button>
        </header>

        <footer className="in8-footer">
          <span className="in8-footer-line">Hear / See / Feel</span>
        </footer>
      </div>
    )
  }

  if (screen === 'series-complete') {
    return (
      <div className="in8-app">
        <header className="in8-header in8-header-start">
          <p className="in8-brand">
            iNFiN<span className="in8-brand-8">8</span>
          </p>
          <p className="in8-tagline">Beyond Limits</p>
        </header>

        <main className="in8-main in8-main-complete">
          <Feedback state="correct" correctAnswer={puzzle.correctAnswer} />
          <div className="in8-progress">
            <p className="in8-progress-complete">{completeLabel}</p>
            <button type="button" className="in8-progress-btn" onClick={handlePlayAgain}>
              PLAY AGAIN
            </button>
          </div>
        </main>

        <footer className="in8-footer">
          <span className="in8-footer-line">Hear / See / Feel</span>
        </footer>
      </div>
    )
  }

  return (
    <div className="in8-app">
      <header className="in8-header">
        <p className="in8-brand">
          iNFiN<span className="in8-brand-8">8</span>
        </p>
        <p className="in8-tagline">Beyond Limits</p>
        <p className="in8-progress-indicator">{progressLabel}</p>
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
        {feedback === 'correct' && !isLastPuzzle ? (
          <div className="in8-progress">
            <button type="button" className="in8-progress-btn" onClick={handleNextPuzzle}>
              NEXT PUZZLE
            </button>
          </div>
        ) : null}
      </main>

      <footer className="in8-footer">
        <span className="in8-footer-line">Hear / See / Feel</span>
      </footer>
    </div>
  )
}

export default App
