import { useUserStore } from "@/stores/user"
import type { IUser } from "@common/models/user"

export const CLOSED_MANUALLY = "closed manually"
const RECONNECT_INTERVAL = 5000

export const createWebSocketAsync = async (endpoint: string) => {
  const userStore = useUserStore()
  const user: IUser = await new Promise((resolve) => {
    const unsubscribe = userStore.$subscribe((mutation, state) => {
      if (state.user) {
        unsubscribe()
        resolve(state.user)
      }
    })

    if (userStore.user) {
      unsubscribe()
      resolve(userStore.user)
    }
  })

  const url = `${endpoint}?userId=${user.id}`
  const ws = new WebSocket(url)
  return ws
}

export const onOpen = (ws: WebSocket, name: string) => {
  ws.onopen = () => {
    console.log(`${name} WebSocket connection opened`)
  }
}

export const onClose = (ws: WebSocket, name: string, reconnect: () => void) => {
  ws.onclose = (event) => {
    {
      console.log(`${name} WebSocket connection closed`)
      if (event.code !== 1000) {
        setTimeout(() => {
          console.log(`Reconnecting ${name} WebSocket connection...`)
          reconnect()
        }, RECONNECT_INTERVAL)
      }
    }
  }
}

export const onError = (ws: WebSocket, name: string) => {
  ws.onerror = (error) => {
    console.error(`${name} WebSocket error: ${error}`)
  }
}

export const close = (ws: WebSocket, name: string) => {
  ws.close(1000, CLOSED_MANUALLY)
  console.log(`${name} WebSocket connection closed manually`)
}
