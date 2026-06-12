import { create } from 'zustand'
import { apiClient } from '../services/apiClient'

export interface AuthUser {
  id: string
  email: string
  role: string
  firstName: string
  lastName: string
  avatarUrl: string | null
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isLoading: boolean
  isInitialized: boolean
  dashboardRole: 'SEEKER' | 'GUIDE' | null

  // Actions
  setAuth: (user: AuthUser, accessToken: string) => void
  clearAuth: () => void

  // API actions
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: string
  }) => Promise<void>
  login: (data: { email: string; password: string }) => Promise<void>
  googleLogin: (idToken: string) => Promise<void>
  linkedinLogin: (code: string) => Promise<void>
  fetchMe: () => Promise<void>
  refresh: () => Promise<void>
  logout: () => Promise<void>
  initialize: () => Promise<void>
  setDashboardRole: (role: 'SEEKER' | 'GUIDE') => void
  setAvatarUrl: (avatarUrl: string | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  isInitialized: false,
   dashboardRole: null,

  setAuth: (user, accessToken) => {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    set({ user, accessToken })
  },

  clearAuth: () => {
    delete apiClient.defaults.headers.common['Authorization']
    set({ user: null, accessToken: null })
  },

  register: async (data) => {
    set({ isLoading: true })
    try {
      const res = await apiClient.post('/auth/register', data)
      const { user, accessToken } = res.data
      get().setAuth(user, accessToken)
    } catch (error) {
      set({ isLoading: false })
      throw error // Re-throw so the component can handle it
    } finally {
      set({ isLoading: false })
    }
  },

  login: async (data) => {
    set({ isLoading: true })
    try {
      const res = await apiClient.post('/auth/login', data)
      const { user, accessToken } = res.data
      get().setAuth(user, accessToken)
    } catch (error) {
      set({ isLoading: false })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  googleLogin: async (idToken) => {
    set({ isLoading: true })
    try {
      const res = await apiClient.post('/auth/google', { idToken })
      const { user, accessToken } = res.data
      get().setAuth(user, accessToken)
    } finally {
      set({ isLoading: false })
    }
  },

  linkedinLogin: async (code) => {
    set({ isLoading: true })
    try {
      const res = await apiClient.post('/auth/linkedin', { code })
      const { user, accessToken } = res.data
      get().setAuth(user, accessToken)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchMe: async () => {
    const token = get().accessToken
    if (!token) return
    try {
      const res = await apiClient.get('/auth/me')
      set({ user: res.data.user })
    } catch {
      // Token invalid — try refresh
      await get().refresh()
    }
  },

  refresh: async () => {
    try {
      const res = await apiClient.post('/auth/refresh')
      const { user, accessToken } = res.data
      get().setAuth(user, accessToken)
    } catch {
      // Refresh failed — log out
      get().clearAuth()
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // Ignore errors on logout
    }
    get().clearAuth()
  },

  initialize: async () => {
    try {
      const res = await apiClient.post('/auth/refresh')
      const { user, accessToken } = res.data
      get().setAuth(user, accessToken)
    } catch {
      // No valid session — stay logged out
      get().clearAuth()
    }
    set({ isInitialized: true })
  },
  setDashboardRole: (role) => {
    set({ dashboardRole: role })
  },

  setAvatarUrl: (avatarUrl) => {
    const current = get().user
    if (!current) return
    set({ user: { ...current, avatarUrl } })
  },
}))

