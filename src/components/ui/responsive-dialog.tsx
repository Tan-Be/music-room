'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResponsiveDialogProps {
  children: React.ReactNode
  trigger: React.ReactNode
  title: string
  description?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ResponsiveDialog({
  children,
  trigger,
  title,
  description,
  open: controlledOpen,
  onOpenChange,
}: ResponsiveDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }

    checkIsDesktop()
    window.addEventListener('resize', checkIsDesktop)

    return () => window.removeEventListener('resize', checkIsDesktop)
  }, [])

  const handleTriggerClick = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  if (!open) {
    return <div onClick={handleTriggerClick}>{trigger}</div>
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog/Drawer */}
      <div
        className={cn(
          'fixed z-50 bg-background border shadow-lg',
          isDesktop
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg max-w-md w-full mx-4'
            : 'bottom-0 left-0 right-0 rounded-t-lg animate-in slide-in-from-bottom-80 duration-300'
        )}
      >
        {/* Handle для мобильных */}
        {!isDesktop && (
          <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        )}

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">{children}</div>
      </div>
    </>
  )
}
