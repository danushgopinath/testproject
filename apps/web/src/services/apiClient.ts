import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1'

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
})

