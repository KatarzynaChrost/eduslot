import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { config, validateConfig } from "@/lib/config";

export async function createClient() {
  validateConfig();

  const cookieStore = await cookies();

  return createServerClient(config.supabase.url, config.supabase.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore errors from Server Components
        }
      },
    },
  });
}
