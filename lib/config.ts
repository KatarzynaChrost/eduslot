export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
}

export function validateConfig() {
  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error("Missing Supabase environment variables. Please check your .env.local file.")
  }
}
