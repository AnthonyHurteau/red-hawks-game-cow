import { ref } from "vue"
import { defineStore } from "pinia"
import { get, post, put } from "@/services/api"
import { ActiveGameInit, type ActiveGame } from "../../../common/models/game"

const API_URL = import.meta.env.VITE_ACTIVE_GAME_API_URL
const ENDPOINT = "activeGame"
const URL = `${API_URL}/${ENDPOINT}`

export const useActiveGameStore = defineStore("activeGame", () => {
  const activeGame = ref<ActiveGame>()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function getActiveGame() {
    loading.value = true
    try {
      activeGame.value = await get<ActiveGame>(URL)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function createActiveGame() {
    try {
      if (!activeGame.value || (activeGame.value && !activeGame.value.isVoteComplete)) {
        const newActiveGame = new ActiveGameInit()
        const result = await post<ActiveGame>(URL, newActiveGame)
        activeGame.value = result
      }
    } catch (e) {
      error.value = e as Error
    }
  }

  async function closeActiveGameVote() {
    try {
      if (activeGame.value) {
        activeGame.value.isVoteComplete = true
        const updatedActiveGame = activeGame.value
        const result = await put<ActiveGame>(URL, updatedActiveGame)
        activeGame.value = result
      }
    } catch (e) {
      error.value = e as Error
    }
  }

  return { activeGame, getActiveGame, createActiveGame, closeActiveGameVote, loading, error }
})
