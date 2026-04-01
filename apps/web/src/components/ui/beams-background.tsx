import { useEffect, useRef } from 'react'

interface Beam {
  x: number
  y: number
  width: number
  length: number
  angle: number
  speed: number
  opacity: number
  hue: number
  pulse: number
  pulseSpeed: number
}

function createBeam(width: number, height: number): Beam {
  const angle = -35 + Math.random() * 10
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle,
    speed: 0.6 + Math.random() * 1.2,
    opacity: 0.12 + Math.random() * 0.16,
    hue: 190 + Math.random() * 70,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  }
}

const opacityMap = { subtle: 0.7, medium: 0.85, strong: 1 }

interface BeamsBackgroundProps {
  className?: string
  children?: React.ReactNode
  intensity?: 'subtle' | 'medium' | 'strong'
}

export function BeamsBackground({
  className = '',
  children,
  intensity = 'strong',
}: BeamsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const beamsRef = useRef<Beam[]>([])
  const frameRef = useRef<number>(0)
  const MINIMUM_BEAMS = 20

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = canvas.parentElement

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = window.innerWidth
      const h = container ? container.scrollHeight : window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.scale(dpr, dpr)
      beamsRef.current = Array.from(
        { length: Math.floor(MINIMUM_BEAMS * 1.5) },
        () => createBeam(w, h)
      )
    }

    // Wait one frame so children have rendered before measuring container height
    const rafId = requestAnimationFrame(updateSize)
    window.addEventListener('resize', updateSize)

    function resetBeam(beam: Beam, index: number, total: number) {
      const col = index % 3
      const spacing = window.innerWidth / 3
      beam.y = window.innerHeight + 100
      beam.x = col * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5
      beam.width = 100 + Math.random() * 100
      beam.speed = 0.5 + Math.random() * 0.4
      beam.hue = 190 + (index * 70) / total
      beam.opacity = 0.2 + Math.random() * 0.1
      return beam
    }

    function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
      ctx.save()
      ctx.translate(beam.x, beam.y)
      ctx.rotate((beam.angle * Math.PI) / 180)
      const pulsingOpacity =
        beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * opacityMap[intensity]
      const grad = ctx.createLinearGradient(0, 0, 0, beam.length)
      grad.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`)
      grad.addColorStop(0.1, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`)
      grad.addColorStop(0.4, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`)
      grad.addColorStop(0.6, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`)
      grad.addColorStop(0.9, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`)
      grad.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`)
      ctx.fillStyle = grad
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length)
      ctx.restore()
    }

    function animate() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.filter = 'blur(35px)'
      const total = beamsRef.current.length
      beamsRef.current.forEach((beam, i) => {
        beam.y -= beam.speed
        beam.pulse += beam.pulseSpeed
        if (beam.y + beam.length < -100) resetBeam(beam, i, total)
        drawBeam(ctx, beam)
      })
      frameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', updateSize)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [intensity])

  return (
    <div className={`relative overflow-hidden bg-[#070738] ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ filter: 'blur(15px)' }}
      />
      <div className="absolute inset-0 bg-[#070738]/5 animate-pulse-slow pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
