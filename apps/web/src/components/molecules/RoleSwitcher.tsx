import { Compass, GraduationCap } from 'lucide-react'

interface RoleSwitcherProps {
  currentRole: 'SEEKER' | 'GUIDE'
  onRoleChange: (role: 'SEEKER' | 'GUIDE') => void
}

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  return (
    <div className="flex items-center">
      {/* Desktop / md+ view: pill toggle */}
      <div className="hidden md:flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
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

      {/* Mobile view: compact dropdown */}
      <div className="md:hidden">
        <select
          value={currentRole}
          onChange={(e) => onRoleChange(e.target.value as 'SEEKER' | 'GUIDE')}
          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
        >
          <option value="SEEKER">Seeker view</option>
          <option value="GUIDE">Guide view</option>
        </select>
      </div>
    </div>
  )
}
