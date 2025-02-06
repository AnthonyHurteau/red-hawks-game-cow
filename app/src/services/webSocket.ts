export const CLOSED_MANUALLY = "closed manually"
const RECONNECT_INTERVAL = 5000

export const onOpen = (ws: WebSocket) => {
  ws.onopen = () => {
    console.log("WebSocket connection opened")
  }
}

export const onClose = (ws: WebSocket, reconnect: () => void) => {
  ws.onclose = (event) => {
    {
      console.log("WebSocket connection closed")
      if (event.code !== 1000) {
        setTimeout(() => {
          console.log("WebSocket reconnecting...")
          reconnect()
        }, RECONNECT_INTERVAL)
      }
    }
  }
}

export const onError = (ws: WebSocket) => {
  ws.onerror = (error) => {
    console.error("WebSocket error:", error)
  }
}

export const close = (ws: WebSocket) => {
  ws.close(1000, CLOSED_MANUALLY)
  console.log("WebSocket connection closed manually")
}
