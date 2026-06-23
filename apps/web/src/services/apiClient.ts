import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1'

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout
})

// Request interceptor — dev logging only
apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => {
    console.error('[API] Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor — log errors + auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('[API] Response error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    })

    const originalRequest = error.config
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh' &&
      originalRequest.url !== '/auth/login'
    ) {
      originalRequest._retry = true
      try {
        // Lazily import to avoid circular dependency at module load time
        const { useAuthStore } = await import('../stores/authStore')
        const refreshToken = useAuthStore.getState().refreshToken
        const res = await apiClient.post('/auth/refresh', { refreshToken })
        const { accessToken } = res.data
        useAuthStore.getState().setAuth(res.data.user, accessToken, res.data.refreshToken ?? null)
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch {
        const { useAuthStore } = await import('../stores/authStore')
        useAuthStore.getState().clearAuth()
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)
