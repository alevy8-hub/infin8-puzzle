/**
 * Share payload, intent URLs, and ?seed= round-trip.
 * Run: npx tsx scripts/verify-share.ts
 */
import { generatePuzzle, parseCode } from '../src/data/generator'
import { roundPuzzle } from '../src/data/levels'
import { beginnerPuzzles } from '../src/data/puzzles'
import { puzzleSeed } from '../src/data/random'
import {
  hookForSeed,
  intentUrls,
  puzzleOrdinal,
  SHARE_HOOKS,
  SHARE_PAGE,
  shareLinkDisplay,
  sharePayload,
  sharePost,
  shareUrl,
  SITE_URL,
} from '../src/data/share'
import { SHARE_FOOTER_TEXT, shareFinalRow } from '../src/data/shareImage'

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
  const expected = (hook: string) =>
    `${hook} 🧩\n\nNo calculator. No cheating. 60 seconds.\nSharpens focus, trains your brain, wakes up your math.\n\nNothing to lose. Everything to gain.\n${SHARE_PAGE}`

  check('three exact hooks', SHARE_HOOKS.length === 3 && SHARE_HOOKS[0] === 'Most people get this wrong on the first try.' && SHARE_HOOKS[1] === "Looks easy. It's not." && SHARE_HOOKS[2] === 'Only a few get this on the first try.')
  check('same seed always gets the same hook', hookForSeed('001') === hookForSeed('001') && hookForSeed('I-482913') === hookForSeed('I-482913'))
  const freeHooks = new Set(beginnerPuzzles.map((p) => hookForSeed(p.id)))
  check('the free 8 are not all the same hook', freeHooks.size > 1, [...freeHooks].join(' | '))

  const url = shareUrl('001')
  const hook = hookForSeed('001')
  const post = sharePost(url, hook)
  check('display link is exactly djalevy8.com/free', shareLinkDisplay(url) === SHARE_PAGE)
  check('post matches DJ\'s layout exactly', post === expected(hook), JSON.stringify(post))
  check('post starts with the hook and a puzzle emoji, then a blank line', post.startsWith(`${hook} 🧩\n\n`))
  check('link is the last line, no https:// or github.io', post.endsWith(`\n${SHARE_PAGE}`) && !post.includes('https://') && !post.includes('github.io'))

  for (const h of SHARE_HOOKS) {
    const variant = expected(h)
    const weighted = variant.length - SHARE_PAGE.length + 23
    check(`under 280 chars (${h.slice(0, 18)}…)`, variant.length <= 280 && weighted <= 280, `len=${variant.length} x=${weighted}`)
  }
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
  const encodedPost = encodeURIComponent(sharePost(p.url, p.text))
  check('payload text is the hook for this seed', p.text === hookForSeed(p.seed), p.text)
  check('X intent', intents.x === `https://x.com/intent/post?text=${encodedPost}`, intents.x)
  check(
    'Facebook intent stays URL-only',
    intents.facebook === `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(p.url)}`,
    intents.facebook,
  )
  check('Threads intent', intents.threads === `https://www.threads.net/intent/post?text=${encodedPost}`, intents.threads)
  check('WhatsApp intent', intents.whatsapp === `https://wa.me/?text=${encodedPost}`, intents.whatsapp)
  check(
    'Reddit intent uses the hook as title',
    intents.reddit ===
      `https://www.reddit.com/submit?url=${encodeURIComponent(p.url)}&title=${encodeURIComponent(p.text)}`,
    intents.reddit,
  )
  const xText = decodeURIComponent(new URL(intents.x).searchParams.get('text') || '')
  check(
    'decoded X text is the full post for this seed',
    xText === sharePost(p.url, p.text),
    JSON.stringify(xText),
  )
  check('decoded X text has no https:// and no github.io', !xText.includes('https://') && !xText.includes('github.io'))
  check('decoded X text is under 280 characters', xText.length <= 280, String(xText.length))
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
  check('footer is the brand line, not a URL', SHARE_FOOTER_TEXT === 'Hear / See / FEEL')
  check('footer is not a web address', !/github\.io|https?:|\.com/i.test(SHARE_FOOTER_TEXT))
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
