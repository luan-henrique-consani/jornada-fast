import { api, tokenStore } from '@/services/api'
import { useAuthStore, type AuthUser } from '@/stores/auth.store'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  name: string
  email: string
  password: string
}

interface AuthResponse {
  token: string
  expiresIn: number
  user: AuthUser
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const res = await api.post<AuthResponse>('/api/auth/login', payload)
    tokenStore.set(res.token)
    useAuthStore.getState().setAuth(res.token, res.user)
    return res
  },

  register: async (payload: RegisterPayload) => {
    const res = await api.post<AuthResponse>('/api/auth/register', payload)
    tokenStore.set(res.token)
    useAuthStore.getState().setAuth(res.token, res.user)
    return res
  },

  logout: () => {
    tokenStore.clear()
    useAuthStore.getState().clearAuth()
  },
}
