import { copy } from '@/copy'

export function Loader() {
  return (
    <div className="loader" role="status">
      <div className="loader__disc" aria-hidden />
      <p>{copy.common.loading}</p>
    </div>
  )
}
