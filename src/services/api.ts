import axios, { type InternalAxiosRequestConfig } from 'axios'
import { API_URL } from '../config'
import { useAuthStore } from '../store/authStore'
import { authService } from './authService'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshPromise: ReturnType<typeof authService.refresh> | null = null

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const originalRequest = error.config as RetryConfig | undefined
    if (!originalRequest) {
      return Promise.reject(error)
    }

    const { refreshToken, logout } = useAuthStore.getState()
    const endSession = () => {
      logout()
      window.location.assign('/login')
    }

    if (originalRequest._retry) {
      endSession()
      return Promise.reject(error)
    }

    originalRequest._retry = true
    if (!refreshToken) {
      endSession()
      return Promise.reject(error)
    }

    let tokens: Awaited<ReturnType<typeof authService.refresh>>
    try {
      refreshPromise ??= authService.refresh(refreshToken)
      tokens = await refreshPromise
    } catch (refreshError: unknown) {
      endSession()
      return Promise.reject(refreshError)
    } finally {
      refreshPromise = null
    }

    useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken)
    originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
    return api(originalRequest)
  },
)
