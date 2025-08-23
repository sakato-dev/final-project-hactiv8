import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: async (name) => (await cookies()).get(name)?.value,
        set: async (name, value, options) => {
          const store = await cookies();
          store.set(name, value, options);
        },
        remove: async (name, options) => {
          const store = await cookies();
          store.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
}
