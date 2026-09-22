import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import { useAuthStore } from '@/stores/useAuthStore'

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

function attachAuthHeader(config: InternalAxiosRequestConfig) {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

apiClient.interceptors.request.use(attachAuthHeader)

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// No refresh endpoint is documented for the user-login flow; this reuses the
// supplier auth controller's refresh endpoint, which re-issues an access token
// for whatever JWT is passed as the bearer token regardless of role.
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const { data } = await axios.post(
    `${env.apiUrl}/supplier/generate-access-token`,
    undefined,
    { headers: { Authorization: `Bearer ${refreshToken}` } },
  )
  return data.data.accessToken
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined
    const { refreshToken, setAccessToken, logout } = useAuthStore.getState()

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || !refreshToken) {
      if (error.response?.status === 401) logout()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      refreshPromise ??= refreshAccessToken(refreshToken).finally(() => {
        refreshPromise = null
      })
      const accessToken = await refreshPromise
      setAccessToken(accessToken)
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      logout()
      return Promise.reject(refreshError)
    }
  },
)
