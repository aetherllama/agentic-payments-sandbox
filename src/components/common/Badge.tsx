import { HTMLAttributes, forwardRef } from 'react'

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  icon?: React.ReactNode
  children: React.ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-100 text-success-600',
  warning: 'bg-warning-100 text-warning-600',
  danger: 'bg-danger-100 text-danger-600',
  neutral: 'bg-slate-100 text-slate-600',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'neutral', size = 'md', icon, className = '', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1 rounded-full font-medium
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {icon}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'idle' | 'active' | 'pending' | 'success' | 'error' | 'warning'
}

const statusVariants: Record<StatusBadgeProps['status'], BadgeVariant> = {
  idle: 'neutral',
  active: 'primary',
  pending: 'warning',
  success: 'success',
  error: 'danger',
  warning: 'warning',
}

const statusLabels: Record<StatusBadgeProps['status'], string> = {
  idle: 'Idle',
  active: 'Active',
  pending: 'Pending',
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
}

export function StatusBadge({ status, children, ...props }: StatusBadgeProps) {
  return (
    <Badge
      variant={statusVariants[status]}
      icon={
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            status === 'active' ? 'animate-pulse' : ''
          } ${
            status === 'idle'
              ? 'bg-slate-400'
              : status === 'active'
              ? 'bg-primary-500'
              : status === 'pending'
              ? 'bg-warning-500'
              : status === 'success'
              ? 'bg-success-500'
              : status === 'error'
              ? 'bg-danger-500'
              : 'bg-warning-500'
          }`}
        />
      }
      {...props}
    >
      {children || statusLabels[status]}
    </Badge>
  )
}
