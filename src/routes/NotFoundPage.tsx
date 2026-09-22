import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">404 — Page not found</h1>
      <Link to="/" className="mt-2 inline-block text-blue-600 hover:underline">
        Go back home
      </Link>
    </div>
  )
}
