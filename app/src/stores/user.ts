import { ref } from "vue"
import { defineStore } from "pinia"
import { getItem } from "@/services/localStorage"
import { v4 as uuidv4 } from "uuid"

const USER_KEY = "user"

export const useUserStore = defineStore("user", () => {
  const user = ref<string | null>(null)
  const error = ref<Error | null>(null)

  async function getUser() {
    try {
      const result = getItem<string>(USER_KEY)
      if (result) {
        user.value = result
      } else {
        const newUser = uuidv4()
        user.value = newUser

        localStorage.setItem(USER_KEY, newUser)
      }
    } catch (e) {
      error.value = e as Error
    }
  }

  return { user, getUser, error }
})
