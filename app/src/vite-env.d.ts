/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: "dev" | "prod"
  readonly VITE_API_URL: string
  readonly VITE_GAMES_PATH: string
  readonly VITE_VOTES_PATH: string
  readonly VITE_USERS_PATH: string
  readonly VITE_PLAYERS_PATH: string
  readonly VITE_VOTES_WS_ENDPOINT: string
  readonly VITE_GAMES_WS_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
