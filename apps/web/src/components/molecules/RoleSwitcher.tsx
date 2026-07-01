interface RoleSwitcherProps {
  currentRole: 'SEEKER' | 'GUIDE'
  onRoleChange: (role: 'SEEKER' | 'GUIDE') => void
}

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-[#070738]/8 p-0.5">
      <button
        onClick={() => onRoleChange('SEEKER')}
        className={`w-16 rounded-full px-3 py-1 text-center text-[13px] font-semibold transition-all duration-200 ${
          currentRole === 'SEEKER'
            ? 'bg-[#070738] text-white shadow-sm'
            : 'text-[#070738]/45 hover:text-[#070738]/70'
        }`}
      >
        Seeker
      </button>
      <button
        onClick={() => onRoleChange('GUIDE')}
        className={`w-16 rounded-full px-3 py-1 text-center text-[13px] font-semibold transition-all duration-200 ${
          currentRole === 'GUIDE'
            ? 'bg-[#070738] text-white shadow-sm'
            : 'text-[#070738]/45 hover:text-[#070738]/70'
        }`}
      >
        Guide
      </button>
    </div>
  )
}
