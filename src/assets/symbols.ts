/**
 * Symbol ID → public asset path registry.
 * Symbols have NO permanent numeric values — values live only in puzzle data.
 */
export type SymbolId =
  | 'infinity'
  | 'star'
  | 'headphones'
  | 'lion'
  | 'rampant-lion'
  | 'a8-winged'
  | 'dj'
  | 'microphone'
  | 'captain'
  | 'btc-builder'
  | 'anchor'
  | 'crown'
  | 'electric-guitar'
  | 'technic-turntable'
  | 'celtic-cross'
  | 'infin8-symbol'

const base = import.meta.env.BASE_URL

export const SYMBOL_ASSETS: Record<SymbolId, string> = {
  infinity: `${base}assets/symbols/infinity.png`,
  star: `${base}assets/symbols/star.png`,
  headphones: `${base}assets/symbols/headphones.png`,
  lion: `${base}assets/symbols/lion.png`,
  'rampant-lion': `${base}assets/symbols/rampant-lion.png`,
  'a8-winged': `${base}assets/symbols/a8-winged.png`,
  dj: `${base}assets/symbols/dj.png`,
  microphone: `${base}assets/symbols/microphone.png`,
  captain: `${base}assets/symbols/captain.png`,
  'btc-builder': `${base}assets/symbols/btc-builder.png`,
  anchor: `${base}assets/symbols/anchor.png`,
  crown: `${base}assets/symbols/crown.png`,
  'electric-guitar': `${base}assets/symbols/electric-guitar.png`,
  'technic-turntable': `${base}assets/symbols/technic-turntable.png`,
  'celtic-cross': `${base}assets/symbols/celtic-cross.png`,
  'infin8-symbol': `${base}assets/symbols/infin8-symbol.png`,
}

export function getSymbolAsset(id: SymbolId): string {
  return SYMBOL_ASSETS[id]
}
