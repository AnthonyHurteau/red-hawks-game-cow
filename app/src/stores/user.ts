import { ref } from "vue"
import { defineStore } from "pinia"
import { getItem } from "@/services/localStorage"
import { v4 as uuidv4 } from "uuid"
import { post } from "@/services/api"
import type { Auth } from "../../../common/models/auth"

const USER_KEY = "user"
const API_URL = import.meta.env.VITE_USER_API_URL
const ENDPOINT = "users"
const URL = `${API_URL}/${ENDPOINT}`

export const useUserStore = defineStore("user", () => {
  const user = ref<string | null>(null)
  const error = ref<Error | null>(null)
  const isAdmin = ref<boolean>(false)

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

  async function setAdmin(password: string) {
    try {
      if (user.value) {
        const auth: Auth = { userId: user.value, password, isAdmin: false }
        const result = await post<Auth>(URL, auth)
        if (result.isAdmin) {
          isAdmin.value = result.isAdmin
        }
      }
    } catch (e) {
      error.value = e as Error
    }
  }

  return { user, isAdmin, getUser, setAdmin, error }
})
