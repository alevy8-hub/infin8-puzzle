import { SYMBOL_METRICS } from './symbolMetrics'
import type { SymbolId } from './symbols'

/**
 * Every symbol is drawn at the same visual weight instead of being squeezed into a square:
 * the visible art gets an equal size measure w^0.36·h^0.64 (height counts a bit more, so wide
 * marks like A8 / Infinity are allowed to run wider instead of shrinking into a thin strip),
 * nudged up for airy marks (star, guitar, anchor),
 * then capped so tall marks stay inside the row height and wide marks get at most 1.6× the
 * row height in width. The three dogs share one scale so their heads match.
 */
const TARGET = 0.84 // √(w·h) as a share of the row unit
const MAX_H = 1.0
const MAX_W = 1.6
const DOGS: SymbolId[] = ['captain', 'btc-builder', 'dj']

const DOG_WEIGHT = 1.04

function weight(id: SymbolId): number {
  const f = SYMBOL_METRICS[id].fill
  return Math.min(1.15, Math.max(1, (0.5 / f) ** 0.35))
}

const measure = (w: number, h: number) => w ** 0.36 * h ** 0.64

export type SymbolBox = { w: number; h: number; scale: number }

function rawBox(id: SymbolId, unit: number): SymbolBox {
  const m = SYMBOL_METRICS[id]
  let scale: number
  if (DOGS.includes(id)) {
    // same px-per-source-px for all dogs, set from Captain's head
    const c = SYMBOL_METRICS.captain
    scale = (TARGET * unit * DOG_WEIGHT) / measure(c.w, c.h)
  } else {
    scale = (TARGET * unit * weight(id)) / measure(m.w, m.h)
  }
  scale = Math.min(scale, (MAX_H * unit) / m.h, (MAX_W * unit) / m.w)
  return { w: m.w * scale, h: m.h * scale, scale }
}

export function symbolBox(id: SymbolId, unit: number): SymbolBox {
  return rawBox(id, unit)
}
