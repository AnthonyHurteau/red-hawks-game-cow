const APP_KEY = "rhgc"

const getKey = (key: string): string => `${APP_KEY}-${key}`

export const setItem = <T>(propKey: string, value: T): void => {
  try {
    const key = getKey(propKey)
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(key, serializedValue)
  } catch (error) {
    console.error(`Error setting item ${propKey} in localStorage`, error)
  }
}

export const getItem = <T>(propKey: string): T | null => {
  try {
    const key = getKey(propKey)
    const serializedValue = localStorage.getItem(key)

    if (serializedValue === null) {
      return null
    }

    // Check if the serialized value is a valid JSON string
    try {
      return JSON.parse(serializedValue) as T
    } catch {
      // If parsing fails, return the value as a string
      return serializedValue as T
    }
  } catch (error) {
    console.error(`Error getting item ${propKey} from localStorage`, error)
    return null
  }
}

export const removeItem = (propKey: string): void => {
  try {
    const key = getKey(propKey)
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing item ${propKey} from localStorage`, error)
  }
}
