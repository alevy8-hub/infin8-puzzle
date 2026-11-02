import { getSymbolAsset, type SymbolId } from '../assets/symbols'
import { SYMBOL_METRICS } from '../assets/symbolMetrics'
import { symbolBox } from '../assets/symbolSize'
import './Symbol.css'

type SymbolProps = {
  id: SymbolId
  /** row unit in px; the symbol's visible art is sized from it (see symbolSize.ts) */
  unit: number
  className?: string
}

/** Box hugs the visible art; the square PNG is positioned inside so its margin never shrinks the art. */
export function Symbol({ id, unit, className = '' }: SymbolProps) {
  const m = SYMBOL_METRICS[id]
  const { w, h, scale } = symbolBox(id, unit)
  return (
    <span
      className={`in8-symbol ${className}`.trim()}
      style={{ width: `${w.toFixed(1)}px`, height: `${h.toFixed(1)}px` }}
      role="img"
      aria-label={id.replace(/-/g, ' ')}
    >
      <img
        src={getSymbolAsset(id)}
        alt=""
        draggable={false}
        style={{
          width: `${(m.size * scale).toFixed(1)}px`,
          height: `${(m.size * scale).toFixed(1)}px`,
          left: `${(-m.x * scale).toFixed(1)}px`,
          top: `${(-m.y * scale).toFixed(1)}px`,
        }}
      />
    </span>
  )
}
