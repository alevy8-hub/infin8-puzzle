import type { SymbolId } from '../assets/symbols'

export type Operator = '+' | '×' | '='

export type EquationToken =
  | { type: 'symbol'; id: SymbolId }
  | { type: 'op'; value: Operator }
  | { type: 'number'; value: number }
  | { type: 'unknown' }

export type EquationRow = {
  tokens: EquationToken[]
}

export type Puzzle = {
  id: string
  title: string
  prompt: string
  /** Per-puzzle values only — never stored on symbols themselves */
  values: Partial<Record<SymbolId, number>>
  symbolsUsed: SymbolId[]
  rows: EquationRow[]
  finalRow: EquationRow
  correctAnswer: number
  choices: number[]
}

export const puzzle001: Puzzle = {
  id: '001',
  title: 'iNFiN8 Puzzle // 001',
  prompt: 'Can you solve it?',
  values: {
    infinity: 8,
    star: 5,
    headphones: 3,
  },
  symbolsUsed: ['infinity', 'star', 'headphones'],
  rows: [
    {
      tokens: [
        { type: 'symbol', id: 'infinity' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'infinity' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'infinity' },
        { type: 'op', value: '=' },
        { type: 'number', value: 24 },
      ],
    },
    {
      tokens: [
        { type: 'symbol', id: 'infinity' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'star' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'star' },
        { type: 'op', value: '=' },
        { type: 'number', value: 18 },
      ],
    },
    {
      tokens: [
        { type: 'symbol', id: 'star' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'headphones' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'headphones' },
        { type: 'op', value: '=' },
        { type: 'number', value: 11 },
      ],
    },
  ],
  finalRow: {
    tokens: [
      { type: 'symbol', id: 'infinity' },
      { type: 'op', value: '+' },
      { type: 'symbol', id: 'star' },
      { type: 'op', value: '×' },
      { type: 'symbol', id: 'headphones' },
      { type: 'op', value: '=' },
      { type: 'unknown' },
    ],
  },
  correctAnswer: 23,
  choices: [23, 39, 16, 11],
}

export const puzzle002: Puzzle = {
  id: '002',
  title: 'iNFiN8 Puzzle // 002',
  prompt: 'Can you solve it?',
  values: {
    lion: 7,
    microphone: 5,
    anchor: 4,
  },
  symbolsUsed: ['lion', 'microphone', 'anchor'],
  rows: [
    {
      tokens: [
        { type: 'symbol', id: 'lion' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'lion' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'lion' },
        { type: 'op', value: '=' },
        { type: 'number', value: 21 },
      ],
    },
    {
      tokens: [
        { type: 'symbol', id: 'lion' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'microphone' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'microphone' },
        { type: 'op', value: '=' },
        { type: 'number', value: 17 },
      ],
    },
    {
      tokens: [
        { type: 'symbol', id: 'microphone' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'anchor' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'anchor' },
        { type: 'op', value: '=' },
        { type: 'number', value: 13 },
      ],
    },
  ],
  finalRow: {
    tokens: [
      { type: 'symbol', id: 'lion' },
      { type: 'op', value: '+' },
      { type: 'symbol', id: 'microphone' },
      { type: 'op', value: '×' },
      { type: 'symbol', id: 'anchor' },
      { type: 'op', value: '=' },
      { type: 'unknown' },
    ],
  },
  correctAnswer: 27,
  choices: [48, 27, 33, 24],
}

export const puzzles: Puzzle[] = [puzzle001, puzzle002]

export function getPuzzle(id: string): Puzzle | undefined {
  return puzzles.find((p) => p.id === id)
}
