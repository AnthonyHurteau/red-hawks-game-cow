import { ref } from "vue"
import { defineStore } from "pinia"
import { getItem, removeItem, setItem } from "@/services/localStorage"
import { post, put } from "@/services/api"
import { type IUser } from "@common/models/user"
import type { ISession } from "@common/models/session"

// The session token the API hands out. No password for players: the app gets
// one automatically the first time and keeps it in local storage.
export const TOKEN_KEY = "token"
// Pre-token versions stored the raw user id here; it is no longer accepted.
const LEGACY_USER_KEY = "user"
const API_URL = import.meta.env.VITE_API_URL
const USER_PATH = import.meta.env.VITE_USERS_PATH
const USER_URL = `${API_URL}${USER_PATH}`

export const getToken = () => getItem<string>(TOKEN_KEY)

export const useUserStore = defineStore("user", () => {
  const user = ref<IUser>()
  const error = ref<Error>()
  const loading = ref(false)

  const saveSession = (session: ISession) => {
    setItem(TOKEN_KEY, session.token)
    user.value = session.user
  }

  async function getUser() {
    loading.value = true

    try {
      if (!user.value) {
        removeItem(LEGACY_USER_KEY)
        if (getToken()) {
          try {
            // Refresh lastLogin; fails if the token expired or the user was removed.
            user.value = await put<Partial<IUser>, IUser>(USER_URL, { userAgent: navigator.userAgent })
            return
          } catch {
            removeItem(TOKEN_KEY)
          }
        }
        const session = await post<Partial<IUser>, ISession>(USER_URL, { userAgent: navigator.userAgent }, false)
        saveSession(session)
      }
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function setAdmin(password: string) {
    loading.value = true
    try {
      if (user.value) {
        const session = await post<{ password: string }, ISession>(`${USER_URL}/admin`, { password })
        saveSession(session)
      }
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { user, loading, getUser, setAdmin, error }
})
