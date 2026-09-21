import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import type { User } from '../api/auth'
import { ApiError } from '../api/client'

const STORAGE_KEY = 'astra.auth'

type StoredAuth = { user: User; token: string }

type AuthContextValue = {
  user: User | null
  token: string | null
  loading: boolean
  register: (payload: Parameters<typeof authApi.register>[0]) => Promise<void>
  login: (payload: Parameters<typeof authApi.login>[0]) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredAuth) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = readStoredAuth()
    if (stored) {
      setUser(stored.user)
      setToken(stored.token)
    }
    setLoading(false)
  }, [])

  function persist(auth: StoredAuth | null) {
    try {
      if (auth) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // localStorage non disponibile (es. modalità privata): lo stato in memoria resta comunque valido
    }
    setUser(auth?.user ?? null)
    setToken(auth?.token ?? null)
  }

  async function register(payload: Parameters<typeof authApi.register>[0]) {
    const auth = await authApi.register(payload)
    persist(auth)
  }

  async function login(payload: Parameters<typeof authApi.login>[0]) {
    const auth = await authApi.login(payload)
    persist(auth)
  }

  async function logout() {
    if (token) {
      try {
        await authApi.logout(token)
      } catch (error) {
        if (!(error instanceof ApiError)) {
          throw error
        }
      }
    }
    persist(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve essere usato dentro un AuthProvider')
  }
  return context
}
