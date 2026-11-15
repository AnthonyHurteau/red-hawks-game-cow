import { ref } from "vue"
import { defineStore } from "pinia"
import { get, post, put, remove } from "@/services/api"
import type { IPlayer, PlayerType } from "@common/models/player"

const API_URL = import.meta.env.VITE_API_URL
const PLAYER_PATH = import.meta.env.VITE_PLAYERS_PATH
const URL = `${API_URL}${PLAYER_PATH}`

export type PlayerInput = Pick<IPlayer, "firstName" | "lastName" | "position">

const sortPlayers = (players: IPlayer[]) => {
  const positionOrder = { G: 1, D: 2, F: 3 }
  return [...players].sort((a, b) => {
    const positionComparison = positionOrder[a.position] - positionOrder[b.position]
    if (positionComparison !== 0) {
      return positionComparison
    }
    return a.firstName.localeCompare(b.firstName)
  })
}

export const usePlayerStore = defineStore("player", () => {
  const corePlayers = ref<IPlayer[]>([])
  const error = ref<Error>()
  const loading = ref(false)

  async function getCorePlayers(force = false) {
    loading.value = true
    try {
      if (force || corePlayers.value.length === 0) {
        const core: PlayerType = "core"
        // The API answers 204 with no body when the roster is empty
        const result = (await get<IPlayer[] | "">(URL, { type: core })) || []
        corePlayers.value = sortPlayers(result)
      }
      return corePlayers.value
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function createPlayer(input: PlayerInput) {
    loading.value = true
    try {
      const created = await post<PlayerInput & { type: PlayerType }, IPlayer>(URL, {
        ...input,
        type: "core"
      })
      corePlayers.value = sortPlayers([...corePlayers.value, created])
      return true
    } catch (e) {
      error.value = e as Error
      return false
    } finally {
      loading.value = false
    }
  }

  async function updatePlayer(player: IPlayer) {
    loading.value = true
    try {
      const updated = await put<IPlayer>(URL, player)
      corePlayers.value = sortPlayers(
        corePlayers.value.map((p) => (p.id === updated.id ? updated : p))
      )
      return true
    } catch (e) {
      error.value = e as Error
      return false
    } finally {
      loading.value = false
    }
  }

  async function deletePlayer(player: IPlayer) {
    loading.value = true
    try {
      await remove(URL, `${player.id}?type=${player.type}`)
      corePlayers.value = corePlayers.value.filter((p) => p.id !== player.id)
      return true
    } catch (e) {
      error.value = e as Error
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    corePlayers,
    getCorePlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
    loading,
    error
  }
})
