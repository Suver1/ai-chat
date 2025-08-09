import { useEffect } from 'react'

/**
 * Triggers onEnter when Enter is pressed without modifier keys
 */
export function useEnterPress(
  ref: React.RefObject<HTMLElement | null>,
  onEnter: () => void
) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return
      if (e.shiftKey || e.ctrlKey || e.metaKey) return
      e.preventDefault()
      onEnter()
    }

    el.addEventListener('keydown', handler)
    return () => el.removeEventListener('keydown', handler)
  }, [ref, onEnter])
}

export default useEnterPress
