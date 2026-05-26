import { api, tokenStore } from '@/services/api'

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
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const res = await api.post<AuthResponse>('/auth/login', payload)
    tokenStore.set(res.token)
    return res
  },

  register: async (payload: RegisterPayload) => {
    const res = await api.post<AuthResponse>('/auth/register', payload)
    tokenStore.set(res.token)
    return res
  },

  logout: () => {
    tokenStore.clear()
  },
}
