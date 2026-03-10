import { Compass, GraduationCap } from 'lucide-react'

interface RoleSwitcherProps {
  currentRole: 'SEEKER' | 'GUIDE'
  onRoleChange: (role: 'SEEKER' | 'GUIDE') => void
}

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
      <button
        onClick={() => onRoleChange('SEEKER')}
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          currentRole === 'SEEKER'
            ? 'bg-primary text-white'
            : 'text-text-muted hover:text-text-primary hover:bg-background'
        }`}
      >
        <Compass className="h-4 w-4" />
        Seeker
      </button>
      <button
        onClick={() => onRoleChange('GUIDE')}
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          currentRole === 'GUIDE'
            ? 'bg-primary text-white'
            : 'text-text-muted hover:text-text-primary hover:bg-background'
        }`}
      >
        <GraduationCap className="h-4 w-4" />
        Guide
      </button>
    </div>
  )
}
