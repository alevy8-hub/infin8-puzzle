import { useMemo, useState } from 'react'
import { AnswerInput } from './components/AnswerInput'
import { Feedback, type FeedbackState } from './components/Feedback'
import { PuzzleBoard } from './components/PuzzleBoard'
import { generatePuzzle, parseCode } from './data/generator'
import { levelById, levels, ROUND_SIZE, roundPuzzle, type LevelId } from './data/levels'
import { loadProgress, saveProgress, type LevelProgress, type Progress } from './data/progress'
import { awardSolve, currentStreak, formatPoints, loadPoints, savePoints, type Award, type PointsState } from './data/points'
import { beginnerPuzzles, type Puzzle } from './data/puzzles'
import { row } from './data/build'
import { randomRoundSeed } from './data/random'
import './App.css'

type Screen = 'start' | 'playing' | 'round-complete' | 'shared'

const SITE_URL = 'https://alevy8-hub.github.io/infin8-puzzle/'

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

/** ?seed=I-482913 (generated) or ?seed=003 (frozen V1 Beginner) */
function sharedFromUrl(): { level: LevelId; puzzle: Puzzle } | null {
  const code = new URLSearchParams(window.location.search).get('seed')
  if (!code) return null
  const v1 = beginnerPuzzles.find((p) => p.id === code.trim())
  if (v1) return { level: 'beginner', puzzle: v1 }
  const parsed = parseCode(code)
  if (!parsed) return null
  try {
    return { level: parsed.level, puzzle: generatePuzzle(parsed.level, parsed.seed) }
  } catch {
    return null
  }
}

/** ?sizecheck — hidden QA board with all 16 symbols at board size (not linked anywhere). */
const SIZE_CHECK: Puzzle | null = new URLSearchParams(window.location.search).has('sizecheck')
  ? {
      id: 'size-check',
      title: 'Size check · all 16',
      prompt: 'Every symbol should read the same size',
      values: {},
      symbolsUsed: [],
      rows: [
        row('a8-winged + infinity + star + technic-turntable = 1'),
        row('electric-guitar + headphones + microphone + crown = 2'),
        row('lion + rampant-lion + anchor + celtic-cross = 3'),
        row('captain + btc-builder + dj + infin8-symbol = 4'),
      ],
      finalRow: row('2:headphones + a8-winged × dj = ?'),
      correctAnswer: 1,
      choices: [],
      explanation: '',
    }
  : null

function clearSeedFromUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete('seed')
  window.history.replaceState(null, '', url.toString())
}

function isUnlocked(progress: Progress, index: number): boolean {
  return index === 0 || progress[levels[index - 1].id].roundsCleared > 0
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

function levelStatus(p: LevelProgress, unlocked: boolean, prevName?: string): string {
  if (!unlocked) return `Locked · clear ${prevName && /^[AEIOU]/.test(prevName) ? 'an' : 'a'} ${prevName} round`
  if (p.round) return `Continue · Round ${p.round.number} · ${p.round.index}/${ROUND_SIZE}`
  if (p.roundsCleared > 0) {
    const best = p.bestScore === null ? '' : ` · best ${p.bestScore}/${ROUND_SIZE}`
    return `${p.roundsCleared} round${p.roundsCleared === 1 ? '' : 's'} cleared${best}`
  }
  return `Start · ${ROUND_SIZE} puzzles per round`
}

function PointsRow({ points }: { points: PointsState }) {
  const streak = currentStreak(points)
  return (
    <p className="in8-points-row">
      <span className="in8-points-total">{formatPoints(points.total)} pts</span>
      <span className="in8-points-sep"> · </span>
      {streak > 0 ? `${streak}-day streak` : 'Solve one today to start a streak'}
    </p>
  )
}

function App() {
  const [shared] = useState(sharedFromUrl)
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [screen, setScreen] = useState<Screen>(shared ? 'shared' : 'start')
  const [levelId, setLevelId] = useState<LevelId>(shared?.level ?? 'beginner')
  const level = levelById(levelId)
  const lp = progress[levelId]
  const round = lp.round

  // index of the puzzle on screen (kept separately so a solved puzzle stays visible)
  const [viewIndex, setViewIndex] = useState(0)
  // the round on screen (kept after the last solve, when progress.round is already cleared)
  const [active, setActive] = useState({ number: 0, seed: 0 })
  const roundNumber = active.number
  const roundSeed = active.seed
  const puzzle = useMemo<Puzzle | null>(() => {
    if (screen === 'shared') return shared?.puzzle ?? null
    if (screen !== 'playing' || roundNumber === 0) return null
    return roundPuzzle(levelId, roundNumber, roundSeed, Math.min(viewIndex, ROUND_SIZE - 1))
  }, [screen, shared, levelId, roundNumber, roundSeed, viewIndex])

  const [choices, setChoices] = useState<number[]>(() => (shared ? shuffle(shared.puzzle.choices) : []))
  const [selected, setSelected] = useState<number | null>(null)
  const [customValue, setCustomValue] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  const [points, setPoints] = useState<PointsState>(loadPoints)
  // points from the latest correct answer (null on shared puzzles: no points there)
  const [gain, setGain] = useState<Award | null>(null)

  const update = (id: LevelId, fn: (p: LevelProgress) => LevelProgress) => {
    setProgress((prev) => {
      const next = { ...prev, [id]: fn(prev[id]) }
      saveProgress(next)
      return next
    })
  }

  const showPuzzle = (id: LevelId, number: number, seed: number, index: number) => {
    const multipleChoice = levelById(id).multipleChoice
    const p = roundPuzzle(id, number, seed, index)
    setViewIndex(index)
    setChoices(multipleChoice ? shuffle(p.choices) : [])
    setSelected(null)
    setCustomValue('')
    setFeedback('idle')
    setGain(null)
  }

  const openLevel = (id: LevelId) => {
    const p = progress[id]
    let r = p.round
    if (!r) {
      r = { number: p.roundsCleared + 1, seed: randomRoundSeed(), index: 0, misses: 0, firstTry: 0, missedCurrent: false }
      const newRound = r
      update(id, (old) => ({ ...old, round: newRound }))
    }
    setLevelId(id)
    setActive({ number: r.number, seed: r.seed })
    showPuzzle(id, r.number, r.seed, r.index)
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
    if (answer === null || feedback === 'correct' || !puzzle) return
    const correct = answer === puzzle.correctAnswer
    setFeedback(correct ? 'correct' : 'incorrect')
    if (screen === 'shared' || !round) return
    let award: Award | null = null
    if (correct) {
      const result = awardSolve(points, levelId, !round.missedCurrent, round.index + 1 >= ROUND_SIZE)
      award = result.award
      savePoints(result.next)
      setPoints(result.next)
      setGain(award)
    }
    const earned = award?.total ?? 0
    update(levelId, (old) => {
      const r = old.round
      if (!r) return old
      if (!correct) return { ...old, round: { ...r, misses: r.misses + 1, missedCurrent: true } }
      const firstTry = r.firstTry + (r.missedCurrent ? 0 : 1)
      const index = r.index + 1
      const roundPoints = (r.points ?? 0) + earned
      if (index >= ROUND_SIZE) {
        return {
          roundsCleared: old.roundsCleared + 1,
          bestScore: Math.max(old.bestScore ?? 0, firstTry),
          round: null,
          lastRound: { number: r.number, firstTry, misses: r.misses, points: roundPoints },
        }
      }
      return { ...old, round: { ...r, index, firstTry, missedCurrent: false, points: roundPoints } }
    })
  }

  const handleNext = () => {
    if (!round) setScreen('round-complete')
    else showPuzzle(levelId, round.number, round.seed, round.index)
    window.scrollTo(0, 0)
  }

  const goHome = () => {
    if (screen === 'shared') clearSeedFromUrl()
    setScreen('start')
    setFeedback('idle')
    window.scrollTo(0, 0)
  }

  if (SIZE_CHECK) {
    return (
      <div className="in8-app">
        <header className="in8-header">
          <Brand />
          <h1 className="in8-title">{SIZE_CHECK.title}</h1>
          <p className="in8-prompt">{SIZE_CHECK.prompt}</p>
        </header>
        <main className="in8-main">
          <PuzzleBoard puzzle={SIZE_CHECK} />
        </main>
      </div>
    )
  }

  if (screen === 'start') {
    return (
      <div className="in8-app">
        <header className="in8-header in8-header-start">
          <Brand />
          <p className="in8-series">Puzzle Series</p>
          <PointsRow points={points} />
          <p className="in8-pick">Choose your level · new puzzles every round</p>
          <ul className="in8-sections">
            {levels.map((l, i) => {
              const p = progress[l.id]
              const unlocked = isUnlocked(progress, i)
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    className={`in8-section-btn${unlocked ? '' : ' in8-section-btn--locked'}`}
                    disabled={!unlocked}
                    onClick={() => openLevel(l.id)}
                  >
                    <span className="in8-section-name">
                      {unlocked ? '' : '🔒 '}
                      {l.name}
                    </span>
                    <span className="in8-section-blurb">{l.blurb}</span>
                    <span className="in8-section-status">{levelStatus(p, unlocked, levels[i - 1]?.name)}</span>
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

  if (screen === 'round-complete') {
    const last = lp.lastRound ?? { number: lp.roundsCleared, firstTry: 0, misses: 0 }
    const levelIndex = levels.findIndex((l) => l.id === levelId)
    const next = levels[levelIndex + 1]
    const shareText = `I cleared iNFiN8 Puzzles: ${level.name} · Round ${last.number} · ${last.firstTry}/${ROUND_SIZE} first try. Can you? ${SITE_URL}`
    const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(shareText)}`
    return (
      <div className="in8-app">
        <header className="in8-header in8-header-start">
          <Brand />
          <p className="in8-complete-kicker">Round {last.number} complete</p>
          <h1 className="in8-complete-title">{level.name}</h1>
          <div className="in8-score">
            <div className="in8-score-item">
              <span className="in8-score-num">
                {last.firstTry}/{ROUND_SIZE}
              </span>
              <span className="in8-score-label">First try</span>
            </div>
            <div className="in8-score-item">
              <span className="in8-score-num">{last.misses}</span>
              <span className="in8-score-label">{last.misses === 1 ? 'Miss' : 'Misses'}</span>
            </div>
          </div>
          <p className="in8-round-points">
            +{formatPoints(last.points ?? 0)} pts this round
            <span className="in8-round-points-total"> · {formatPoints(points.total)} total</span>
          </p>
          <p className="in8-best">
            Best {lp.bestScore ?? last.firstTry}/{ROUND_SIZE} · {lp.roundsCleared} round
            {lp.roundsCleared === 1 ? '' : 's'} cleared
          </p>
          <div className="in8-complete-actions">
            <a className="in8-submit in8-share" href={shareUrl} target="_blank" rel="noopener noreferrer">
              Share on 𝕏
            </a>
            <button type="button" className="in8-progress-btn" onClick={() => openLevel(levelId)}>
              Next round
            </button>
            {next ? (
              <button type="button" className="in8-progress-btn" onClick={() => openLevel(next.id)}>
                Next level: {next.name}
              </button>
            ) : null}
            <button type="button" className="in8-link-btn" onClick={goHome}>
              All levels
            </button>
          </div>
        </header>
        <Footer />
      </div>
    )
  }

  if (!puzzle) return null
  const locked = feedback === 'correct'
  const isShared = screen === 'shared'
  const isLast = viewIndex >= ROUND_SIZE - 1
  const progressLabel = isShared
    ? level.name.toUpperCase()
    : `PUZZLE ${viewIndex + 1} OF ${ROUND_SIZE} · ${level.name.toUpperCase()} · ROUND ${roundNumber}`
  // friendly running count instead of the internal seed code (code stays in share links)
  const inf = <span className="in8-inf">∞</span>
  const displayTitle = isShared ? (
    <>iNFiN8 Puzzle {inf}</>
  ) : (
    <>
      iNFiN8 Puzzle {(roundNumber - 1) * ROUND_SIZE + viewIndex + 1}/{inf}
    </>
  )

  return (
    <div className="in8-app">
      <header className="in8-header">
        <div className="in8-topbar">
          <button type="button" className="in8-back" onClick={goHome} aria-label="Back to levels">
            ‹ Levels
          </button>
        </div>
        <Brand />
        <p className="in8-progress-indicator">{progressLabel}</p>
        <h1 className="in8-title">{displayTitle}</h1>
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
          gain={gain}
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
            {isShared ? (
              <button type="button" className="in8-progress-btn" onClick={goHome}>
                Play iNFiN8 Puzzles
              </button>
            ) : (
              <button type="button" className="in8-progress-btn" onClick={handleNext}>
                {isLast ? 'Finish round' : 'Next puzzle'}
              </button>
            )}
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}

export default App
