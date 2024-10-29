import axios from "axios"

export const get = async <T>(
  url: string,
  query?: {
    [key: string]: string
  }
): Promise<T> => {
  try {
    if (query) {
      const response = await axios.get<T>(url, { params: query })
      return response.data
    } else {
      const response = await axios.get<T>(url)
      return response.data
    }
  } catch (error) {
    console.error("Error fetching data:", error)
    throw error
  }
}

export const post = async <T>(url: string, data: T): Promise<T> => {
  try {
    const response = await axios.post<T>(url, data)
    return response.data
  } catch (error) {
    console.error("Error creating data:", error)
    throw error
  }
}

export const put = async <T>(url: string, data: T): Promise<T> => {
  try {
    const response = await axios.put<T>(url, data)
    return response.data
  } catch (error) {
    console.error("Error updating data:", error)
    throw error
  }
}

export const remove = async <T>(url: string, id: string): Promise<boolean> => {
  try {
    await axios.delete<T>(url, { params: { id } })
    return true
  } catch (error) {
    console.error("Error deleting data:", error)
    throw error
  }
}
