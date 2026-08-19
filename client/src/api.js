const TOKEN_KEY = 'authToken'
const ACCOUNT_KEY = 'authAccount'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getAccount() {
  const raw = localStorage.getItem(ACCOUNT_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setSession(token, account) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ACCOUNT_KEY)
}

export async function apiFetch(path, options = {}, onUnauthorized) {
  const token = getToken()
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (res.status === 401) {
    clearSession()
    onUnauthorized?.()
  }

  return res
}
