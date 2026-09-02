import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Read-only Supabase client used by the analytics data layer.
 *
 * Why this exists instead of the generated `@/integrations/supabase/client`:
 *  - the generated client only accepts `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`
 *    (with server-only `SUPABASE_*` fallbacks). On a host such as Vercel, where the
 *    variables may be provisioned under the `SUPABASE_*` or `*_ANON_KEY` names, that
 *    throws "Missing Supabase environment variable(s)" and the whole dashboard fails.
 *  - it installs the Lovable preview auth-storage broker, which is preview-only
 *    behaviour this dashboard does not need (it makes no authenticated calls).
 *
 * No key is hardcoded here: every value comes from the environment at build time
 * (`import.meta.env.VITE_*`, statically inlined by Vite) or at runtime on the server
 * (`process.env`). The only key ever used is the client-safe publishable/anon key.
 */

const VITE_ENV = import.meta.env as unknown as Record<string, string | undefined>;

function fromViteEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = VITE_ENV[name];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}

function fromProcessEnv(...names: string[]): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}

export function resolveSupabaseUrl(): string | undefined {
  return (
    fromViteEnv("VITE_SUPABASE_URL", "VITE_PUBLIC_SUPABASE_URL") ??
    fromProcessEnv("SUPABASE_URL", "VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
  );
}

export function resolveSupabasePublishableKey(): string | undefined {
  return (
    fromViteEnv(
      "VITE_SUPABASE_PUBLISHABLE_KEY",
      "VITE_SUPABASE_ANON_KEY",
      "VITE_PUBLIC_SUPABASE_ANON_KEY",
    ) ??
    fromProcessEnv(
      "SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_ANON_KEY",
      "VITE_SUPABASE_PUBLISHABLE_KEY",
      "VITE_SUPABASE_ANON_KEY",
    )
  );
}

export const MISSING_ENV_MESSAGE =
  "Backend connection is not configured for this deployment. " +
  "Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY as build-time environment " +
  "variables in the hosting project, then redeploy.";

function isNewApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createAnalyticsClient() {
  const url = resolveSupabaseUrl();
  const key = resolveSupabasePublishableKey();

  if (!url || !key) {
    console.error(`[Analytics] ${MISSING_ENV_MESSAGE}`);
    throw new Error(MISSING_ENV_MESSAGE);
  }

  return createClient<Database>(url, key, {
    global: {
      // New-format publishable keys are opaque strings, not JWTs: they must travel
      // as `apikey`, never as `Authorization: Bearer <key>`.
      fetch: (input, init) => {
        const headers = new Headers(
          typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
        );
        if (init?.headers) {
          new Headers(init.headers).forEach((value, name) => headers.set(name, value));
        }
        if (isNewApiKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let _client: ReturnType<typeof createAnalyticsClient> | undefined;

/** Lazily-created, environment-driven read-only client for the `v_*` analytics views. */
export const analyticsSupabase = new Proxy({} as ReturnType<typeof createAnalyticsClient>, {
  get(_, prop, receiver) {
    if (!_client) _client = createAnalyticsClient();
    return Reflect.get(_client, prop, receiver);
  },
});
