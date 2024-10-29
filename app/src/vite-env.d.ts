/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VOTE_API_URL: string
  readonly VITE_ACTIVE_GAME_API_URL: string
  readonly VITE_GAME_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
