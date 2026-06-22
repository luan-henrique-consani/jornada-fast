import type { AuthUser } from '@/stores/auth.store'

export interface MockAccount extends AuthUser {
  password: string
}

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: 1,
    name: 'Rafael Mendes',
    email: 'admin@fastgondulas.com.br',
    role: 'ADMIN',
    password: 'Admin@2026',
  },
  {
    id: 2,
    name: 'Carolina Santos',
    email: 'operador@fastgondulas.com.br',
    role: 'USER',
    password: 'Operador@2026',
  },
]

export function findMockAccount(email: string, password: string): MockAccount | null {
  return (
    MOCK_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
    ) ?? null
  )
}
