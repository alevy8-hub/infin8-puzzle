import { useEffect, useRef, type ReactNode } from 'react'
import { formatPoints } from '../data/points'
import { DOWNLOAD_URL, SUPPORT_URL, type Song, type Unlocks } from '../data/songs'
import './SongUnlock.css'

/** Home/points-area lines: "My songs" rows for every unlocked song, then progress toward the next locked one. */
export function SongProgress({
  songs,
  unlocks,
  total,
  free,
  onOpen,
}: {
  songs: Song[]
  unlocks: Unlocks
  total: number
  free: boolean
  onOpen: (id: string) => void
}) {
  const mine = songs.filter((s) => unlocks[s.id])
  const next = songs.find((s) => !unlocks[s.id])
  const rows = mine.map((song) => (
    <button key={song.id} type="button" className="in8-song-row in8-song-row--mine" onClick={() => onOpen(song.id)}>
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
  ))
  let tail: ReactNode = null
  if (free) {
    tail = next ? (
      <div className="in8-song-row in8-song-row--locked">
        <span className="in8-song-row-label">🎵 Finish the free 8 to unlock {next.title}</span>
      </div>
    ) : (
      <div className="in8-song-row in8-song-row--locked">
        <span className="in8-song-row-sub">🔒 Subscribers unlock more songs with points</span>
      </div>
    )
  } else if (next) {
    const shown = Math.min(total, next.threshold)
    tail = (
      <div className="in8-song-row">
        <span className="in8-song-row-label">
          🎵 Next unlock: {next.title} — {formatPoints(shown)}/{formatPoints(next.threshold)} pts
        </span>
        <span className="in8-song-bar" aria-hidden="true">
          <span className="in8-song-bar-fill" style={{ width: `${(shown / next.threshold) * 100}%` }} />
        </span>
      </div>
    )
  } else {
    tail = (
      <div className="in8-song-row in8-song-row--locked">
        <span className="in8-song-row-sub">🎵 All songs unlocked</span>
      </div>
    )
  }
  return (
    <>
      {rows}
      {tail}
    </>
  )
}

/** Unlock card: celebratory the first time, then the replay view from "My songs". */
export function SongCard({
  song,
  celebrate,
  free = false,
  onClose,
}: {
  song: Song
  celebrate: boolean
  free?: boolean
  onClose: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    window.addEventListener('keydown', onKey)
    cardRef.current?.focus({ preventScroll: true })
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="in8-song-overlay" role="dialog" aria-modal="true" aria-labelledby="in8-song-title">
      <div ref={cardRef} tabIndex={-1} className={`in8-song-card${celebrate ? ' in8-song-card--celebrate' : ''}`}>
        <p className="in8-song-kicker">{celebrate ? (free ? 'You finished the free 8!' : `${formatPoints(song.threshold)} pts reached`) : 'My songs'}</p>
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
        {free ? <p className="in8-song-meta">Subscribe to keep earning points and unlock more songs.</p> : null}
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
