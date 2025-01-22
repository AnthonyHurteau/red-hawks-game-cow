import { ref } from "vue"
import { defineStore } from "pinia"
import { get, post, put, remove } from "@/services/api"
import { Vote } from "../../../common/models/vote"
import { useUserStore } from "./user"

const API_URL = import.meta.env.VITE_VOTE_API_URL
const ENDPOINT = "votes"
const URL = `${API_URL}/${ENDPOINT}`

export const useVotesStore = defineStore("votes", () => {
  const votes = ref<Vote[]>([])
  const vote = ref<Vote>(new Vote())
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const userStore = useUserStore()

  async function getVotes() {
    loading.value = true
    try {
      votes.value = await get<Vote[]>(URL)
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
        vote.value = await get<Vote>(URL, { userId: user })
      }
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
          const newVote = new Vote("", user, playerId)
          if (!vote.value) {
            await post<Vote>(URL, newVote)
            vote.value = await get<Vote>(URL, { userId: user })
          } else if (vote.value.playerId !== playerId) {
            newVote.id = vote.value.id
            await put<Vote>(URL, newVote)
            vote.value = newVote
          }
        } else {
          vote.value = new Vote()
          await remove(URL, user)
        }
      }
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function mockVotes() {
    loading.value = true
    try {
      await get<string>(URL, { mockVote: "true" })
      await getVotes()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { vote, votes, getVote, getVotes, setVote, mockVotes, loading, error }
})
