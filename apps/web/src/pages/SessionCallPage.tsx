import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DailyIframe, { type DailyCall } from '@daily-co/daily-js'
import { useJoinSession, type JoinSessionResponse } from '../hooks/useSessions'

type Phase =
  | { kind: 'loading' }
  | { kind: 'too_early'; opensAt: string }
  | { kind: 'expired' }
  | { kind: 'error'; message: string }
  | { kind: 'in_call' }

export function SessionCallPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const join = useJoinSession()
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<DailyCall | null>(null)
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' })

  useEffect(() => {
    let cancelled = false
    if (!id) return

    join.mutate(id, {
      onSuccess: (data: JoinSessionResponse) => {
        if (cancelled) return
        if (data.status === 'too_early') return setPhase({ kind: 'too_early', opensAt: data.opensAt })
        if (data.status === 'expired') return setPhase({ kind: 'expired' })
        if (!containerRef.current) return
        const frame = DailyIframe.createFrame(containerRef.current, {
          showLeaveButton: true,
          iframeStyle: { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', border: '0' },
        })
        frameRef.current = frame
        frame.on('left-meeting', () => {
          frame.destroy()
          frameRef.current = null
          navigate('/sessions')
        })
        frame.join({ url: data.roomUrl, token: data.token })
        setPhase({ kind: 'in_call' })
      },
      onError: (err: unknown) => {
        if (cancelled) return
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Unable to join this session.'
        setPhase({ kind: 'error', message })
      },
    })

    return () => {
      cancelled = true
      frameRef.current?.destroy()
      frameRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // The Daily iframe container must exist in the DOM before createFrame runs
  // (in onSuccess), so it is always rendered; status UI overlays it until the
  // call is live, then the overlay is removed to reveal the embed.
  return (
    <div className="fixed inset-0 bg-black">
      <div ref={containerRef} className="absolute inset-0" />
      {phase.kind !== 'in_call' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          {phase.kind === 'loading' && (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-text-muted">Connecting you to the session…</p>
            </>
          )}
          {phase.kind === 'too_early' && (
            <>
              <h1 className="text-lg font-semibold text-text-primary">This session isn’t open yet</h1>
              <p className="text-sm text-text-muted">
                You can join from {new Date(phase.opensAt).toLocaleString()} (10 minutes before the start).
              </p>
              <button onClick={() => navigate('/sessions')} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90">
                Back to sessions
              </button>
            </>
          )}
          {phase.kind === 'expired' && (
            <>
              <h1 className="text-lg font-semibold text-text-primary">This session’s join window has closed</h1>
              <button onClick={() => navigate('/sessions')} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90">
                Back to sessions
              </button>
            </>
          )}
          {phase.kind === 'error' && (
            <>
              <h1 className="text-lg font-semibold text-text-primary">Can’t join this session</h1>
              <p className="text-sm text-text-muted">{phase.message}</p>
              <button onClick={() => navigate('/sessions')} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90">
                Back to sessions
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}