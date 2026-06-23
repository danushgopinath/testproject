import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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
  refreshToken: string | null
  isLoading: boolean
  isInitialized: boolean
  dashboardRole: 'SEEKER' | 'GUIDE' | null

  // Actions
  setAuth: (user: AuthUser, accessToken: string, refreshToken?: string | null) => void
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isInitialized: false,
      dashboardRole: null,

      setAuth: (user, accessToken, refreshToken) => {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        set({ user, accessToken, ...(refreshToken !== undefined ? { refreshToken } : {}) })
      },

      clearAuth: () => {
        delete apiClient.defaults.headers.common['Authorization']
        set({ user: null, accessToken: null, refreshToken: null })
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const res = await apiClient.post('/auth/register', data)
          const { user, accessToken, refreshToken } = res.data
          get().setAuth(user, accessToken, refreshToken ?? null)
        } catch (error) {
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      login: async (data) => {
        set({ isLoading: true })
        try {
          const res = await apiClient.post('/auth/login', data)
          const { user, accessToken, refreshToken } = res.data
          get().setAuth(user, accessToken, refreshToken ?? null)
        } catch (error) {
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      googleLogin: async (idToken) => {
        set({ isLoading: true })
        try {
          const res = await apiClient.post('/auth/google', { idToken })
          const { user, accessToken, refreshToken } = res.data
          get().setAuth(user, accessToken, refreshToken ?? null)
        } finally {
          set({ isLoading: false })
        }
      },

      linkedinLogin: async (code) => {
        set({ isLoading: true })
        try {
          const res = await apiClient.post('/auth/linkedin', { code })
          const { user, accessToken, refreshToken } = res.data
          get().setAuth(user, accessToken, refreshToken ?? null)
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
          await get().refresh()
        }
      },

      refresh: async () => {
        try {
          const res = await apiClient.post('/auth/refresh', { refreshToken: get().refreshToken })
          const { user, accessToken, refreshToken } = res.data
          get().setAuth(user, accessToken, refreshToken ?? null)
        } catch {
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
        // Rehydration already restored any persisted session; make sure the
        // Authorization header reflects it.
        const persisted = get()
        if (persisted.accessToken) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${persisted.accessToken}`
        }
        try {
          const res = await apiClient.post('/auth/refresh', { refreshToken: persisted.refreshToken })
          const { user, accessToken, refreshToken } = res.data
          get().setAuth(user, accessToken, refreshToken ?? null)
        } catch {
          // Refresh failed — only drop the session if we had nothing persisted.
          // (Keeps the user logged in when the refresh cookie is blocked but a
          // valid access token is still cached.)
          if (!persisted.user || !persisted.accessToken) {
            get().clearAuth()
          }
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
    }),
    {
      name: 'expertify-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        dashboardRole: s.dashboardRole,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`
        }
      },
    },
  ),
)