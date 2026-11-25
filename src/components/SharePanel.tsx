import { useEffect, useId, useRef, useState } from 'react'
import { canNativeShare, copyText, intentUrls, type SharePayload } from '../data/share'
import './SharePanel.css'

type Props = {
  payload: SharePayload
  onClose: () => void
}

const NETWORKS: { name: keyof ReturnType<typeof intentUrls>; label: string }[] = [
  { name: 'x', label: 'X' },
  { name: 'facebook', label: 'Facebook' },
  { name: 'threads', label: 'Threads' },
  { name: 'whatsapp', label: 'WhatsApp' },
  { name: 'reddit', label: 'Reddit' },
]

export function ShareButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button type="button" className={className ?? 'in8-share-btn'} onClick={onClick}>
      Share
    </button>
  )
}

export function SharePanel({ payload, onClose }: Props) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [copied, setCopied] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const native = canNativeShare()
  const intents = intentUrls(payload.text, payload.url)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const onNative = async () => {
    try {
      await navigator.share({ title: payload.label, text: payload.text, url: payload.url })
      onClose()
    } catch {
      /* dismissed or blocked */
    }
  }

  const onCopy = async () => {
    const ok = await copyText(payload.url)
    if (ok) {
      setCopied(true)
      setShowManual(false)
      window.setTimeout(() => setCopied(false), 2000)
    } else {
      setShowManual(true)
    }
  }

  return (
    <div
      className="in8-share-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        className="in8-share-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="in8-share-head">
          <h2 id={titleId} className="in8-share-title">
            Share
          </h2>
          <button ref={closeRef} type="button" className="in8-share-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <p className="in8-share-preview">
          {payload.text}
          <span className="in8-share-preview-link">{payload.url}</span>
        </p>
        <div className="in8-share-actions">
          {native ? (
            <button type="button" className="in8-share-native" onClick={onNative}>
              Share…
            </button>
          ) : null}
          {NETWORKS.map((n) => (
            <a
              key={n.name}
              className="in8-share-net"
              href={intents[n.name]}
              target="_blank"
              rel="noopener noreferrer"
            >
              {n.label}
            </a>
          ))}
          <button type="button" className="in8-share-copy" onClick={onCopy}>
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
        <p className="in8-share-hint">
          Instagram and TikTok have no share link — copy the link, or use Share… on your phone, then paste it in the app.
        </p>
        {showManual ? (
          <input
            className="in8-share-manual"
            readOnly
            value={payload.url}
            aria-label="Puzzle link"
            onFocus={(e) => e.currentTarget.select()}
          />
        ) : null}
      </div>
    </div>
  )
}
