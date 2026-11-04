import { useEffect, useRef } from 'react'
import { formatPoints } from '../data/points'
import { DOWNLOAD_URL, SUPPORT_URL, type Song } from '../data/songs'
import './SongUnlock.css'

/** Home/points-area line: progress toward the song, or the "My songs" spot once unlocked. */
export function SongProgress({
  song,
  total,
  unlocked,
  free,
  onOpen,
}: {
  song: Song
  total: number
  unlocked: boolean
  free: boolean
  onOpen: () => void
}) {
  if (free) {
    return (
      <div className="in8-song-row in8-song-row--locked">
        <span className="in8-song-row-label">🔒 🎵 {song.title}</span>
        <span className="in8-song-row-sub">Subscribers unlock songs with points</span>
      </div>
    )
  }
  if (unlocked) {
    return (
      <button type="button" className="in8-song-row in8-song-row--mine" onClick={onOpen}>
        <img className="in8-song-row-cover" src={song.cover} alt="" width={40} height={40} />
        <span className="in8-song-row-text">
          <span className="in8-song-row-kicker">My songs</span>
          <span className="in8-song-row-label">
            {song.title} <span className="in8-song-row-artist">· {song.artist}</span>
          </span>
        </span>
        <span className="in8-song-row-play" aria-hidden="true">
          ▶
        </span>
      </button>
    )
  }
  const shown = Math.min(total, song.threshold)
  return (
    <div className="in8-song-row">
      <span className="in8-song-row-label">
        🎵 Next unlock: {song.title} — {formatPoints(shown)}/{formatPoints(song.threshold)} pts
      </span>
      <span className="in8-song-bar" aria-hidden="true">
        <span className="in8-song-bar-fill" style={{ width: `${(shown / song.threshold) * 100}%` }} />
      </span>
    </div>
  )
}

/** Unlock card: celebratory the first time, then the replay view from "My songs". */
export function SongCard({ song, celebrate, onClose }: { song: Song; celebrate: boolean; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    cardRef.current?.focus({ preventScroll: true })
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="in8-song-overlay" role="dialog" aria-modal="true" aria-labelledby="in8-song-title">
      <div ref={cardRef} tabIndex={-1} className={`in8-song-card${celebrate ? ' in8-song-card--celebrate' : ''}`}>
        <p className="in8-song-kicker">{celebrate ? `${formatPoints(song.threshold)} pts reached` : 'My songs'}</p>
        <h2 id="in8-song-title" className="in8-song-title">
          {celebrate ? `🎵 You unlocked ${song.title}` : `🎵 ${song.title}`}
        </h2>
        <img className="in8-song-cover" src={song.cover} alt={`${song.title} cover art`} width={1000} height={1000} />
        <p className="in8-song-meta">
          {song.title} <span className="in8-song-meta-artist">· {song.artist}</span>
        </p>
        <audio className="in8-song-audio" controls preload="metadata" playsInline src={song.audio}>
          <a href={song.audio}>Play {song.title}</a>
        </audio>
        <div className="in8-complete-actions">
          <a className="in8-submit in8-share" href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
            ⬇️ Get your free download
          </a>
          <a className="in8-progress-btn in8-share" href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">
            ⭐ Support DJ, $5/mo
          </a>
          <button type="button" className="in8-link-btn" onClick={onClose}>
            {celebrate ? 'Keep playing' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}
