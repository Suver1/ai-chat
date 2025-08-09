import { useCallback, useEffect } from 'react'

interface Options {
  enabled?: boolean
  maxViewportFraction?: number // e.g. 0.5 for 50vh
}

/**
 * Auto-grow behavior up to a fraction of the viewport height.
 * Adds/updates inline height; toggles overflow when cap reached.
 */
export function useAutoGrowTextarea(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  { enabled = true, maxViewportFraction = 0.5 }: Options = {}
) {
  const resize = useCallback(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return
    const maxPx = window.innerHeight * maxViewportFraction
    el.style.overflowY = 'hidden'
    el.style.height = 'auto'
    const newHeight = Math.min(el.scrollHeight, maxPx)
    el.style.height = newHeight + 'px'
    el.style.overflowY = el.scrollHeight > maxPx ? 'auto' : 'hidden'
  }, [enabled, maxViewportFraction, ref])

  useEffect(() => {
    if (!enabled) return
    resize()
    const onResize = () => resize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [enabled, resize])

  const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
    if (!enabled) return
    resize()
  }

  return { onInput: handleInput, autoGrow: resize }
}
