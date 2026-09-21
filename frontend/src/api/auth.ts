import { apiFetch } from './client'

export type User = {
  id: number
  name: string
  email: string
  profile_pic: string | null
}

export type AuthResponse = {
  user: User
  token: string
}

export function register(payload: {
  name: string
  email: string
  password: string
  password_confirmation: string
}) {
  return apiFetch<AuthResponse>('/register', { method: 'POST', body: payload })
}

export function login(payload: { email: string; password: string }) {
  return apiFetch<AuthResponse>('/login', { method: 'POST', body: payload })
}

export function logout(token: string) {
  return apiFetch<{ message: string }>('/logout', { method: 'POST', token })
}

export function getCurrentUser(token: string) {
  return apiFetch<User>('/user', { token })
}

export function uploadProfilePicture(token: string, photo: File) {
  const body = new FormData()
  body.append('photo', photo)
  return apiFetch<User>('/user/profile-picture', { method: 'POST', body, token })
}
