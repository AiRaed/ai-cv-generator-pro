'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-300',
          {
            'px-6 py-3 text-base': size === 'md',
            'px-4 py-2 text-sm': size === 'sm',
            'px-8 py-4 text-lg': size === 'lg',
          },
          {
            'bg-violet-accent text-white hover:bg-violet-700 shadow-medium hover:shadow-large disabled:opacity-50 disabled:cursor-not-allowed': variant === 'primary',
            'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed': variant === 'secondary',
            'border-2 border-violet-accent text-violet-accent hover:bg-violet-accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed': variant === 'outline',
            'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed': variant === 'ghost',
          },
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }

