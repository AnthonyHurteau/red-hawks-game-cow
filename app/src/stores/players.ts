import { ref } from "vue"
import { defineStore } from "pinia"
import { get } from "@/services/api"
import type { Player } from "../../../common/models/player"

export const usePlayersStore = defineStore("counter", () => {
  const players = ref<Player[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function getPlayers() {
    loading.value = true
    try {
      players.value = await get<Player[]>("players")
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { players, getPlayers, loading, error }
})
