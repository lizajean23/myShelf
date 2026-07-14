import { useLocalStorage } from '@/hooks/useStorage'
import { STORAGE_KEYS } from '@/utils/storage'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'

const DISPLAY_NAMES = [
  'Alex',
  'Sam',
  'Jordan',
  'Riley',
  'Casey',
  'Morgan',
  'Quinn',
  'Taylor',
]

export interface Profile {
  name: string
  seed: string
}

interface ProfileContextValue {
  profile: Profile
  avatarUrl: string
  setName: (name: string) => void
  reshuffleAvatar: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

function randomSeed() {
  return Math.random().toString(36).slice(2, 10)
}

function randomName() {
  return DISPLAY_NAMES[Math.floor(Math.random() * DISPLAY_NAMES.length)]
}

function buildAvatar(seed: string) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=5c3224,2a1410,8b5340`
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useLocalStorage<Profile>(STORAGE_KEYS.profile, {
    name: randomName(),
    seed: randomSeed(),
  })

  const setName = useCallback(
    (name: string) => {
      const trimmed = name.trim().slice(0, 24)
      if (!trimmed) return
      setProfile((prev) => ({ ...prev, name: trimmed }))
    },
    [setProfile],
  )

  const reshuffleAvatar = useCallback(() => {
    setProfile((prev) => ({ ...prev, seed: randomSeed() }))
  }, [setProfile])

  const value = useMemo(
    () => ({
      profile,
      avatarUrl: buildAvatar(profile.seed),
      setName,
      reshuffleAvatar,
    }),
    [profile, setName, reshuffleAvatar],
  )

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
