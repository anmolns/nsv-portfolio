import { createClient } from '@supabase/supabase-js'

import { anonKey, serviceRoleKey, supabaseUrl } from './config.mjs'

export async function verifyAdmin(token) {
  if (!token) return { ok: false, status: 401, message: 'Missing authorization token' }

  const authClient = createClient(supabaseUrl, anonKey)
  const { data, error } = await authClient.auth.getUser(token)
  if (error || !data.user) {
    return { ok: false, status: 401, message: 'Invalid or expired session' }
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  const { data: adminRow, error: adminError } = await adminClient
    .from('admin_users')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (adminError || !adminRow) {
    return { ok: false, status: 403, message: 'Not authorized for admin bulk import' }
  }

  return { ok: true, userId: data.user.id }
}
