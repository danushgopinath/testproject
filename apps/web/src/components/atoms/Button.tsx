import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  iconLeft?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

const baseClasses =
  'inline-flex items-center justify-center rounded-md border text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-white border-transparent hover:bg-primary/90 active:bg-primary/95',
  secondary:
    'bg-surface text-text-primary border-border hover:bg-slate-50 active:bg-slate-100',
  ghost:
    'bg-transparent text-text-primary border-transparent hover:bg-slate-100 active:bg-slate-200',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3',
  md: 'h-10 px-4',
  lg: 'h-11 px-5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {iconLeft && <span className="mr-2 inline-flex">{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span className="ml-2 inline-flex">{iconRight}</span>}
    </button>
  )
}

