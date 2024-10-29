export const setItem = <T>(key: string, value: T): void => {
  try {
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(key, serializedValue)
  } catch (error) {
    console.error(`Error setting item ${key} in localStorage`, error)
  }
}

export const getItem = <T>(key: string): T | null => {
  try {
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
    console.error(`Error getting item ${key} from localStorage`, error)
    return null
  }
}

export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing item ${key} from localStorage`, error)
  }
}
