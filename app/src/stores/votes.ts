import { ref } from "vue"
import { defineStore } from "pinia"
import { get, post, put, remove } from "@/services/api"
import type { Vote } from "../../../common/models/vote"
import { useUserStore } from "./user"

const API_URL = import.meta.env.VITE_VOTE_API_URL
const ENDPOINT = "votes"
const URL = `${API_URL}/${ENDPOINT}`

export const useVotesStore = defineStore("votes", () => {
  const votes = ref<Vote[]>([])
  const vote = ref<Vote | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const userStore = useUserStore()

  async function getVote() {
    loading.value = true
    try {
      const user = userStore.user
      if (user) {
        vote.value = await get<Vote>(URL, { userId: user })
      }
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function setVote(playerId: string) {
    loading.value = true
    try {
      const user = userStore.user
      if (user) {
        const newVote: Vote = { id: "", userId: user, playerId }
        if (!vote.value) {
          vote.value = await post<Vote>(URL, newVote)
        } else if (vote.value.playerId !== playerId) {
          newVote.id = vote.value.id
          vote.value = await put<Vote>(URL, newVote)
        } else if (vote.value.playerId === playerId) {
          vote.value = null
          await remove(URL, user)
        }
      }
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { votes, getVote, setVote, loading, error }
})