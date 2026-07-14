import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ThemeProvider } from '@/context/ThemeContext'
import { ShelfProvider } from '@/context/ShelfContext'
import { ProfileProvider } from '@/context/ProfileContext'
import { HomePage } from '@/pages/HomePage'
import { ExplorePage } from '@/pages/ExplorePage'
import { ShelfPage } from '@/pages/ShelfPage'
import { AlbumPage } from '@/pages/AlbumPage'
import { ArtistPage } from '@/pages/ArtistPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

  return (
    <ThemeProvider>
      <ProfileProvider>
        <ShelfProvider>
          <BrowserRouter basename={basename}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="explore" element={<ExplorePage />} />
                <Route path="shelf" element={<ShelfPage />} />
                <Route path="album/:id" element={<AlbumPage />} />
                <Route path="artist/:id" element={<ArtistPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ShelfProvider>
      </ProfileProvider>
    </ThemeProvider>
  )
}
