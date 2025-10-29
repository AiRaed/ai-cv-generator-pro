'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { ToastProvider } from '@/components/ui/toast'

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  )
}
