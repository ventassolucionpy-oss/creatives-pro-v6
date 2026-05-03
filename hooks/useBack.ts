'use client'
import { useRouter } from 'next/navigation'

/**
 * useBack — navega a la pestaña anterior conservando el historial del browser.
 * Usa window.history.back() si hay historial, sino va al fallback.
 */
export function useBack(fallback: string = '/inicio') {
  const router = useRouter()

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    } else {
      router.push(fallback)
    }
  }

  return goBack
}
