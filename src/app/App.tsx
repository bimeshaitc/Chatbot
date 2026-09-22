import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppProvider } from './provider'
import { AppRouter } from './router'

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App
