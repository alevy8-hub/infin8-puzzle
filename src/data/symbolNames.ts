import type { SymbolId } from '../assets/symbols'

/** Friendly names for explanations (runtime-safe: no import.meta). */
export const SYMBOL_NAMES: Record<SymbolId, string> = {
  infinity: 'Infinity',
  star: 'Star',
  headphones: 'Headphones',
  lion: 'Lion',
  'rampant-lion': 'Rampant Lion',
  'a8-winged': 'A8',
  dj: 'DJ',
  microphone: 'Mic',
  captain: 'Captain',
  'btc-builder': 'BTC Builder',
  anchor: 'Anchor',
  crown: 'Crown',
  'electric-guitar': 'Guitar',
  'technic-turntable': 'Turntable',
  'celtic-cross': 'Celtic Cross',
  'infin8-symbol': 'iNFiN8',
}

export const ALL_SYMBOLS = Object.keys(SYMBOL_NAMES) as SymbolId[]
