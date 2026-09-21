const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export class ApiError extends Error {
  status: number
  fieldErrors?: Record<string, string[]>

  constructor(message: string, status: number, fieldErrors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options
  const isFormData = body instanceof FormData

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (body !== undefined && !isFormData) {
    // Per FormData il browser imposta da solo Content-Type con il boundary multipart corretto.
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  })

  const isJson = response.headers.get('content-type')?.includes('application/json') ?? false
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    const message = data?.message ?? 'Si è verificato un errore imprevisto.'
    throw new ApiError(message, response.status, data?.errors)
  }

  return data as T
}
