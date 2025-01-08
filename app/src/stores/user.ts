import { ref } from "vue"
import { defineStore } from "pinia"
import { getItem } from "@/services/localStorage"
import { v4 as uuidv4 } from "uuid"
import { get, post } from "@/services/api"
import type { Auth } from "../../../common/models/auth"
import type { User } from "../../../common/models/user"

const USER_KEY = "user"
const API_URL = import.meta.env.VITE_USER_API_URL
const ENDPOINT = "users"
const URL = `${API_URL}/${ENDPOINT}`

export const useUserStore = defineStore("user", () => {
  const user = ref<string | null>(null)
  const error = ref<Error | null>(null)
  const isAdmin = ref<boolean>(false)
  const loading = ref(false)

  async function getUser() {
    loading.value = true
    try {
      const result = getItem<string>(USER_KEY)
      if (result) {
        user.value = result
      } else {
        const newUser = uuidv4()
        user.value = newUser

        localStorage.setItem(USER_KEY, newUser)
      }
      await setIsUserAdmin(user.value)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  const setIsUserAdmin = async (userId: string) => {
    const result = await get<User>(URL, { userId })
    isAdmin.value = result.isAdmin
  }

  async function setAdmin(password: string) {
    loading.value = true
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
    } finally {
      loading.value = false
    }
  }

  return { user, isAdmin, loading, getUser, setAdmin, error }
})
