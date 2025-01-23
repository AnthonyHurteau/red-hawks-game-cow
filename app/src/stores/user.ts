import { ref } from "vue"
import { defineStore } from "pinia"
import { getItem, setItem } from "@/services/localStorage"
import { v4 as uuidv4 } from "uuid"
import { get, post, put } from "@/services/api"
import { User, type IUser } from "@common/models/user"
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
  const loading = ref(false)

  async function getUser() {
    loading.value = true

    try {
      if (!user.value) {
        const userId = getUserIdFromStorage()
        await getOrCreateUserAsync(userId)
      }
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  const getUserIdFromStorage = () => {
    const result = getItem<string>(USER_KEY)
    let userId: string
    if (result) {
      userId = result
    } else {
      userId = uuidv4()
      setItem(USER_KEY, userId)
    }
    return userId
  }

  const getOrCreateUserAsync = async (userId: string) => {
    const getUrl = `${USER_URL}/${userId}`
    const result = await get<IUser>(getUrl)
    if (result) {
      result.lastLogin = new Date().toISOString()
      result.userAgent = navigator.userAgent
      const modifiedUser = await put<IUser>(USER_URL, result)
      user.value = modifiedUser
    } else {
      const newUser = new User({ id: userId })
      const result = await post<IUser>(USER_URL, newUser)
      user.value = result
    }
  }

  async function setAdmin(password: string) {
    loading.value = true
    try {
      if (user.value) {
        const auth: IAuth = new Auth(user.value, password)
        const result = await post<IAuth>(AUTH_URL, auth)
        user.value = result
      }
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { user, loading, getUser, setAdmin, error }
})
