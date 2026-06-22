import { api, tokenStore } from '@/services/api'
import { useAuthStore, type AuthUser } from '@/stores/auth.store'
import { findMockAccount } from '@/mocks/accounts'

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

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true'

function mockToken(user: AuthUser): string {
  return btoa(JSON.stringify({ userId: user.id, email: user.email, role: user.role }))
}

export const authService = {
  login: async (payload: LoginPayload) => {
    if (MOCK_MODE) {
      await new Promise((r) => setTimeout(r, 800))
      const account = findMockAccount(payload.email, payload.password)
      if (!account) throw new Error('Credenciais inválidas')
      const { password: _p, ...user } = account
      const token = mockToken(user)
      tokenStore.set(token)
      useAuthStore.getState().setAuth(token, user)
      return { token, expiresIn: 86400, user } as AuthResponse
    }

    const res = await api.post<AuthResponse>('/api/auth/login', payload)
    tokenStore.set(res.token)
    useAuthStore.getState().setAuth(res.token, res.user)
    return res
  },

  register: async (payload: RegisterPayload) => {
    if (MOCK_MODE) {
      await new Promise((r) => setTimeout(r, 1000))
      const user: AuthUser = {
        id: Date.now(),
        name: payload.name,
        email: payload.email,
        role: 'USER',
      }
      const token = mockToken(user)
      tokenStore.set(token)
      useAuthStore.getState().setAuth(token, user)
      return { token, expiresIn: 86400, user } as AuthResponse
    }

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
