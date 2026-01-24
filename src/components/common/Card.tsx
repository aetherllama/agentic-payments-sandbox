import React, { forwardRef, HTMLAttributes } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  variant?: 'default' | 'hover' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

const variantClasses = {
  default: 'bg-white shadow-sm border border-slate-200',
  hover: 'bg-white shadow-sm border border-slate-200 hover:shadow-md hover:border-primary-300 cursor-pointer transition-all duration-200',
  outlined: 'bg-transparent border-2 border-slate-200',
}

const paddingClasses = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className = '', children, onClick }, ref) => {
    if (variant === 'hover') {
      return (
        <motion.div
          ref={ref}
          whileHover={{ y: -2 }}
          className={`rounded-xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
          onClick={onClick}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={`rounded-xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
        onClick={onClick}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-start justify-between mb-4 ${className}`}
        {...props}
      >
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    )
  }
)

CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`mt-4 pt-4 border-t border-slate-200 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'
