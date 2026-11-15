# Supabase Blog CMS Setup & Configuration Guide

Insight Marketing Kenya uses an independent, reusable Supabase-backed Content Management System (`src/cms/`), completely separate from any legacy WordPress site. All database mutations, media uploads, and administrator checks run **server-side** so the `SUPABASE_SERVICE_ROLE_KEY` is never exposed to browser code.

---

## 1. Create a Supabase Project
1. Sign in to [Supabase](https://supabase.com/) and create a new PostgreSQL project (choose a region close to East Africa / Europe West, e.g., `eu-west-1` or `eu-west-2`).
2. Wait for provisioning to finish, then open **Project Settings -> API** and note:
   - **Project URL** (`SUPABASE_URL`)
   - **Anon / Public Key** (`SUPABASE_ANON_KEY`)
   - **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`) — keep strictly server-side!

---

## 2. Create Tables, Storage Bucket & Row Level Security (RLS)
1. Open **SQL Editor -> New query** in your Supabase dashboard.
2. Paste the entire contents of `supabase/schema.sql` and click **Run**.
   This creates:
   - `cms_admins` (authorised administrator accounts linked to `auth.users`)
   - `cms_categories`, `cms_tags`, `cms_post_tags`
   - `cms_media` + the public Storage bucket `blog-media`
   - `cms_posts` (full editorial, scheduling, SEO, canonical, and Open Graph fields)
   - `public.is_cms_admin()` security-definer helper + strict RLS policies ensuring public visitors can only read published posts (or scheduled posts whose `published_at` has passed), while only authenticated active admins can insert, update, or delete content or upload media.
3. *(Optional)* Run `supabase/seed.sql` if you want initial categories, tags, and starter Insight Marketing Kenya articles populated immediately.

---

## 3. Create Your First Authorised Administrator
1. In the Supabase Dashboard, go to **Authentication -> Users -> Add user -> Create new user**.
2. Enter the administrator's email address and strong password (check **Auto Confirm User**).
3. Copy the newly created user's **UID**, then run this in **SQL Editor**:
   ```sql
   insert into public.cms_admins (user_id, email, full_name, role, is_active)
   values (
     'PASTE_USER_UUID_HERE',
     'admin@insightmarketing.co.ke',
     'Editorial Admin',
     'admin',
     true
   )
   on conflict (email) do update
   set user_id = excluded.user_id, is_active = true;
   ```
   *(Tip: You can also set `SUPABASE_ADMIN_EMAILS="admin@insightmarketing.co.ke"` in your server environment. When an allowlisted Supabase Auth user signs in at `/admin/`, the backend verifies their password via Supabase Auth and ensures their active `cms_admins` row is linked.)*

---

## 4. Configure Server Environment Variables
Add the following variables to `.env` (or your hosting Secrets panel — never commit secrets to Git):

```env
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
SUPABASE_STORAGE_BUCKET="blog-media"
SUPABASE_ADMIN_EMAILS="admin@insightmarketing.co.ke"
```

**Security Notes:**
- `SUPABASE_SERVICE_ROLE_KEY` is accessed **only** inside server-side Node modules (`src/cms/supabaseClient.ts` throws an error if loaded in a browser bundle).
- No `VITE_SUPABASE_*` variables are needed because all public SSR reads, client queries, auth login, and admin mutations pass through authenticated Express API routes (`/api/blog`, `/api/admin/*`).
- `/admin/` sets `<meta name="robots" content="noindex, nofollow" />` and is disallowed in `/robots.txt` and excluded from `/sitemap.xml`.
- Draft and future-scheduled posts never appear on `/blog/`, `/api/blog`, or `/sitemap.xml`.

---

## 5. Run & Verify
1. Build the client and SSR bundles: `npm run build`
2. Start the server: `npm run start` (or `npm run dev` in development)
3. Sign in at `https://insightmarketing.co.ke/admin/` using your Supabase Auth administrator credentials.
4. Create, schedule, preview, and publish articles — public visitors at `/blog/` and `/blog/[slug]/` will continue seeing published articles reliably whether `/admin/` is open or not.
