import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'

export function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
