import { useEffect, useId, useRef, useState } from 'react'
import { canNativeShare, canShareFiles, copyText, intentUrls, type SharePayload } from '../data/share'
import { renderPuzzleShareImage, shareImageFile } from '../data/shareImage'
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

function isAbort(err: unknown): boolean {
  return err instanceof Error && err.name === 'AbortError'
}

export function SharePanel({ payload, onClose }: Props) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [copied, setCopied] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [imageError, setImageError] = useState(false)
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

  useEffect(() => {
    if (!payload.puzzle) return
    let cancelled = false
    let objectUrl: string | null = null
    setImageUrl(null)
    setImageBlob(null)
    setImageError(false)
    renderPuzzleShareImage({
      puzzle: payload.puzzle,
      label: payload.label,
      levelName: payload.levelName ?? '',
    })
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setImageBlob(blob)
        setImageUrl(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setImageError(true)
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [payload])

  const onNative = async () => {
    try {
      const base = { title: payload.label, text: payload.text, url: payload.url }
      if (imageBlob) {
        const file = await shareImageFile(imageBlob)
        if (canShareFiles([file])) {
          try {
            await navigator.share({ ...base, files: [file] })
            onClose()
            return
          } catch (err) {
            if (isAbort(err)) return
            try {
              await navigator.share({ title: payload.label, text: payload.text, files: [file] })
              onClose()
              return
            } catch (err2) {
              if (isAbort(err2)) return
            }
          }
        }
      }
      await navigator.share(base)
      onClose()
    } catch {
      /* dismissed or blocked */
    }
  }

  const onSave = () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = 'infin8-puzzle.png'
    a.rel = 'noopener'
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    a.remove()
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
        {imageUrl ? (
          <figure className="in8-share-art-wrap">
            <img
              className="in8-share-art"
              src={imageUrl}
              alt={`${payload.label} — press and hold to save the image`}
              draggable={false}
            />
          </figure>
        ) : imageError ? (
          <p className="in8-share-art-status">Couldn’t make the puzzle image. You can still share the link.</p>
        ) : payload.puzzle ? (
          <p className="in8-share-art-status">Making the puzzle image…</p>
        ) : null}
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
          {imageUrl ? (
            <button type="button" className="in8-share-save" onClick={onSave}>
              Save image
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
          To show the puzzle, use Share… or Save image, then attach it to your post.
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
