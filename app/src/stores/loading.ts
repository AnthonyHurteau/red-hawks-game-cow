import { ref } from "vue"
import { defineStore } from "pinia"

export const useLoadingStore = defineStore("loading", () => {
  const voteLoading = ref(false)
  const adminLoading = ref(false)

  function setVoteLoading(value: boolean) {
    voteLoading.value = value
  }

  function setAdminLoading(value: boolean) {
    adminLoading.value = value
  }

  return {
    voteLoading,
    adminLoading,
    setVoteLoading,
    setAdminLoading
  }
})
