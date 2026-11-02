import { generatePuzzle, LEVEL_SPECS, type LevelId } from './generator'
import { beginnerPuzzles, type Puzzle } from './puzzles'
import { puzzleSeed } from './random'

export type { LevelId }

export const ROUND_SIZE = 8

export type Level = {
  id: LevelId
  name: string
  blurb: string
  multipleChoice: boolean
}

export const levels: Level[] = [
  { id: 'beginner', name: 'Beginner', blurb: 'Quick wins · small numbers · + and ×', multipleChoice: true },
  { id: 'intermediate', name: 'Intermediate', blurb: 'Mixed + − × ÷ · pairs', multipleChoice: true },
  { id: 'advanced', name: 'Advanced', blurb: 'One trap per puzzle · type your answer', multipleChoice: false },
]

export const levelById = (id: LevelId) => levels.find((l) => l.id === id) as Level

/** Beginner round 1 is DJ's frozen V1 set; every other round is generated from its seed. */
export function roundPuzzle(level: LevelId, roundNumber: number, roundSeed: number, k: number): Puzzle {
  if (level === 'beginner' && roundNumber === 1) return beginnerPuzzles[k]
  return generatePuzzle(level, puzzleSeed(roundSeed, k))
}

export const levelLetter = (id: LevelId) => LEVEL_SPECS[id].letter
