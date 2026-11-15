import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseConfigStatus } from './types.ts';

function assertServerOnly(): void {
  if (typeof window !== 'undefined') {
    throw new Error('Security violation: Supabase server client cannot run in browser code.');
  }
}

/**
 * Normalizes a configured SUPABASE_URL.
 * If a user pastes their Supabase Dashboard URL (e.g. https://supabase.com/dashboard/project/<ref>/...),
 * converts it automatically to the corresponding Project API URL (https://<ref>.supabase.co).
 */
export function resolveSupabaseApiUrl(rawUrl?: string): { url: string | null; invalidReason?: string } {
  const trimmed = (rawUrl || '').trim().replace(/\/+$/, '');
  if (!trimmed || trimmed.includes('your-project-ref')) {
    return { url: null };
  }

  // Handle accidental Supabase Studio dashboard URL paste
  const dashboardMatch = trimmed.match(
    /^https?:\/\/(?:supabase\.com\/dashboard|app\.supabase\.com)\/project\/([a-z0-9]{10,})(?:\/|$)/i
  );
  if (dashboardMatch?.[1]) {
    return { url: `https://${dashboardMatch[1].toLowerCase()}.supabase.co` };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { url: null, invalidReason: 'SUPABASE_URL must start with https://' };
    }
    if (
      (parsed.hostname === 'supabase.com' || parsed.hostname === 'app.supabase.com') &&
      !dashboardMatch
    ) {
      return {
        url: null,
        invalidReason:
          'SUPABASE_URL points to the Supabase website/dashboard instead of your project API URL (https://<project-ref>.supabase.co).',
      };
    }
    return { url: `${parsed.protocol}//${parsed.host}` };
  } catch {
    return { url: null, invalidReason: 'SUPABASE_URL is not a valid URL.' };
  }
}

export function sanitizeSupabaseErrorMessage(rawMessage?: string): string {
  const msg = (rawMessage || 'Unknown Supabase error').trim();
  if (/<!doctype\s+html|<html[\s>]/i.test(msg)) {
    return 'Supabase returned an HTML page instead of API JSON. Verify SUPABASE_URL is set to your Project API URL (https://<project-ref>.supabase.co).';
  }
  return msg.length > 400 ? `${msg.slice(0, 400)}…` : msg;
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  assertServerOnly();
  const resolved = resolveSupabaseApiUrl(process.env.SUPABASE_URL);
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const storageBucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'blog-media';

  const missingVars: string[] = [];
  if (!resolved.url) missingVars.push('SUPABASE_URL');
  if (!anonKey || anonKey.includes('your-supabase-anon-key')) missingVars.push('SUPABASE_ANON_KEY');
  if (!serviceRoleKey || serviceRoleKey.includes('your-supabase-service-role-key')) {
    missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  return {
    configured: missingVars.length === 0,
    missingVars,
    storageBucket,
  };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfigStatus().configured;
}

let cachedAdminClient: SupabaseClient | null = null;
let cachedAdminUrl: string | null = null;
let cachedAnonClient: SupabaseClient | null = null;
let cachedAnonUrl: string | null = null;

/**
 * Server-only Supabase client authenticated with SUPABASE_SERVICE_ROLE_KEY.
 * Strictly for backend Express API routes after verifying admin authorization
 * or querying published public articles server-side.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  assertServerOnly();
  const status = getSupabaseConfigStatus();
  const resolved = resolveSupabaseApiUrl(process.env.SUPABASE_URL);
  if (!status.configured || !resolved.url) {
    throw new Error(
      resolved.invalidReason ||
        `Supabase is not configured. Missing environment variables: ${status.missingVars.join(', ')}`
    );
  }

  if (!cachedAdminClient || cachedAdminUrl !== resolved.url) {
    cachedAdminUrl = resolved.url;
    cachedAdminClient = createClient(
      resolved.url,
      process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return cachedAdminClient;
}

/**
 * Server-side Supabase client authenticated with SUPABASE_ANON_KEY.
 * Used for Supabase Auth sign-in/token verification and RLS-enforced public reads.
 */
export function createSupabaseAnonClient(): SupabaseClient {
  assertServerOnly();
  const resolved = resolveSupabaseApiUrl(process.env.SUPABASE_URL);
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  if (!resolved.url || !anonKey) {
    throw new Error(resolved.invalidReason || 'SUPABASE_URL and SUPABASE_ANON_KEY are required.');
  }

  if (!cachedAnonClient || cachedAnonUrl !== resolved.url) {
    cachedAnonUrl = resolved.url;
    cachedAnonClient = createClient(resolved.url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return cachedAnonClient;
}
