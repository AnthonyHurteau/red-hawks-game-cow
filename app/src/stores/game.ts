import { ref } from "vue"
import { defineStore } from "pinia"
import { get, post, put } from "@/services/api"
import { Game, type GameType, type IGame } from "@common/models/game"
import { useVoteStore } from "./vote"
import { usePlayerStore } from "./player"

const API_URL = import.meta.env.VITE_API_URL
const PATH = import.meta.env.VITE_GAMES_PATH
const URL = `${API_URL}/${PATH}`

export const useGameStore = defineStore("game", () => {
  const activeGame = ref<IGame | null>(null)
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

  return {
    activeGame,
    getActiveGame,
    createActiveGame,
    manageActiveGameVote,
    getPlayerById,
    loading,
    error
  }
})
