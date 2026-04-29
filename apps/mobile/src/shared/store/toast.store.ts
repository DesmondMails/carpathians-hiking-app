import { create } from 'zustand'

export type ToastVariant = 'error' | 'success' | 'info' | 'warning'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  duration: number
}

interface ToastState {
  toasts: ToastItem[]
  show: (toast: Omit<ToastItem, 'id' | 'duration'> & { duration?: number }) => string
  hide: (id: string) => void
  clear: () => void
}

const DEFAULT_DURATION = 3500

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: ({ message, variant, duration = DEFAULT_DURATION }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    set((state) => ({
      toasts: [...state.toasts, { id, message, variant, duration }],
    }))
    return id
  },
  hide: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}))

const show = (variant: ToastVariant) => (message: string, duration?: number) =>
  useToastStore.getState().show({ message, variant, duration })

export const toast = {
  error: show('error'),
  success: show('success'),
  info: show('info'),
  warning: show('warning'),
  hide: (id: string) => useToastStore.getState().hide(id),
  clear: () => useToastStore.getState().clear(),
}
