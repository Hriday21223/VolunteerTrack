import { useEffect, useState, useCallback } from 'react'
import { read, write } from '@/lib/storage.js'

/** Like useState, but mirrors to localStorage. JSON-serialized. */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => read(key, initial))

  useEffect(() => {
    write(key, value)
  }, [key, value])

  const reset = useCallback(() => setValue(initial), [initial])
  return [value, setValue, reset]
}
