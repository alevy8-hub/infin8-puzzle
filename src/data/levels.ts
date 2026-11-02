import { makePuzzle } from './build'
import { beginnerPuzzles, type Puzzle } from './puzzles'

/* ----------------------------- INTERMEDIATE ----------------------------- */

export const intermediatePuzzles: Puzzle[] = [
  makePuzzle({
    id: '009',
    values: { crown: 12, captain: 7, anchor: 4 },
    clues: ['crown + crown + crown = 36', 'crown − captain = 5', 'captain × anchor = 28'],
    final: 'crown + captain × anchor = ?',
    answer: 40,
    choices: [40, 76, 23, 88],
    explanation: 'Multiply first: 7 × 4 = 28, then 12 + 28 = 40. (Left to right gives 76, a trap.)',
  }),
  makePuzzle({
    id: '010',
    values: { microphone: 9, star: 6, 'celtic-cross': 3 },
    clues: [
      'microphone + microphone + microphone = 27',
      '2:microphone + star = 24',
      'star ÷ celtic-cross + microphone = 11',
    ],
    final: '2:microphone + star × celtic-cross = ?',
    answer: 36,
    choices: [36, 72, 27, 45],
    explanation: 'Two mics are a pair worth 18. Multiply first: 6 × 3 = 18, then 18 + 18 = 36.',
  }),
  makePuzzle({
    id: '011',
    values: { lion: 15, 'electric-guitar': 8, 'technic-turntable': 6 },
    clues: [
      'lion + lion = 30',
      'lion − electric-guitar + lion = 22',
      'electric-guitar × technic-turntable − lion = 33',
    ],
    final: 'lion + electric-guitar × technic-turntable − electric-guitar = ?',
    answer: 55,
    choices: [55, 130, 63, 21],
    explanation: 'Multiply first: 8 × 6 = 48. Then left to right: 15 + 48 − 8 = 55.',
  }),
  makePuzzle({
    id: '012',
    values: { 'btc-builder': 14, infinity: 7, 'a8-winged': 2 },
    clues: ['btc-builder + infinity = 21', 'btc-builder − infinity = 7', 'infinity × a8-winged = 14'],
    final: 'btc-builder + btc-builder ÷ infinity × a8-winged = ?',
    answer: 18,
    choices: [18, 8, 15, 30],
    explanation: 'Add both clues: 2 × BTC = 28, so BTC = 14. Then ÷ and × left to right: 14 ÷ 7 × 2 = 4, and 14 + 4 = 18.',
  }),
  makePuzzle({
    id: '013',
    values: { 'rampant-lion': 11, 'infin8-symbol': 8, dj: 5 },
    clues: [
      'rampant-lion + rampant-lion + rampant-lion = 33',
      'infin8-symbol × infin8-symbol − rampant-lion = 53',
      'dj + infin8-symbol × dj = 45',
    ],
    final: 'rampant-lion − dj + infin8-symbol × dj = ?',
    answer: 46,
    choices: [46, 70, 56, 14],
    explanation: 'iNFiN8 × iNFiN8 = 64, so iNFiN8 = 8. DJ + 8 × DJ = 9 × DJ = 45, so DJ = 5. Final: 8 × 5 = 40, then 11 − 5 + 40 = 46.',
  }),
  makePuzzle({
    id: '014',
    values: { headphones: 6, 'btc-builder': 10, 'celtic-cross': 3 },
    clues: [
      '2:headphones + 2:headphones = 24',
      'btc-builder + 2:headphones = 22',
      'btc-builder − headphones ÷ celtic-cross = 8',
    ],
    final: '2:headphones + btc-builder × celtic-cross = ?',
    answer: 42,
    choices: [42, 66, 36, 25],
    explanation: 'A pair of headphones is 12, so one is 6. 10 − 6 ÷ 3 = 8 gives Cross = 3. Final: 10 × 3 = 30, then 12 + 30 = 42.',
  }),
  makePuzzle({
    id: '015',
    values: { infinity: 9, lion: 4, microphone: 13 },
    clues: [
      'lion × infinity = 36',
      'infinity + microphone = 22',
      'lion + microphone = 17',
      'microphone − infinity + lion = 8',
    ],
    final: 'microphone + lion × infinity − infinity = ?',
    answer: 40,
    choices: [40, 144, 58, 26],
    explanation: 'Infinity is 5 more than Lion, and Lion × Infinity = 36, so 4 and 9. Final: 4 × 9 = 36, then 13 + 36 − 9 = 40.',
  }),
  makePuzzle({
    id: '016',
    values: { 'electric-guitar': 8, 'a8-winged': 7, anchor: 16 },
    clues: [
      'electric-guitar × electric-guitar = 64',
      '2:a8-winged + electric-guitar = 22',
      'anchor ÷ electric-guitar + a8-winged = 9',
    ],
    final: 'anchor ÷ electric-guitar + 2:a8-winged × a8-winged = ?',
    answer: 100,
    choices: [100, 112, 51, 23],
    explanation: 'Guitar = 8, the A8 pair = 14 so one A8 = 7, Anchor = 16. Final: 16 ÷ 8 = 2 and 14 × 7 = 98, then 2 + 98 = 100.',
  }),
]

/* ------------------------------- ADVANCED ------------------------------- */

export const advancedPuzzles: Puzzle[] = [
  makePuzzle({
    id: '017',
    values: { infinity: 6, star: 4, crown: 9, 'electric-guitar': 3 },
    clues: [
      'infinity + infinity + infinity = 18',
      'infinity × star − crown = 15',
      'crown ÷ electric-guitar + star = 7',
      'electric-guitar × star + infinity = 18',
    ],
    final: 'crown + infinity ÷ electric-guitar × star − star = ?',
    answer: 13,
    choices: [13, 16, 21, 9],
    explanation: '6 × 4 = 24 − 9 = 15 fits. Final: 6 ÷ 3 × 4 = 8 (left to right), then 9 + 8 − 4 = 13.',
  }),
  makePuzzle({
    id: '018',
    values: { 'technic-turntable': 5, dj: 7, anchor: 12, 'rampant-lion': 10 },
    clues: [
      '3:technic-turntable + 3:technic-turntable = 30',
      'dj × 2:technic-turntable = 70',
      'anchor − dj ÷ dj = 11',
      'rampant-lion ÷ technic-turntable + anchor = 14',
    ],
    final: 'dj + rampant-lion × 2:technic-turntable ÷ technic-turntable = ?',
    answer: 27,
    choices: [27, 34, 17, 22],
    explanation: 'Three turntables = 15, so one = 5 and a pair = 10. DJ = 7, Anchor = 12, Lion = 10. Final: 10 × 10 ÷ 5 = 20, then 7 + 20 = 27.',
  }),
  makePuzzle({
    id: '019',
    values: { lion: 8, microphone: 3, captain: 11, 'btc-builder': 24 },
    clues: [
      'lion × microphone = 24',
      'lion + microphone = 11',
      'captain − lion + microphone = 6',
      'btc-builder ÷ lion × microphone = 9',
    ],
    final: 'btc-builder − captain + lion × microphone = ?',
    answer: 37,
    choices: [37, 63, 21, 59],
    explanation: 'Lion and Mic are 8 and 3, but which is which? Only Lion = 8, Mic = 3 makes the BTC clue whole: 24 ÷ 8 × 3 = 9. Captain = 11. Final: 8 × 3 = 24, then 24 − 11 + 24 = 37.',
  }),
  makePuzzle({
    id: '020',
    values: { headphones: 4, 'infin8-symbol': 16, 'celtic-cross': 5, 'a8-winged': 9 },
    clues: [
      '2:headphones × 2:headphones = 64',
      'infin8-symbol ÷ 2:headphones + headphones = 6',
      'celtic-cross × headphones − infin8-symbol = 4',
      'a8-winged + celtic-cross × 2:headphones = 49',
    ],
    final: 'a8-winged × headphones − infin8-symbol ÷ 2:headphones = ?',
    answer: 34,
    choices: [34, 32, 28, 36],
    explanation: 'The pair is 8, so one headphone = 4. iNFiN8 = 16, Cross = 5, A8 = 9. Final: 9 × 4 = 36 and 16 ÷ 8 = 2, then 36 − 2 = 34.',
  }),
  makePuzzle({
    id: '021',
    values: { crown: 12, star: 3, 'electric-guitar': 7, 'rampant-lion': 20 },
    clues: [
      'crown ÷ star × crown = 48',
      'crown + star × star = 21',
      'electric-guitar × star − crown = 9',
      'rampant-lion − electric-guitar × star + crown = 11',
    ],
    final: 'rampant-lion + crown ÷ star × electric-guitar − electric-guitar = ?',
    answer: 41,
    choices: [41, 55, 48, 27],
    explanation: 'Crown = 12, Star = 3 is the only pair that fits both top clues. Guitar = 7, Lion = 20. Final: 12 ÷ 3 × 7 = 28, then 20 + 28 − 7 = 41.',
  }),
  makePuzzle({
    id: '022',
    values: { anchor: 4, dj: 6, infinity: 15, microphone: 2 },
    clues: [
      '3:anchor + 3:anchor = 24',
      'dj × anchor − 3:anchor = 12',
      'infinity − dj × microphone = 3',
      'microphone × infinity ÷ dj = 5',
    ],
    final: 'infinity + 2:anchor × dj ÷ microphone = ?',
    answer: 39,
    choices: [39, 69, 27, 33],
    explanation: 'Three anchors = 12, so one = 4 and a pair = 8. DJ = 6, Mic = 2, Infinity = 15. Final: 8 × 6 ÷ 2 = 24, then 15 + 24 = 39.',
  }),
  makePuzzle({
    id: '023',
    values: { captain: 9, 'btc-builder': 6, 'celtic-cross': 18, lion: 3 },
    clues: [
      'captain + btc-builder = 15',
      'captain × btc-builder = 54',
      'celtic-cross ÷ btc-builder × captain = 27',
      'celtic-cross ÷ lion − lion = 3',
    ],
    final: 'celtic-cross + captain ÷ lion × btc-builder − lion = ?',
    answer: 33,
    choices: [33, 51, 39, 21],
    explanation: 'Captain and BTC are 9 and 6; only Captain = 9 keeps Cross whole (18 ÷ 6 × 9 = 27). Lion = 3. Final: 9 ÷ 3 × 6 = 18, then 18 + 18 − 3 = 33.',
  }),
  makePuzzle({
    id: '024',
    values: { 'infin8-symbol': 8, star: 5, crown: 3, 'technic-turntable': 15 },
    clues: [
      'infin8-symbol × 2:star = 80',
      'infin8-symbol + star + star = 18',
      'crown × infin8-symbol − 2:star = 14',
      'technic-turntable ÷ star × crown + infin8-symbol = 17',
    ],
    final: '2:star × crown − technic-turntable ÷ star = ?',
    answer: 27,
    choices: [27, 3, 12, 33],
    explanation: 'iNFiN8 and the star pair are 8 and 10; only iNFiN8 = 8 keeps Crown whole (3 × 8 − 10 = 14). Turntable = 15. Final: 10 × 3 = 30 and 15 ÷ 5 = 3, then 30 − 3 = 27.',
  }),
]

export type SectionId = 'beginner' | 'intermediate' | 'advanced'

export type Section = {
  id: SectionId
  name: string
  blurb: string
  puzzles: Puzzle[]
}

export const sections: Section[] = [
  { id: 'beginner', name: 'Beginner', blurb: '3 symbols · + − × ÷', puzzles: beginnerPuzzles },
  {
    id: 'intermediate',
    name: 'Intermediate',
    blurb: 'Bigger numbers · pairs · precedence traps',
    puzzles: intermediatePuzzles,
  },
  {
    id: 'advanced',
    name: 'Advanced',
    blurb: '4 unknowns · multi-step · groups',
    puzzles: advancedPuzzles,
  },
]
