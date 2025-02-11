import { ref } from "vue"
import { defineStore } from "pinia"
import { get, post, put } from "@/services/api"
import { Game, type GameType, type IGame } from "@common/models/game"
import { useVoteStore } from "./vote"
import { usePlayerStore } from "./player"
import { createWebSocketAsync, onClose, onError, onOpen, close } from "@/services/webSocket"
import type { IWsEntity } from "@common/core/src/models/wsEntity"

const API_URL = import.meta.env.VITE_API_URL
const PATH = import.meta.env.VITE_GAMES_PATH
const URL = `${API_URL}/${PATH}`
const WS_ENDPOINT = import.meta.env.VITE_GAMES_WS_ENDPOINT
const WS_NAME = "Active Game"

export const useGameStore = defineStore("game", () => {
  const activeGame = ref<IGame | null>(null)
  const ws = ref<WebSocket | null>(null)
  const loading = ref(false)
  const error = ref<Error>()

  const voteStore = useVoteStore()
  const playerStore = usePlayerStore()

  async function getActiveGame() {
    loading.value = true
    try {
      if (activeGame.value === null) {
        const active: GameType = "active"
        activeGame.value = await get<IGame>(URL, { type: active })
      }
      return activeGame.value
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function createActiveGame() {
    loading.value = true
    try {
      if (!activeGame.value || (activeGame.value && activeGame.value.isVoteComplete)) {
        const newGame = new Game()

        const corePlayers = await playerStore.getCorePlayers()

        if (corePlayers) {
          newGame.players = corePlayers
          await voteStore.deleteAllVotes()
          const result = await post<IGame>(URL, newGame, true)
          activeGame.value = result
        } else {
          throw new Error("Error processing new active game")
        }
      }
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function manageActiveGameVote(isVoteComplete = false) {
    loading.value = true
    try {
      if (activeGame.value) {
        if (isVoteComplete) {
          const votes = await voteStore.getVotes()
          if (votes) {
            activeGame.value.votes = votes
          }
        } else {
          activeGame.value.votes = []
        }

        activeGame.value.isVoteComplete = isVoteComplete
        const updatedActiveGame = activeGame.value
        const result = await put<IGame>(URL, updatedActiveGame, true)
        activeGame.value = result
      }
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  const getPlayerById = (playerId: string) => {
    if (activeGame.value) {
      const player = activeGame.value.players.find((player) => player.id === playerId)
      return player
    } else {
      throw new Error("Active game not found")
    }
  }

  async function wsConnect() {
    if (!ws.value) {
      ws.value = await createWebSocketAsync(WS_ENDPOINT)
      onOpen(ws.value, WS_NAME)
      onClose(ws.value, WS_NAME, wsConnect)
      onError(ws.value, WS_NAME)

      ws.value.onmessage = (event) => {
        const result = JSON.parse(event.data) as IWsEntity<IGame>

        if (result.event === "INSERT") {
          if (result.data.type === "active") {
            activeGame.value = result.data
          }
        } else if (result.event === "MODIFY") {
          if (result.data.type === "active") {
            activeGame.value = result.data
          }
        }
      }
    }
  }

  function wsDisconnect() {
    if (ws.value) {
      close(ws.value, WS_NAME)
      ws.value = null
    }
  }

  return {
    activeGame,
    getActiveGame,
    createActiveGame,
    manageActiveGameVote,
    getPlayerById,
    wsConnect,
    wsDisconnect,
    loading,
    error
  }
})
