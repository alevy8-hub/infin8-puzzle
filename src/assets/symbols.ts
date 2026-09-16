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

export const SYMBOL_ASSETS: Record<SymbolId, string> = {
  infinity: '/assets/symbols/infinity.png',
  star: '/assets/symbols/star.png',
  headphones: '/assets/symbols/headphones.png',
  lion: '/assets/symbols/lion.png',
  'rampant-lion': '/assets/symbols/rampant-lion.png',
  'a8-winged': '/assets/symbols/a8-winged.png',
  dj: '/assets/symbols/dj.png',
  microphone: '/assets/symbols/microphone.png',
  captain: '/assets/symbols/captain.png',
  'btc-builder': '/assets/symbols/btc-builder.png',
  anchor: '/assets/symbols/anchor.png',
  crown: '/assets/symbols/crown.png',
  'electric-guitar': '/assets/symbols/electric-guitar.png',
  'technic-turntable': '/assets/symbols/technic-turntable.png',
  'celtic-cross': '/assets/symbols/celtic-cross.png',
  'infin8-symbol': '/assets/symbols/infin8-symbol.png',
}

export function getSymbolAsset(id: SymbolId): string {
  return SYMBOL_ASSETS[id]
}
