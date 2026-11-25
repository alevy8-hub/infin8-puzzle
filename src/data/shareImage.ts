import { SYMBOL_METRICS } from '../assets/symbolMetrics'
import { symbolBox } from '../assets/symbolSize'
import { getSymbolAsset, type SymbolId } from '../assets/symbols'
import type { EquationRow, EquationToken, Puzzle } from './puzzles'

export const SHARE_IMAGE_W = 1080
export const SHARE_IMAGE_H = 1350
export const SHARE_FOOTER_TEXT = 'Hear / See / FEEL'

const BG = '#050505'
const GOLD = '#d4af37'
const CREAM = '#f5f5f5'
const CREAM_DIM = '#d2cec4'
const CARD_BG_TOP = '#141414'
const CARD_BG_BOT = '#0a0a0a'

export function puzzleSymbols(puzzle: Puzzle): SymbolId[] {
  const ids = new Set<SymbolId>()
  for (const row of [...puzzle.rows, puzzle.finalRow]) {
    for (const t of row.tokens) if (t.type === 'symbol') ids.add(t.id)
  }
  return [...ids]
}

/** Final row always ends in "= ?" and never includes a numeric answer. */
export function shareFinalRow(row: EquationRow): EquationRow {
  const tokens: EquationToken[] = row.tokens.filter((t) => t.type !== 'unknown')
  while (tokens.length) {
    const last = tokens[tokens.length - 1]
    if (last.type === 'op' && last.value === '=') {
      tokens.pop()
      continue
    }
    if (last.type === 'number') {
      tokens.pop()
      continue
    }
    break
  }
  tokens.push({ type: 'op', value: '=' }, { type: 'unknown' })
  return { tokens }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Could not load ${src}`))
    img.src = src
  })
}

async function loadSymbols(ids: SymbolId[]): Promise<Map<SymbolId, HTMLImageElement>> {
  const entries = await Promise.all(ids.map(async (id) => [id, await loadImage(getSymbolAsset(id))] as const))
  return new Map(entries)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.arcTo(x + w, y, x + w, y + h, rad)
  ctx.arcTo(x + w, y + h, x, y + h, rad)
  ctx.arcTo(x, y + h, x, y, rad)
  ctx.arcTo(x, y, x + w, y, rad)
  ctx.closePath()
}

function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  tracking: number,
  fills: string | ((i: number, ch: string) => string),
) {
  const widths = [...text].map((ch) => ctx.measureText(ch).width)
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (text.length - 1)
  let x = cx - total / 2
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  for (let i = 0; i < text.length; i += 1) {
    ctx.fillStyle = typeof fills === 'string' ? fills : fills(i, text[i])
    ctx.fillText(text[i], x, cy)
    x += widths[i] + tracking
  }
}

function trackedWidth(ctx: CanvasRenderingContext2D, text: string, tracking: number): number {
  const widths = [...text].map((ch) => ctx.measureText(ch).width)
  return widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, text.length - 1)
}

type Layout = { unit: number; gap: number; opW: number; numW: number; qW: number; groupGap: number; groupPad: number }

function tokenWidth(t: EquationToken, layout: Layout): number {
  if (t.type === 'symbol') {
    const n = t.count ?? 1
    const sw = symbolBox(t.id, layout.unit).w
    if (n === 1) return sw
    return n * sw + (n - 1) * layout.groupGap + 2 * layout.groupPad + 2
  }
  if (t.type === 'number') return String(t.value).length * layout.numW
  if (t.type === 'unknown') return layout.qW
  return layout.opW
}

function rowWidth(row: EquationRow, layout: Layout): number {
  if (!row.tokens.length) return 0
  return row.tokens.reduce((w, t) => w + tokenWidth(t, layout), 0) + layout.gap * (row.tokens.length - 1)
}

function fitLayout(rows: EquationRow[], available: number): Layout {
  for (let unit = 118; unit >= 64; unit -= 2) {
    const layout: Layout = {
      unit,
      gap: Math.round(unit * 0.16),
      opW: Math.round(unit * 0.42),
      numW: Math.round(unit * 0.32),
      qW: Math.round(unit * 0.55),
      groupGap: Math.max(4, Math.round(unit * 0.1)),
      groupPad: Math.max(4, Math.round(unit * 0.12)),
    }
    if (rows.every((r) => rowWidth(r, layout) <= available)) return layout
  }
  const unit = 64
  return {
    unit,
    gap: 10,
    opW: 26,
    numW: 20,
    qW: 36,
    groupGap: 6,
    groupPad: 8,
  }
}

function drawSymbol(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  id: SymbolId,
  x: number,
  cy: number,
  unit: number,
) {
  const m = SYMBOL_METRICS[id]
  const box = symbolBox(id, unit)
  const dx = x
  const dy = cy - box.h / 2
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, m.x, m.y, m.w, m.h, dx, dy, box.w, box.h)
}

function drawToken(
  ctx: CanvasRenderingContext2D,
  token: EquationToken,
  x: number,
  cy: number,
  layout: Layout,
  images: Map<SymbolId, HTMLImageElement>,
): number {
  const w = tokenWidth(token, layout)
  if (token.type === 'symbol') {
    const img = images.get(token.id)
    if (!img) return w
    const n = token.count ?? 1
    const box = symbolBox(token.id, layout.unit)
    if (n === 1) {
      drawSymbol(ctx, img, token.id, x, cy, layout.unit)
    } else {
      const gw = n * box.w + (n - 1) * layout.groupGap + 2 * layout.groupPad
      const gh = box.h + 2 * layout.groupPad
      ctx.save()
      roundRect(ctx, x, cy - gh / 2, gw, gh, 10)
      ctx.fillStyle = 'rgba(212, 175, 55, 0.07)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()
      let sx = x + layout.groupPad
      for (let i = 0; i < n; i += 1) {
        drawSymbol(ctx, img, token.id, sx, cy, layout.unit)
        sx += box.w + layout.groupGap
      }
    }
  } else if (token.type === 'op') {
    ctx.font = `600 ${Math.round(layout.unit * 0.42)}px system-ui, -apple-system, "Segoe UI", sans-serif`
    ctx.fillStyle = CREAM
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(token.value, x + w / 2, cy)
  } else if (token.type === 'number') {
    ctx.font = `700 ${Math.round(layout.unit * 0.46)}px system-ui, -apple-system, "Segoe UI", sans-serif`
    ctx.fillStyle = CREAM
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(String(token.value), x + w / 2, cy)
  } else {
    ctx.font = `700 ${Math.round(layout.unit * 0.62)}px system-ui, -apple-system, "Segoe UI", sans-serif`
    ctx.fillStyle = GOLD
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('?', x + w / 2, cy)
  }
  return w
}

function drawRow(
  ctx: CanvasRenderingContext2D,
  row: EquationRow,
  cy: number,
  layout: Layout,
  images: Map<SymbolId, HTMLImageElement>,
  canvasW: number,
) {
  const width = rowWidth(row, layout)
  let x = (canvasW - width) / 2
  for (const token of row.tokens) {
    const w = drawToken(ctx, token, x, cy, layout, images)
    x += w + layout.gap
  }
}

export type ShareImageInput = {
  puzzle: Puzzle
  label: string
  levelName: string
}

/** Renders a 1080×1350 share image of this puzzle. Never draws the answer or choices. */
export async function renderPuzzleShareImage(input: ShareImageInput): Promise<Blob> {
  const { puzzle, label, levelName } = input
  const finalRow = shareFinalRow(puzzle.finalRow)
  const rows = [...puzzle.rows, finalRow]
  const images = await loadSymbols(puzzleSymbols({ ...puzzle, finalRow }))

  const canvas = document.createElement('canvas')
  canvas.width = SHARE_IMAGE_W
  canvas.height = SHARE_IMAGE_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available')

  const W = SHARE_IMAGE_W
  const H = SHARE_IMAGE_H
  const FRAME = 36
  const FRAME_W = 2
  const innerTop = FRAME + FRAME_W / 2
  const innerBot = H - FRAME - FRAME_W / 2
  const innerH = innerBot - innerTop

  const contentLeft = 88
  const contentW = W - contentLeft * 2
  const layout = fitLayout(rows, contentW - 48)
  const rowH = layout.unit + 16
  const rowGap = 28
  const boardPadY = 36
  const divider = 18
  const boardH = boardPadY * 2 + rows.length * rowH + rowGap * (rows.length - 1) + divider

  const wordFont = '800 78px system-ui, -apple-system, "Segoe UI", sans-serif'
  const titleFont = '800 44px system-ui, -apple-system, "Segoe UI", sans-serif'
  const levelFont = '700 22px system-ui, -apple-system, "Segoe UI", sans-serif'
  const promptFont = 'italic 500 40px Georgia, "Times New Roman", serif'
  const footFont = '600 22px system-ui, -apple-system, "Segoe UI", sans-serif'
  const levelText = levelName.toUpperCase()

  const inkH = (font: string, text: string, letterSpacing = '0px') => {
    ctx.font = font
    ctx.textBaseline = 'alphabetic'
    ctx.letterSpacing = letterSpacing
    const m = ctx.measureText(text)
    const ascent = m.actualBoundingBoxAscent ?? 0
    const descent = m.actualBoundingBoxDescent ?? 0
    ctx.letterSpacing = '0px'
    return { h: ascent + descent, ascent }
  }

  const wordInk = inkH(wordFont, 'iNFiN8')
  const titleInk = inkH(titleFont, label)
  const levelInk = inkH(levelFont, levelText, '0.22em')
  const promptInk = inkH(promptFont, 'Can you solve it?')
  const footInk = inkH(footFont, SHARE_FOOTER_TEXT)

  const PAIR = 26
  const PAIR_SM = 18
  const GAP = 48
  const titleGroupH = wordInk.h + PAIR + titleInk.h + PAIR_SM + levelInk.h
  const stackH = titleGroupH + GAP + boardH + GAP + promptInk.h + GAP + footInk.h
  const stackTop = innerTop + (innerH - stackH) / 2

  ctx.fillStyle = BG
  ctx.fillRect(0, 0, W, H)

  const glow = ctx.createRadialGradient(W / 2, stackTop + wordInk.h * 0.6, 40, W / 2, stackTop + 200, 520)
  glow.addColorStop(0, 'rgba(212, 175, 55, 0.16)')
  glow.addColorStop(1, 'rgba(212, 175, 55, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)'
  ctx.lineWidth = FRAME_W
  roundRect(ctx, FRAME, FRAME, W - FRAME * 2, H - FRAME * 2, 28)
  ctx.stroke()

  let y = stackTop
  ctx.font = wordFont
  drawTracked(ctx, 'iNFiN8', W / 2, y + wordInk.ascent, 10, (_i, ch) => (ch === '8' ? GOLD : CREAM))
  y += wordInk.h + PAIR

  ctx.font = titleFont
  ctx.fillStyle = CREAM
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(label, W / 2, y + titleInk.ascent)
  y += titleInk.h + PAIR_SM

  ctx.font = levelFont
  ctx.fillStyle = GOLD
  ctx.letterSpacing = '0.22em'
  ctx.fillText(levelText, W / 2, y + levelInk.ascent)
  ctx.letterSpacing = '0px'
  y += levelInk.h + GAP

  const boardX = contentLeft
  const boardW = contentW
  const boardY = y

  const card = ctx.createLinearGradient(0, boardY, 0, boardY + boardH)
  card.addColorStop(0, CARD_BG_TOP)
  card.addColorStop(1, CARD_BG_BOT)
  ctx.fillStyle = card
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.28)'
  ctx.lineWidth = 2
  roundRect(ctx, boardX, boardY, boardW, boardH, 22)
  ctx.fill()
  ctx.stroke()

  const clueCount = puzzle.rows.length
  for (let i = 0; i < rows.length; i += 1) {
    if (i === clueCount) {
      const midY = boardY + boardPadY + clueCount * rowH + rowGap * (clueCount - 1) + divider / 2
      const g = ctx.createLinearGradient(boardX + 40, midY, boardX + boardW - 40, midY)
      g.addColorStop(0, 'rgba(212, 175, 55, 0)')
      g.addColorStop(0.5, 'rgba(212, 175, 55, 0.45)')
      g.addColorStop(1, 'rgba(212, 175, 55, 0)')
      ctx.strokeStyle = g
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(boardX + 40, midY)
      ctx.lineTo(boardX + boardW - 40, midY)
      ctx.stroke()
    }
    const rowIndex = i
    const cluesBefore = Math.min(rowIndex, clueCount)
    const afterDivider = rowIndex >= clueCount ? divider : 0
    const cy =
      boardY +
      boardPadY +
      rowH / 2 +
      cluesBefore * (rowH + rowGap) +
      (rowIndex >= clueCount ? rowGap : 0) +
      afterDivider
    drawRow(ctx, rows[i], cy, layout, images, W)
  }

  y = boardY + boardH + GAP
  ctx.font = promptFont
  ctx.fillStyle = CREAM_DIM
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('Can you solve it?', W / 2, y + promptInk.ascent)
  y += promptInk.h + GAP

  ctx.font = footFont
  const footBase = y + footInk.ascent
  const footMid = y + footInk.h / 2
  drawTracked(ctx, SHARE_FOOTER_TEXT, W / 2, footBase, 7, 'rgba(212, 175, 55, 0.86)')
  const footW = trackedWidth(ctx, SHARE_FOOTER_TEXT, 7)
  const rulePad = 18
  const ruleLen = 140
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(W / 2 - footW / 2 - rulePad - ruleLen, footMid)
  ctx.lineTo(W / 2 - footW / 2 - rulePad, footMid)
  ctx.moveTo(W / 2 + footW / 2 + rulePad, footMid)
  ctx.lineTo(W / 2 + footW / 2 + rulePad + ruleLen, footMid)
  ctx.stroke()

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create the share image'))), 'image/png')
  })
}

export async function shareImageFile(blob: Blob, name = 'infin8-puzzle.png'): Promise<File> {
  return new File([blob], name, { type: 'image/png' })
}
