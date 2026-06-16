import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'

import { Logo } from '../../components/ui/Logo'
import { cn } from '../../lib/utils'
import { useAdminAuthContext } from '../context/AdminAuthContext'

export function LoginPage() {
  const { session, isAdmin, signIn, loading, error } = useAdminAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  if (!loading && session && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setSubmitting(false)
    }
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen bg-navy-deep relative overflow-hidden flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(41,171,226,0.18),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(0,174,239,0.12),transparent_45%)]" />
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <Logo size="lg" className="h-12 mx-auto" />
          </Link>
          <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-cyan font-semibold">
            Admin Portal
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-white/50">Sign in to manage your portfolio</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/20 space-y-5"
        >
          {displayError && (
            <div className="rounded-xl bg-red-500/10 border border-red-400/30 px-4 py-3 text-sm text-red-200">
              {displayError}
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-cyan/90 font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-navy/40 border border-white/10 px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
              placeholder="you@nsventures.in"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-cyan/90 font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-navy/40 border border-white/10 px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className={cn(
              'w-full rounded-full py-3.5 text-sm font-bold tracking-wide transition-all',
              'bg-cyan text-navy hover:bg-cyan-bright shadow-lg shadow-cyan/25',
              'disabled:opacity-60 disabled:cursor-not-allowed',
            )}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/35">
          <Link to="/" className="hover:text-cyan transition-colors">
            ← Back to website
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
