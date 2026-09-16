import { getSymbolAsset, type SymbolId } from '../assets/symbols'
import './Symbol.css'

type SymbolProps = {
  id: SymbolId
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Symbol({ id, size = 'md', className = '' }: SymbolProps) {
  const src = getSymbolAsset(id)
  return (
    <img
      className={`in8-symbol in8-symbol--${size} ${className}`.trim()}
      src={src}
      alt={id.replace(/-/g, ' ')}
      draggable={false}
    />
  )
}
