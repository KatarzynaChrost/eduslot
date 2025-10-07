/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    ADMIN_USERNAME: string
    ADMIN_PASSWORD: string
  }
}
