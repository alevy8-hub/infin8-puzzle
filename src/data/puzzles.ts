import type { SymbolId } from '../assets/symbols'

export type Operator = '+' | '×' | '−' | '÷' | '='

export type EquationToken =
  /** count > 1 renders a group (e.g. a pair) worth count × the symbol's value */
  | { type: 'symbol'; id: SymbolId; count?: number }
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
  /** Key step shown on Correct (symbol values are shown separately) */
  explanation: string
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
  explanation: 'Multiply first: 5 × 3 = 15, then 8 + 15 = 23.',
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
  explanation: 'Multiply first: 5 × 4 = 20, then 7 + 20 = 27.',
}

export const puzzle003: Puzzle = {
  id: '003',
  title: 'iNFiN8 Puzzle // 003',
  prompt: 'Can you solve it?',
  values: {
    crown: 9,
    'electric-guitar': 4,
    'technic-turntable': 2,
  },
  symbolsUsed: ['crown', 'electric-guitar', 'technic-turntable'],
  rows: [
    {
      tokens: [
        { type: 'symbol', id: 'crown' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'crown' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'crown' },
        { type: 'op', value: '=' },
        { type: 'number', value: 27 },
      ],
    },
    {
      tokens: [
        { type: 'symbol', id: 'crown' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'electric-guitar' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'electric-guitar' },
        { type: 'op', value: '=' },
        { type: 'number', value: 17 },
      ],
    },
    {
      tokens: [
        { type: 'symbol', id: 'electric-guitar' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'technic-turntable' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'technic-turntable' },
        { type: 'op', value: '=' },
        { type: 'number', value: 8 },
      ],
    },
  ],
  finalRow: {
    tokens: [
      { type: 'symbol', id: 'crown' },
      { type: 'op', value: '−' },
      { type: 'symbol', id: 'electric-guitar' },
      { type: 'op', value: '+' },
      { type: 'symbol', id: 'technic-turntable' },
      { type: 'op', value: '=' },
      { type: 'unknown' },
    ],
  },
  correctAnswer: 7,
  choices: [3, 7, 11, 15],
  explanation: 'Only − and +, so go left to right: 9 − 4 = 5, then 5 + 2 = 7.',
}

export const puzzle004: Puzzle = {
  id: '004',
  title: 'iNFiN8 Puzzle // 004',
  prompt: 'Can you solve it?',
  values: {
    'rampant-lion': 6,
    'a8-winged': 3,
    'celtic-cross': 2,
  },
  symbolsUsed: ['rampant-lion', 'a8-winged', 'celtic-cross'],
  rows: [
    {
      tokens: [
        { type: 'symbol', id: 'rampant-lion' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'rampant-lion' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'rampant-lion' },
        { type: 'op', value: '=' },
        { type: 'number', value: 18 },
      ],
    },
    {
      tokens: [
        { type: 'symbol', id: 'rampant-lion' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'a8-winged' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'a8-winged' },
        { type: 'op', value: '=' },
        { type: 'number', value: 12 },
      ],
    },
    {
      tokens: [
        { type: 'symbol', id: 'a8-winged' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'celtic-cross' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'celtic-cross' },
        { type: 'op', value: '=' },
        { type: 'number', value: 7 },
      ],
    },
  ],
  finalRow: {
    tokens: [
      { type: 'symbol', id: 'rampant-lion' },
      { type: 'op', value: '×' },
      { type: 'symbol', id: 'celtic-cross' },
      { type: 'op', value: '−' },
      { type: 'symbol', id: 'a8-winged' },
      { type: 'op', value: '=' },
      { type: 'unknown' },
    ],
  },
  correctAnswer: 9,
  choices: [6, 9, 12, 15],
  explanation: 'Multiply first: 6 × 2 = 12, then 12 − 3 = 9.',
}

export const puzzle005: Puzzle = {
  id: '005',
  title: 'iNFiN8 Puzzle // 005',
  prompt: 'Can you solve it?',
  values: {
    captain: 8,
    'btc-builder': 5,
    dj: 4,
  },
  symbolsUsed: ['captain', 'btc-builder', 'dj'],
  rows: [
    {
      tokens: [
        { type: 'symbol', id: 'captain' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'captain' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'captain' },
        { type: 'op', value: '=' },
        { type: 'number', value: 24 },
      ],
    },
    {
      tokens: [
        { type: 'symbol', id: 'captain' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'btc-builder' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'btc-builder' },
        { type: 'op', value: '=' },
        { type: 'number', value: 18 },
      ],
    },
    {
      tokens: [
        { type: 'symbol', id: 'btc-builder' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'dj' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'dj' },
        { type: 'op', value: '=' },
        { type: 'number', value: 13 },
      ],
    },
  ],
  finalRow: {
    tokens: [
      { type: 'symbol', id: 'captain' },
      { type: 'op', value: '+' },
      { type: 'symbol', id: 'btc-builder' },
      { type: 'op', value: '×' },
      { type: 'symbol', id: 'dj' },
      { type: 'op', value: '=' },
      { type: 'unknown' },
    ],
  },
  correctAnswer: 28,
  choices: [52, 28, 17, 36],
  explanation: 'Multiply first: 5 × 4 = 20, then 8 + 20 = 28.',
}

export const puzzle006: Puzzle = {
  id: '006',
  title: 'iNFiN8 Puzzle // 006',
  prompt: 'Can you solve it?',
  values: {
    'infin8-symbol': 12,
    headphones: 4,
    star: 2,
  },
  symbolsUsed: ['infin8-symbol', 'headphones', 'star'],
  rows: [
    {
      tokens: [
        { type: 'symbol', id: 'infin8-symbol' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'infin8-symbol' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'infin8-symbol' },
        { type: 'op', value: '=' },
        { type: 'number', value: 36 },
      ],
    },
    {
      tokens: [
        { type: 'symbol', id: 'infin8-symbol' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'headphones' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'headphones' },
        { type: 'op', value: '=' },
        { type: 'number', value: 20 },
      ],
    },
    {
      tokens: [
        { type: 'symbol', id: 'headphones' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'star' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'star' },
        { type: 'op', value: '=' },
        { type: 'number', value: 8 },
      ],
    },
  ],
  finalRow: {
    tokens: [
      { type: 'symbol', id: 'infin8-symbol' },
      { type: 'op', value: '÷' },
      { type: 'symbol', id: 'headphones' },
      { type: 'op', value: '+' },
      { type: 'symbol', id: 'star' },
      { type: 'op', value: '=' },
      { type: 'unknown' },
    ],
  },
  correctAnswer: 5,
  choices: [5, 8, 14, 6],
  explanation: 'Divide first: 12 ÷ 4 = 3, then 3 + 2 = 5.',
}

export const puzzle007: Puzzle = {
  id: '007',
  title: 'iNFiN8 Puzzle // 007',
  prompt: 'Can you solve it?',
  values: {
    lion: 9,
    'technic-turntable': 3,
    microphone: 6,
  },
  symbolsUsed: ['lion', 'technic-turntable', 'microphone'],
  rows: [
    {
      tokens: [
        { type: 'symbol', id: 'lion' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'lion' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'lion' },
        { type: 'op', value: '=' },
        { type: 'number', value: 27 },
      ],
    },
    {
      tokens: [
        { type: 'symbol', id: 'lion' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'technic-turntable' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'technic-turntable' },
        { type: 'op', value: '=' },
        { type: 'number', value: 15 },
      ],
    },
    {
      tokens: [
        { type: 'symbol', id: 'technic-turntable' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'microphone' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'microphone' },
        { type: 'op', value: '=' },
        { type: 'number', value: 15 },
      ],
    },
  ],
  finalRow: {
    tokens: [
      { type: 'symbol', id: 'lion' },
      { type: 'op', value: '−' },
      { type: 'symbol', id: 'technic-turntable' },
      { type: 'op', value: '+' },
      { type: 'symbol', id: 'microphone' },
      { type: 'op', value: '=' },
      { type: 'unknown' },
    ],
  },
  correctAnswer: 12,
  choices: [0, 6, 12, 18],
  explanation: 'Only − and +, so go left to right: 9 − 3 = 6, then 6 + 6 = 12.',
}

export const puzzle008: Puzzle = {
  id: '008',
  title: 'iNFiN8 Puzzle // 008',
  prompt: 'Can you solve it?',
  values: {
    infinity: 10,
    crown: 6,
    anchor: 4,
  },
  symbolsUsed: ['infinity', 'crown', 'anchor'],
  rows: [
    {
      tokens: [
        { type: 'symbol', id: 'infinity' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'infinity' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'infinity' },
        { type: 'op', value: '=' },
        { type: 'number', value: 30 },
      ],
    },
    {
      tokens: [
        { type: 'symbol', id: 'infinity' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'crown' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'crown' },
        { type: 'op', value: '=' },
        { type: 'number', value: 22 },
      ],
    },
    {
      tokens: [
        { type: 'symbol', id: 'crown' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'anchor' },
        { type: 'op', value: '+' },
        { type: 'symbol', id: 'anchor' },
        { type: 'op', value: '=' },
        { type: 'number', value: 14 },
      ],
    },
  ],
  finalRow: {
    tokens: [
      { type: 'symbol', id: 'infinity' },
      { type: 'op', value: '+' },
      { type: 'symbol', id: 'crown' },
      { type: 'op', value: '×' },
      { type: 'symbol', id: 'anchor' },
      { type: 'op', value: '=' },
      { type: 'unknown' },
    ],
  },
  correctAnswer: 34,
  choices: [64, 40, 34, 28],
  explanation: 'Multiply first: 6 × 4 = 24, then 10 + 24 = 34.',
}

export const beginnerPuzzles: Puzzle[] = [
  puzzle001,
  puzzle002,
  puzzle003,
  puzzle004,
  puzzle005,
  puzzle006,
  puzzle007,
  puzzle008,
]
