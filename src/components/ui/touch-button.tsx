'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from './button'

interface TouchButtonProps extends ButtonProps {
  touchFeedback?: boolean
  haptic?: boolean
}

const TouchButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, touchFeedback = true, haptic = false, children, ...props }, ref) => {
    const [isPressed, setIsPressed] = React.useState(false)

    const handleTouchStart = () => {
      setIsPressed(true)
      if (haptic && 'vibrate' in navigator) {
        navigator.vibrate(10) // Короткая вибрация
      }
    }

    const handleTouchEnd = () => {
      setIsPressed(false)
    }

    return (
      <Button
        ref={ref}
        className={cn(
          // Touch-friendly размеры
          'min-h-[44px] min-w-[44px] touch-manipulation select-none',
          // Улучшенные переходы для touch
          'transition-all duration-150 ease-out',
          // Touch feedback
          touchFeedback && isPressed && 'scale-95 brightness-90',
          // Увеличенные отступы для лучшего touch target
          'px-6 py-3',
          className
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        {...props}
      >
        {children}
      </Button>
    )
  }
)

TouchButton.displayName = 'TouchButton'

export { TouchButton }