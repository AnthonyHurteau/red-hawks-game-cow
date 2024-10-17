import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL

export const get = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await axios.get<T>(`${API_URL}/${endpoint}`)
    return response.data
  } catch (error) {
    console.error("Error fetching data:", error)
    throw error
  }
}
