import { createBrowserClient } from "@supabase/ssr";
import { config, validateConfig } from "@/lib/config";

export function createClient() {
  validateConfig();

  return createBrowserClient(config.supabase.url, config.supabase.anonKey);
}
