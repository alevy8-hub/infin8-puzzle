# iNFiN8 Puzzle // 001

Premium mobile-first web app for the first playable **iNFiN8** symbol logic puzzle.

Brand: white / gold / black-dark. Symbols are cropped from the approved V1 symbol library — values exist only inside each puzzle’s data object, never on the symbols themselves.

## Prerequisites

- Node.js 20+ recommended
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm install
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project structure

```
public/assets/symbols/   # individual swappable PNGs
public/assets/reference/ # full sheet + poster reference (not used by UI)
src/assets/symbols.ts    # symbol ID → asset path registry only
src/data/puzzles.ts      # puzzle values, equations, answers
src/components/          # Symbol, PuzzleBoard, AnswerInput, Feedback
src/App.tsx              # mobile-first one-puzzle flow
```

## Puzzle 001

Clues:

1. Infinity + Infinity + Infinity = 24
2. Infinity + Star + Star = 18
3. Star + Headphones + Headphones = 11
4. Infinity + Star × Headphones = ?

Puzzle-only values: Infinity = 8, Star = 5, Headphones = 3. Correct answer **23** (× before +).

## License

Private — iNFiN8 assets and branding. Do not redistribute symbol artwork.
