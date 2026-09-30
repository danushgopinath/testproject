import { useEffect } from 'react'
import Lenis from 'lenis'

// Momentum/eased page scrolling (Lenis) — the gradual "many websites" feel.
// Enabled only where it's wanted (marketing pages) so it never fights the
// app's internal scroll containers (dashboard lists, chat, modals).
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      lerp: 0.09,           // lower = more gradual glide
      wheelMultiplier: 0.9, // slightly slower than native so it's controlled, not fast
      smoothWheel: true,
    })

    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [enabled])
}
