import { useState, useEffect } from 'react'

// Tailwind default breakpoints (sync with tailwind.config.js if customized)
export const sm = 640
export const md = 768
export const lg = 1024
export const xl = 1280
export const twoXl = 1536

export const breakpoints = { sm, md, lg, xl, twoXl }

/**
 * useWindowWidth
 *  - Returns current window width (updates throttled via rAF)
 *  - Optional onChange callback invoked after width state updates (and once on mount)
 *
 * Usage:
 *   const width = useWindowWidth()
 *   // or with a side-effect
 *   useWindowWidth(w => { if (w >= md) doSomething() })
 */
export function useWindowWidth(onChange?: (width: number) => void) {
  const [width, setWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : md
  )

  useEffect(() => {
    let frame: number | null = null
    const apply = () => {
      const w = window.innerWidth
      setWidth(w)
      if (onChange) onChange(w)
    }
    const handle = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(apply)
    }
    window.addEventListener('resize', handle)
    // Initial callback invoke (after mount to ensure browser env)
    apply()
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('resize', handle)
    }
  }, [onChange])

  return width
}
