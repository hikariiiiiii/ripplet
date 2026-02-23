import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-input bg-secondary/30 px-3 py-2 text-sm',
          'placeholder:text-muted-foreground',
          'transition-colors duration-150',
          'hover:border-white/30',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/40 focus-visible:bg-secondary/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
