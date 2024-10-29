import { ref } from "vue"
import { defineStore } from "pinia"
import { get, post } from "@/services/api"
import { GameInit, type Game } from "../../../common/models/game"

const API_URL = import.meta.env.VITE_GAME_API_URL
const ENDPOINT = "games"
const URL = `${API_URL}/${ENDPOINT}`

export const useGamesStore = defineStore("games", () => {
  const games = ref<Game[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function getGames() {
    loading.value = true
    try {
      games.value = await get<Game[]>(URL)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function createGame() {
    try {
      const newGame = new GameInit()
      const result = await post<Game>(URL, newGame)
      games.value.push(result)
    } catch (e) {
      error.value = e as Error
    }
  }

  return { games, getGames, createGame, loading, error }
})
