import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin, type ResolvedConfig } from 'vite'

// Subscriber-only songs: never shipped in the free build (VITE_FREE=1).
const SUBSCRIBER_ONLY_FILES = [
  'music/breaking.mp3',
  'music/breaking.jpg',
  'music/light-waves.mp3',
  'music/light-waves.jpg',
  'music/shudder.mp3',
  'music/shudder.jpg',
]

function stripSubscriberMusic(): Plugin {
  let config: ResolvedConfig
  return {
    name: 'strip-subscriber-music',
    apply: 'build',
    configResolved(c) {
      config = c
    },
    closeBundle() {
      if (process.env.VITE_FREE !== '1' && config.env.VITE_FREE !== '1') return
      const outDir = resolve(config.root, config.build.outDir)
      for (const f of SUBSCRIBER_ONLY_FILES) rmSync(resolve(outDir, f), { force: true })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), stripSubscriberMusic()],
  base: '/infin8-puzzle/',
})
