import { useAuthStore } from '@/stores/auth.store'

export function useAuth() {
  const { token, user, isAuthenticated, setAuth, clearAuth } = useAuthStore()
  return { token, user, isAuthenticated, setAuth, clearAuth }
}
