import { ref } from "vue"
import { defineStore } from "pinia"
import { get, post, put, remove } from "@/services/api"
import { useUserStore } from "./user"
import { Vote, type IVote } from "@common/models/vote"
import type { IPlayer } from "@common/models/player"

const API_URL = import.meta.env.VITE_API_URL
const PATH = import.meta.env.VITE_VOTES_PATH
const URL = `${API_URL}/${PATH}`

export const useVoteStore = defineStore("votes", () => {
  const votes = ref<IVote[]>([])
  const vote = ref<IVote | null>(null)
  const loading = ref(false)
  const error = ref<Error>()

  const userStore = useUserStore()

  async function getVotes() {
    loading.value = true
    try {
      votes.value = await get<IVote[]>(URL)
      return votes.value
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function getVote() {
    loading.value = true
    try {
      const user = userStore.user
      if (user) {
        const url = `${URL}/${user.id}`
        vote.value = await get<IVote>(url)
      }
      return vote.value
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function setVote(playerId: string | null) {
    loading.value = true
    try {
      const user = userStore.user
      if (user) {
        if (playerId) {
          const newVote = new Vote({ userId: user.id, playerId: playerId })
          if (!vote.value) {
            const result = await post<IVote>(URL, newVote)
            vote.value = result
          } else if (vote.value.playerId !== playerId) {
            newVote.id = vote.value.id
            const result = await put<Vote>(URL, newVote)
            vote.value = result
          }
        } else {
          vote.value = new Vote()
          await remove<IVote>(URL, user.id)
        }
      }
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function deleteAllVotes() {
    loading.value = true
    try {
      const all = "all"
      await remove<IVote[]>(URL, all, true)
      votes.value = []
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function mockVotes(players: IPlayer[]) {
    loading.value = true
    try {
      const all = "all"
      await remove<IVote[]>(URL, all, true)

      const mockUri = `${URL}/mock`
      await post<IPlayer[]>(mockUri, players, true)
      await getVotes()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { vote, votes, getVote, getVotes, setVote, deleteAllVotes, mockVotes, loading, error }
})
