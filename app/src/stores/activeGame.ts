import { ref } from "vue"
import { defineStore } from "pinia"
import { get } from "@/services/api"
import type { ActiveGame } from "../../../common/models/game"

const API_URL = import.meta.env.VITE_ACTIVE_GAME_API_URL
const ENDPOINT = "activeGame"

export const useActiveGameStore = defineStore("counter", () => {
  const activeGame = ref<ActiveGame>()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function getActiveGame() {
    loading.value = true
    try {
      activeGame.value = await get<ActiveGame>(`${API_URL}/${ENDPOINT}`)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { activeGame, getActiveGame, loading, error }
})
