export const supabaseUrl = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').replace(
  /\/$/,
  '',
)
export const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? ''
export const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export function isImportConfigured() {
  return Boolean(supabaseUrl && anonKey && serviceRoleKey)
}
