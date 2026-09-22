const getEnvVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key] ?? fallback
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

export const env = {
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:3000/api'),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
