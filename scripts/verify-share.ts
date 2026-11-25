/**
 * Share payload, intent URLs, and ?seed= round-trip.
 * Run: npx tsx scripts/verify-share.ts
 */
import { generatePuzzle, parseCode } from '../src/data/generator'
import { roundPuzzle } from '../src/data/levels'
import { beginnerPuzzles } from '../src/data/puzzles'
import { puzzleSeed } from '../src/data/random'
import {
  intentUrls,
  puzzleOrdinal,
  sharePayload,
  shareText,
  shareUrl,
  SITE_URL,
} from '../src/data/share'
import { SHARE_LINK_TEXT, shareFinalRow } from '../src/data/shareImage'

let failed = 0
const check = (name: string, cond: boolean, detail = '') => {
  failed += cond ? 0 : 1
  console.log(`  ${cond ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`)
}

const puzzleFromSeed = (code: string) => {
  const v1 = beginnerPuzzles.find((p) => p.id === code.trim())
  if (v1) return { level: 'beginner' as const, puzzle: v1 }
  const parsed = parseCode(code)
  if (!parsed) return null
  return { level: parsed.level, puzzle: generatePuzzle(parsed.level, parsed.seed) }
}

console.log('copy')
{
  const t = shareText(9)
  check('exact brand spelling and short text', t === 'Can you solve iNFiN8 Puzzle 9/∞? 🧠', t)
  check('does not include the answer or hype words', !/correct|answer|solved it|amazing|incredible/i.test(t))
  check('shared-view label uses ∞ only', shareText(null) === 'Can you solve iNFiN8 Puzzle ∞? 🧠')
}

console.log('links')
{
  const url = shareUrl('I-482913')
  check('seed link is on the live subscriber origin', url === `${SITE_URL}?seed=I-482913`, url)
  const frozen = shareUrl('001')
  check('frozen Beginner uses ?seed=001', frozen === `${SITE_URL}?seed=001`)
  const preview = shareUrl('001', 'https://alevy8-hub.github.io/infin8-puzzle/preview-share/')
  check(
    'preview origin can be passed for card testing',
    preview === 'https://alevy8-hub.github.io/infin8-puzzle/preview-share/?seed=001',
    preview,
  )
  const p = sharePayload('I-482913', 9)
  const intents = intentUrls(p.text, p.url)
  const encodedText = encodeURIComponent(`${p.text} ${p.url}`)
  check('X intent', intents.x === `https://x.com/intent/post?text=${encodedText}`, intents.x)
  check(
    'Facebook intent',
    intents.facebook === `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(p.url)}`,
    intents.facebook,
  )
  check('Threads intent', intents.threads === `https://www.threads.net/intent/post?text=${encodedText}`, intents.threads)
  check('WhatsApp intent', intents.whatsapp === `https://wa.me/?text=${encodedText}`, intents.whatsapp)
  check(
    'Reddit intent',
    intents.reddit ===
      `https://www.reddit.com/submit?url=${encodeURIComponent(p.url)}&title=${encodeURIComponent(p.text)}`,
    intents.reddit,
  )
}

console.log('?seed= round-trip')
{
  const v1 = beginnerPuzzles[0]
  const opened = puzzleFromSeed(v1.id)
  check('frozen Beginner 001 opens the same puzzle', !!opened && opened.puzzle.id === v1.id && opened.puzzle.correctAnswer === v1.correctAnswer)

  const gen = generatePuzzle('intermediate', 482913)
  check('generated id is I-482913', gen.id === 'I-482913', gen.id)
  const openedGen = puzzleFromSeed(gen.id)
  check(
    'I-482913 reopens the same Intermediate puzzle',
    !!openedGen &&
      openedGen.level === 'intermediate' &&
      openedGen.puzzle.id === gen.id &&
      openedGen.puzzle.correctAnswer === gen.correctAnswer &&
      openedGen.puzzle.finalRow.raw === gen.finalRow.raw,
  )

  const adv = generatePuzzle('advanced', 700001)
  const openedAdv = puzzleFromSeed(adv.id)
  check('A-700001 reopens the same Advanced puzzle', !!openedAdv && openedAdv.puzzle.correctAnswer === adv.correctAnswer)

  const k = 0
  const roundSeed = 12345
  const inRound = roundPuzzle('intermediate', 2, roundSeed, k)
  const expectedId = `I-${puzzleSeed(roundSeed, k)}`
  check('round 2 puzzle 1 id matches puzzleSeed', inRound.id === expectedId, inRound.id)
  const reopened = puzzleFromSeed(inRound.id)
  check('round puzzle seed reopens the same board', !!reopened && reopened.puzzle.correctAnswer === inRound.correctAnswer)
  check('ordinal for round 2, index 0 is 9', puzzleOrdinal(2, 0) === 9)
  check('ordinal for round 1, last puzzle is 8', puzzleOrdinal(1, 7) === 8)
}

console.log('share image data')
{
  check('short link text has no scheme', SHARE_LINK_TEXT === 'alevy8-hub.github.io/infin8-puzzle')
  const puz = generatePuzzle('beginner', 322048)
  const final = shareFinalRow(puz.finalRow)
  const last = final.tokens[final.tokens.length - 1]
  const eq = final.tokens[final.tokens.length - 2]
  check('final row ends with unknown', last?.type === 'unknown')
  check('equals sits before the question mark', eq?.type === 'op' && eq.value === '=')
  check(
    'final share row never includes a trailing answer',
    !final.tokens.some((t) => t.type === 'number' && t.value === puz.correctAnswer),
  )
  check(
    'share final row ignores choices and the answer field',
    !final.tokens.some((t) => t.type === 'number') || puz.choices.every((c) => !final.tokens.some((t) => t.type === 'number' && t.value === c)),
  )
}

if (failed) {
  console.error(`\n${failed} check(s) failed`)
  process.exit(1)
}
console.log('\nAll share checks passed')
