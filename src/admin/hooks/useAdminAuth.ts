import { useCallback, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { getSupabase, isSupabaseConfigured } from '../../lib/supabase'

interface AdminAuthState {
  session: Session | null
  user: User | null
  isAdmin: boolean
  loading: boolean
  error: string | null
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    session: null,
    user: null,
    isAdmin: false,
    loading: true,
    error: null,
  })

  const checkAdmin = useCallback(async (userId: string) => {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return Boolean(data)
  }, [])

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setState({
        session: null,
        user: null,
        isAdmin: false,
        loading: false,
        error: 'Supabase is not configured.',
      })
      return
    }

    setState((s) => ({ ...s, loading: true, error: null }))

    try {
      const supabase = getSupabase()
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      const session = data.session
      if (!session?.user) {
        setState({
          session: null,
          user: null,
          isAdmin: false,
          loading: false,
          error: null,
        })
        return
      }

      const isAdmin = await checkAdmin(session.user.id)
      setState({
        session,
        user: session.user,
        isAdmin,
        loading: false,
        error: null,
      })
    } catch (err) {
      setState({
        session: null,
        user: null,
        isAdmin: false,
        loading: false,
        error: err instanceof Error ? err.message : 'Auth check failed',
      })
    }
  }, [checkAdmin])

  useEffect(() => {
    refresh()

    if (!isSupabaseConfigured()) return

    const supabase = getSupabase()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refresh()
    })

    return () => subscription.unsubscribe()
  }, [refresh])

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase()
    setState((s) => ({ ...s, loading: true, error: null }))

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setState((s) => ({ ...s, loading: false, error: error.message }))
      throw error
    }

    if (!data.user) {
      const message = 'Sign in failed.'
      setState((s) => ({ ...s, loading: false, error: message }))
      throw new Error(message)
    }

    const isAdmin = await checkAdmin(data.user.id)
    if (!isAdmin) {
      await supabase.auth.signOut()
      const message = 'This account is not authorized for admin access.'
      setState({
        session: null,
        user: null,
        isAdmin: false,
        loading: false,
        error: message,
      })
      throw new Error(message)
    }

    await refresh()
  }, [checkAdmin, refresh])

  const signOut = useCallback(async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    setState({
      session: null,
      user: null,
      isAdmin: false,
      loading: false,
      error: null,
    })
  }, [])

  return { ...state, signIn, signOut, refresh }
}
