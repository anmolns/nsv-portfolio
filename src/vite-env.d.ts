/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** Production bulk-import server, e.g. https://import.yoursite.com */
  readonly VITE_BULK_IMPORT_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
