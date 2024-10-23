import axios from "axios"

export const get = async <T>(url: string): Promise<T> => {
  try {
    const response = await axios.get<T>(url)
    return response.data
  } catch (error) {
    console.error("Error fetching data:", error)
    throw error
  }
}
