import type { Request, Response, NextFunction } from 'express';
import {
  createSupabaseAdminClient,
  createSupabaseAnonClient,
  isSupabaseConfigured,
  sanitizeSupabaseErrorMessage,
} from './supabaseClient.ts';
import type { CmsAdminUser } from './types.ts';

export const ADMIN_COOKIE_NAME = 'imk_admin_token';

export interface AuthenticatedAdminRequest extends Request {
  adminUser?: CmsAdminUser;
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) {
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  }
  return result;
}

function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice('Bearer '.length).trim();
    if (bearer) return bearer;
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies[ADMIN_COOKIE_NAME] || null;
}

function getAllowlistedEmails(): Set<string> {
  const raw = process.env.SUPABASE_ADMIN_EMAILS || '';
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function verifyAdminAccessToken(token: string): Promise<CmsAdminUser | null> {
  if (!isSupabaseConfigured() || !token) return null;

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !userData?.user) return null;

  const authUser = userData.user;
  const email = (authUser.email || '').toLowerCase();

  // Check active cms_admins record
  const { data: adminRow, error: adminErr } = await supabaseAdmin
    .from('cms_admins')
    .select('id, user_id, email, full_name, role, is_active')
    .eq('user_id', authUser.id)
    .maybeSingle();

  if (adminErr) {
    console.error(
      'Failed to verify cms_admins membership:',
      sanitizeSupabaseErrorMessage(adminErr.message)
    );
    return null;
  }

  if (adminRow) {
    if (!adminRow.is_active) return null;
    return {
      id: authUser.id,
      email: adminRow.email,
      fullName: adminRow.full_name || 'Editorial Admin',
      role: adminRow.role === 'editor' ? 'editor' : 'admin',
    };
  }

  // Allowlist bootstrap: if email is listed in SUPABASE_ADMIN_EMAILS, sync into cms_admins
  const allowlist = getAllowlistedEmails();
  if (email && allowlist.has(email)) {
    const fullName =
      (authUser.user_metadata?.full_name as string | undefined) || 'Insight Marketing Admin';
    const { data: synced } = await supabaseAdmin
      .from('cms_admins')
      .upsert(
        {
          user_id: authUser.id,
          email,
          full_name: fullName,
          role: 'admin',
          is_active: true,
        },
        { onConflict: 'email' }
      )
      .select('email, full_name, role')
      .single();

    return {
      id: authUser.id,
      email: synced?.email || email,
      fullName: synced?.full_name || fullName,
      role: 'admin',
    };
  }

  return null;
}

export async function signInAdminWithPassword(
  email: string,
  password: string
): Promise<{ user: CmsAdminUser; accessToken: string } | { error: string; status: number }> {
  if (!isSupabaseConfigured()) {
    return {
      error: 'Supabase CMS environment variables are not configured on the server.',
      status: 503,
    };
  }

  const supabaseAnon = createSupabaseAnonClient();
  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.session?.access_token) {
    return {
      error: error?.message ? sanitizeSupabaseErrorMessage(error.message) : 'Invalid email or password.',
      status: 401,
    };
  }

  const verifiedAdmin = await verifyAdminAccessToken(data.session.access_token);
  if (!verifiedAdmin) {
    return {
      error:
        'Your Supabase account signed in, but is not authorised in cms_admins. Add this user UID to public.cms_admins or SUPABASE_ADMIN_EMAILS.',
      status: 403,
    };
  }

  return {
    user: verifiedAdmin,
    accessToken: data.session.access_token,
  };
}

export async function getSessionAdminFromRequest(req: Request): Promise<CmsAdminUser | null> {
  const token = extractTokenFromRequest(req);
  if (!token) return null;
  return verifyAdminAccessToken(token);
}

export async function requireAdminAuth(
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!isSupabaseConfigured()) {
    res.status(503).json({
      ok: false,
      error: 'Supabase CMS is not configured yet.',
    });
    return;
  }

  const adminUser = await getSessionAdminFromRequest(req);
  if (!adminUser) {
    res.status(401).json({
      ok: false,
      error: 'Authorised administrator sign-in required.',
    });
    return;
  }

  req.adminUser = adminUser;
  next();
}

function isHttpsRequest(req?: Request): boolean {
  if (!req) return process.env.NODE_ENV === 'production';
  const xfProto = req.headers['x-forwarded-proto'];
  if (typeof xfProto === 'string' && xfProto.split(',')[0].trim() === 'https') {
    return true;
  }
  return Boolean(req.secure || process.env.NODE_ENV === 'production');
}

export function setAdminSessionCookie(res: Response, token: string, req?: Request): void {
  const isHttps = isHttpsRequest(req);
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isHttps ? 'none' : 'lax',
    secure: isHttps,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAdminSessionCookie(res: Response, req?: Request): void {
  const isHttps = isHttpsRequest(req);
  res.clearCookie(ADMIN_COOKIE_NAME, {
    path: '/',
    sameSite: isHttps ? 'none' : 'lax',
    secure: isHttps,
  });
}
