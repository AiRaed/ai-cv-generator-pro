"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface ToastProps {
  id: string
  title: string
  description?: string
  variant?: "default" | "success" | "error"
  duration?: number
}

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { ...toast, id }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, toast.duration || 3000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}

function Toast({ title, description, variant = "default", onClose }: ToastProps & { onClose: () => void }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-4 shadow-md backdrop-blur-sm",
        variant === "success" && "border-green-500/50 bg-green-500/10",
        variant === "error" && "border-red-500/50 bg-red-500/10",
        variant === "default" && "border-foreground/20 bg-background"
      )}
    >
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {description && <p className="text-sm opacity-70">{description}</p>}
      </div>
      <button onClick={onClose} className="rounded-lg p-1 hover:bg-foreground/10">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
