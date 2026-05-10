import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type AuthStore = {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'dispatch-auth',
      // only persist user info, not loading state
      partialize: (state) => ({ user: state.user }),
    }
  )
)

// Listen to auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setUser(session?.user ?? null)
  useAuthStore.getState().setLoading(false)
})

// Initialize — check if user is already logged in
supabase.auth.getSession().then(({ data }) => {
  useAuthStore.getState().setUser(data.session?.user ?? null)
  useAuthStore.getState().setLoading(false)
})