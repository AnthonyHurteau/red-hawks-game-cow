import axios, { AxiosHeaders, type AxiosRequestHeaders, type AxiosResponse } from "axios"
import { getItem } from "./localStorage"
import { USER_KEY } from "@/stores/user"

export const get = async <T>(
  url: string,
  query?: {
    [key: string]: string
  },
  auth = true
): Promise<T> => {
  try {
    const headers = auth ? getAuthorizationHeaders() : undefined
    const response = await axios.get<T>(url, { params: query, headers })
    return response.data
  } catch (error) {
    console.error("Error fetching data:", error)
    throw error
  }
}

export const post = async <T>(url: string, data: T, auth = true): Promise<T> => {
  try {
    const headers = auth ? getAuthorizationHeaders() : undefined
    const response = await axios.post<T>(url, data, { headers })
    return response.data
  } catch (error) {
    console.error("Error creating data:", error)
    throw error
  }
}

export const put = async <T>(url: string, data: T, auth = true): Promise<T> => {
  try {
    const headers = auth ? getAuthorizationHeaders() : undefined
    const response = await axios.put<T>(url, data, { headers })
    return response.data
  } catch (error) {
    console.error("Error updating data:", error)
    throw error
  }
}

export const remove = async <T>(url: string, id: string, auth = true): Promise<AxiosResponse> => {
  try {
    const uri = `${url}/${id}`
    const headers = auth ? getAuthorizationHeaders() : undefined
    const response = await axios.delete<T>(uri, { headers })
    return response
  } catch (error) {
    console.error("Error deleting data:", error)
    throw error
  }
}

const getAuthorizationHeaders = (): AxiosRequestHeaders => {
  const userId = getItem<string>(USER_KEY)
  const headers = new AxiosHeaders()
  headers.set("Authorization", userId)
  return headers
}
