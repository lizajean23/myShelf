import { Link } from 'react-router-dom'
import { copy } from '@/copy'

export function NotFoundPage() {
  return (
    <div className="page">
      <div className="state-block">
        <h1>404</h1>
        <p style={{ margin: '0.75rem 0 1.25rem' }}>{copy.common.error}</p>
        <Link to="/" className="btn btn--primary">
          {copy.nav.home}
        </Link>
      </div>
    </div>
  )
}
