import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
}

// Catches render/runtime errors anywhere in the tree so users get a friendly
// screen instead of a blank white page.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <p className="text-4xl font-bold text-text-primary">Something went wrong</p>
        <p className="mt-2 max-w-sm text-sm text-text-muted">
          An unexpected error occurred. Try reloading the page — if it keeps happening, contact
          support@expertify.io.
        </p>
        <button
          onClick={() => window.location.assign('/')}
          className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          style={{ color: 'white' }}
        >
          Reload app
        </button>
      </div>
    )
  }
}