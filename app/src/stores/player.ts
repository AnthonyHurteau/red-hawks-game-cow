import { ref } from "vue"
import { defineStore } from "pinia"
import { get } from "@/services/api"
import type { IPlayer, PlayerType } from "@common/models/player"

const API_URL = import.meta.env.VITE_API_URL
const PLAYER_PATH = import.meta.env.VITE_PLAYERS_PATH
const URL = `${API_URL}/${PLAYER_PATH}`

export const usePlayerStore = defineStore("player", () => {
  const corePlayers = ref<IPlayer[]>([])
  const error = ref<Error>()
  const loading = ref(false)

  async function getCorePlayers() {
    loading.value = true
    try {
      if (corePlayers.value.length === 0) {
        const core: PlayerType = "core"
        const result = await get<IPlayer[]>(URL, { type: core })
        result.sort((a, b) => {
          const positionOrder = { G: 1, D: 2, F: 3 }
          const positionComparison = positionOrder[a.position] - positionOrder[b.position]
          if (positionComparison !== 0) {
            return positionComparison
          }
          return a.firstName.localeCompare(b.firstName)
        })
        corePlayers.value = result
      }
      return corePlayers.value
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { corePlayers, getCorePlayers, loading, error }
})
