import { useEffect, useState } from 'react'
import { readStorage, writeStorage } from '@/utils/storage'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() =>
    readStorage(localStorage, key, initialValue),
  )

  useEffect(() => {
    writeStorage(localStorage, key, value)
  }, [key, value])

  return [value, setValue] as const
}

export function useSessionStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() =>
    readStorage(sessionStorage, key, initialValue),
  )

  useEffect(() => {
    writeStorage(sessionStorage, key, value)
  }, [key, value])

  return [value, setValue] as const
}
