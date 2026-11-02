import { useState } from 'react'
import { AnswerInput } from './components/AnswerInput'
import { Feedback, type FeedbackState } from './components/Feedback'
import { PuzzleBoard } from './components/PuzzleBoard'
import { sections, type Section, type SectionId } from './data/levels'
import { loadProgress, saveProgress, type Progress } from './data/progress'
import './App.css'

type Screen = 'start' | 'playing' | 'section-complete'

const SITE_URL = 'https://alevy8-hub.github.io/infin8-puzzle/'

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function isUnlocked(progress: Progress, index: number): boolean {
  return index === 0 || progress[sections[index - 1].id].cleared
}

function Brand() {
  return (
    <>
      <p className="in8-brand">
        iNFiN<span className="in8-brand-8">8</span>
      </p>
      <p className="in8-tagline">Beyond Limits</p>
    </>
  )
}

function Footer() {
  return (
    <footer className="in8-footer">
      <span className="in8-footer-line">Hear / See / FEEL</span>
    </footer>
  )
}

function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [screen, setScreen] = useState<Screen>('start')
  const [sectionId, setSectionId] = useState<SectionId>('beginner')
  const sectionIndex = sections.findIndex((s) => s.id === sectionId)
  const section: Section = sections[sectionIndex]
  const sp = progress[sectionId]
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const puzzle = section.puzzles[Math.min(puzzleIndex, section.puzzles.length - 1)]

  const [choices, setChoices] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [customValue, setCustomValue] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState>('idle')

  const update = (id: SectionId, patch: Partial<Progress[SectionId]>) => {
    setProgress((prev) => {
      const next = { ...prev, [id]: { ...prev[id], ...patch } }
      saveProgress(next)
      return next
    })
  }

  const resetAnswer = (choiceSource: number[]) => {
    setChoices(shuffle(choiceSource))
    setSelected(null)
    setCustomValue('')
    setFeedback('idle')
  }

  const openSection = (id: SectionId) => {
    const s = sections.find((x) => x.id === id)!
    const p = progress[id]
    // finished runs restart from puzzle 1; unfinished runs resume where they left off
    const restart = p.index >= s.puzzles.length
    if (restart) update(id, { index: 0, misses: 0 })
    const start = restart ? 0 : p.index
    setSectionId(id)
    setPuzzleIndex(start)
    resetAnswer(s.puzzles[start].choices)
    setScreen('playing')
    window.scrollTo(0, 0)
  }

  const resolvedAnswer = (): number | null => {
    if (customValue.trim() !== '') {
      const n = Number(customValue)
      return Number.isFinite(n) ? n : null
    }
    return selected
  }

  const handleSubmit = () => {
    const answer = resolvedAnswer()
    if (answer === null || feedback === 'correct') return
    if (answer === puzzle.correctAnswer) {
      setFeedback('correct')
      const done = puzzleIndex + 1 >= section.puzzles.length
      update(sectionId, {
        index: puzzleIndex + 1,
        ...(done
          ? {
              cleared: true,
              bestMisses: sp.bestMisses === null ? sp.misses : Math.min(sp.bestMisses, sp.misses),
            }
          : {}),
      })
    } else {
      setFeedback('incorrect')
      update(sectionId, { misses: sp.misses + 1 })
    }
  }

  const handleNext = () => {
    const nextIndex = puzzleIndex + 1
    if (nextIndex >= section.puzzles.length) {
      setScreen('section-complete')
    } else {
      setPuzzleIndex(nextIndex)
      resetAnswer(section.puzzles[nextIndex].choices)
    }
    window.scrollTo(0, 0)
  }

  const goHome = () => {
    setScreen('start')
    setFeedback('idle')
    window.scrollTo(0, 0)
  }

  if (screen === 'start') {
    return (
      <div className="in8-app">
        <header className="in8-header in8-header-start">
          <Brand />
          <p className="in8-series">Puzzle Series</p>
          <p className="in8-pick">Choose your level</p>
          <ul className="in8-sections">
            {sections.map((s, i) => {
              const p = progress[s.id]
              const unlocked = isUnlocked(progress, i)
              const inRun = p.index > 0 && p.index < s.puzzles.length
              const status = !unlocked
                ? `Locked · clear ${sections[i - 1].name}`
                : inRun
                  ? `Continue · ${p.index} / ${s.puzzles.length}`
                  : p.cleared
                    ? `Cleared ✓ · play again`
                    : `${s.puzzles.length} puzzles`
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`in8-section-btn${unlocked ? '' : ' in8-section-btn--locked'}${p.cleared ? ' in8-section-btn--cleared' : ''}`}
                    disabled={!unlocked}
                    onClick={() => openSection(s.id)}
                  >
                    <span className="in8-section-name">
                      {unlocked ? '' : '🔒 '}
                      {s.name}
                    </span>
                    <span className="in8-section-blurb">{s.blurb}</span>
                    <span className="in8-section-status">{status}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </header>
        <Footer />
      </div>
    )
  }

  if (screen === 'section-complete') {
    const total = section.puzzles.length
    const next = sections[sectionIndex + 1]
    const shareText = `I cleared iNFiN8 Puzzles: ${section.name} ${total}/${total}. Can you? ${SITE_URL}`
    const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(shareText)}`
    return (
      <div className="in8-app">
        <header className="in8-header in8-header-start">
          <Brand />
          <p className="in8-complete-kicker">Section complete</p>
          <h1 className="in8-complete-title">{section.name}</h1>
          <div className="in8-score">
            <div className="in8-score-item">
              <span className="in8-score-num">
                {total}/{total}
              </span>
              <span className="in8-score-label">Solved</span>
            </div>
            <div className="in8-score-item">
              <span className="in8-score-num">{sp.misses}</span>
              <span className="in8-score-label">{sp.misses === 1 ? 'Miss' : 'Misses'}</span>
            </div>
          </div>
          <div className="in8-complete-actions">
            <a className="in8-submit in8-share" href={shareUrl} target="_blank" rel="noopener noreferrer">
              Share on 𝕏
            </a>
            {next ? (
              <button type="button" className="in8-progress-btn" onClick={() => openSection(next.id)}>
                Next: {next.name}
              </button>
            ) : (
              <p className="in8-progress-complete">All 3 sections cleared</p>
            )}
            <button type="button" className="in8-link-btn" onClick={goHome}>
              All sections
            </button>
          </div>
        </header>
        <Footer />
      </div>
    )
  }

  const locked = feedback === 'correct'
  const isLast = puzzleIndex >= section.puzzles.length - 1
  const progressLabel = `PUZZLE ${puzzleIndex + 1} OF ${section.puzzles.length} · ${section.name.toUpperCase()}`

  return (
    <div className="in8-app">
      <header className="in8-header">
        <div className="in8-topbar">
          <button type="button" className="in8-back" onClick={goHome} aria-label="Back to sections">
            ‹ Sections
          </button>
        </div>
        <Brand />
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
          onSelectChoice={(v) => {
            setSelected(v)
            setCustomValue('')
            setFeedback('idle')
          }}
          onCustomChange={(v) => {
            setCustomValue(v)
            setSelected(null)
            setFeedback('idle')
          }}
          onSubmit={handleSubmit}
        />
        <Feedback
          state={feedback}
          puzzle={puzzle}
          onTryAgain={
            feedback === 'incorrect'
              ? () => {
                  setFeedback('idle')
                  setSelected(null)
                  setCustomValue('')
                }
              : undefined
          }
        />
        {feedback === 'correct' ? (
          <div className="in8-progress">
            <button type="button" className="in8-progress-btn" onClick={handleNext}>
              {isLast ? 'Finish section' : 'Next puzzle'}
            </button>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}

export default App
