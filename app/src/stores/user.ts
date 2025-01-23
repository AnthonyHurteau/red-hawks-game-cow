import { ref } from "vue"
import { defineStore } from "pinia"
import { getItem } from "@/services/localStorage"
import { v4 as uuidv4 } from "uuid"
import { get, post } from "@/services/api"
import type { IUser } from "@common/models/user"
import { Auth, type IAuth } from "@common/models/auth"

const USER_KEY = "user"
const API_URL = import.meta.env.VITE_API_URL
const USER_PATH = import.meta.env.VITE_USERS_PATH
const USER_URL = `${API_URL}/${USER_PATH}`
const AUTH_PATH = import.meta.env.VITE_AUTH_PATH
const AUTH_URL = `${API_URL}/${AUTH_PATH}`

export const useUserStore = defineStore("user", () => {
  const user = ref<IUser>()
  const error = ref<Error>()
  const isAdmin = ref<boolean>(false)
  const loading = ref(false)

  async function getUser() {
    loading.value = true
    try {
      const result = getItem<string>(USER_KEY)
      let userId: string
      if (result) {
        userId = result
      } else {
        userId = uuidv4()

        localStorage.setItem(USER_KEY, userId)
      }
      await setIsUserAdmin(userId)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  const setIsUserAdmin = async (userId: string) => {
    const url = `${USER_URL}/${userId}`
    const result = await get<IUser>(url)
    user.value = result
    isAdmin.value = result.type === "admin"
  }

  async function setAdmin(password: string) {
    loading.value = true
    try {
      if (user.value) {
        const auth: IAuth = new Auth(user.value.id, password)
        const result = await post<Auth>(AUTH_URL, auth)
        isAdmin.value = result.isAdmin
      }
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { user, isAdmin, loading, getUser, setAdmin, error }
})
