import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { copy } from '@/copy'
import { useTheme } from '@/context/ThemeContext'
import { useShelf } from '@/context/ShelfContext'
import { useProfile } from '@/context/ProfileContext'
import { Modal } from '@/components/ui/Modal'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { vinyls } = useShelf()
  const { profile, avatarUrl, setName, reshuffleAvatar } = useProfile()
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [draftName, setDraftName] = useState(profile.name)

  const links = [
    { to: '/', label: copy.nav.home, end: true },
    { to: '/explore', label: copy.nav.explore },
    {
      to: '/shelf',
      label: `${copy.nav.shelf}${vinyls.length ? ` (${vinyls.length})` : ''}`,
    },
  ]

  const openProfile = () => {
    setDraftName(profile.name)
    setProfileOpen(true)
  }

  return (
    <header className="header">
      <div className="header__inner">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand__name">{copy.brand}</span>
          <span className="brand__tag">{copy.tagline}</span>
        </NavLink>

        <nav className="nav" aria-label="Main">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="header__actions">
          <button type="button" className="profile-btn" onClick={openProfile}>
            <img src={avatarUrl} alt="" />
            <span>{profile.name}</span>
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? '◑' : '◐'}
          </button>
          <button
            type="button"
            className="icon-btn menu-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <nav className="mobile-nav" aria-label="Mobile">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}

      <Modal
        open={profileOpen}
        title="Profile"
        onClose={() => setProfileOpen(false)}
      >
        <div className="modal__preview">
          <img
            src={avatarUrl}
            alt=""
            style={{ width: 72, height: 72, borderRadius: '50%' }}
          />
          <div>
            <strong>{profile.name}</strong>
            <span>Saved in this browser</span>
          </div>
        </div>
        <label>
          Name
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            maxLength={24}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'var(--bg)',
              color: 'var(--ink)',
              padding: '0.7rem 0.8rem',
            }}
          />
        </label>
        <div className="modal__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setName(draftName)
              setProfileOpen(false)
            }}
          >
            Save
          </button>
          <button type="button" className="btn btn--ghost" onClick={reshuffleAvatar}>
            Change avatar
          </button>
        </div>
      </Modal>
    </header>
  )
}
