-- =============================================================================
-- Insight Marketing Kenya — Independent Supabase CMS Schema & RLS Policies
-- Run this script in your Supabase project's SQL Editor.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Authorised Administrators Table
-- Links Supabase Auth users (auth.users) who are allowed to manage CMS content.
-- -----------------------------------------------------------------------------
create table if not exists public.cms_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null default 'Insight Marketing Editor',
  role text not null default 'admin' check (role in ('admin', 'editor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Security-definer helper for RLS checks without recursive policy lookups
create or replace function public.is_cms_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cms_admins
    where user_id = auth.uid()
      and is_active = true
  );
$$;

-- -----------------------------------------------------------------------------
-- 2. Categories & Tags
-- -----------------------------------------------------------------------------
create table if not exists public.cms_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 3. Media Library Metadata (Backed by Supabase Storage Bucket: blog-media)
-- -----------------------------------------------------------------------------
create table if not exists public.cms_media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'blog-media',
  storage_path text unique not null,
  public_url text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  alt_text text not null default '',
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 4. Blog Articles Table
-- -----------------------------------------------------------------------------
create table if not exists public.cms_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text not null default '',
  content_html text not null default '',
  featured_image_url text not null default '',
  featured_image_alt text not null default '',
  category_id uuid references public.cms_categories(id) on delete set null,
  author_name text not null default 'Insight Marketing Editorial',
  author_role text not null default 'Digital Growth Team',
  author_bio text not null default '',
  author_avatar_url text not null default '',
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  is_featured boolean not null default false,
  published_at timestamptz,
  modified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  seo_title text not null default '',
  meta_description text not null default '',
  canonical_url text not null default '',
  og_image_url text not null default '',
  og_description text not null default '',
  related_service_slug text not null default '',
  reading_time_minutes integer not null default 3,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

-- Many-to-many join between posts and tags
create table if not exists public.cms_post_tags (
  post_id uuid not null references public.cms_posts(id) on delete cascade,
  tag_id uuid not null references public.cms_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- Indexes for fast public queries and admin filtering
create index if not exists idx_cms_posts_slug on public.cms_posts (slug);
create index if not exists idx_cms_posts_status_pub on public.cms_posts (status, published_at desc);
create index if not exists idx_cms_posts_category on public.cms_posts (category_id);
create index if not exists idx_cms_posts_featured on public.cms_posts (is_featured) where is_featured = true;

-- Auto-update modified_at / updated_at timestamps
create or replace function public.set_cms_modified_at()
returns trigger
language plpgsql
as $$
begin
  new.modified_at = now();
  return new;
end;
$$;

drop trigger if exists trg_cms_posts_modified on public.cms_posts;
create trigger trg_cms_posts_modified
before update on public.cms_posts
for each row
execute function public.set_cms_modified_at();

create or replace function public.set_cms_category_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_cms_categories_updated on public.cms_categories;
create trigger trg_cms_categories_updated
before update on public.cms_categories
for each row
execute function public.set_cms_category_updated_at();

-- -----------------------------------------------------------------------------
-- 5. Row Level Security (RLS) Policies
-- -----------------------------------------------------------------------------
alter table public.cms_admins enable row level security;
alter table public.cms_categories enable row level security;
alter table public.cms_tags enable row level security;
alter table public.cms_media enable row level security;
alter table public.cms_posts enable row level security;
alter table public.cms_post_tags enable row level security;

-- cms_admins: only active admins can view/manage admin roster
drop policy if exists "Admins can view cms_admins" on public.cms_admins;
create policy "Admins can view cms_admins"
  on public.cms_admins for select
  using (public.is_cms_admin());

drop policy if exists "Admins can manage cms_admins" on public.cms_admins;
create policy "Admins can manage cms_admins"
  on public.cms_admins for all
  using (public.is_cms_admin())
  with check (public.is_cms_admin());

-- cms_categories: public can read; only admins can write
drop policy if exists "Public can read categories" on public.cms_categories;
create policy "Public can read categories"
  on public.cms_categories for select
  using (true);

drop policy if exists "Admins can write categories" on public.cms_categories;
create policy "Admins can write categories"
  on public.cms_categories for all
  using (public.is_cms_admin())
  with check (public.is_cms_admin());

-- cms_tags: public can read; only admins can write
drop policy if exists "Public can read tags" on public.cms_tags;
create policy "Public can read tags"
  on public.cms_tags for select
  using (true);

drop policy if exists "Admins can write tags" on public.cms_tags;
create policy "Admins can write tags"
  on public.cms_tags for all
  using (public.is_cms_admin())
  with check (public.is_cms_admin());

-- cms_posts: public sees only published articles (or scheduled articles past published_at)
drop policy if exists "Public can read published posts" on public.cms_posts;
create policy "Public can read published posts"
  on public.cms_posts for select
  using (
    (status = 'published' and (published_at is null or published_at <= now()))
    or (status = 'scheduled' and published_at is not null and published_at <= now())
    or public.is_cms_admin()
  );

drop policy if exists "Admins can insert posts" on public.cms_posts;
create policy "Admins can insert posts"
  on public.cms_posts for insert
  with check (public.is_cms_admin());

drop policy if exists "Admins can update posts" on public.cms_posts;
create policy "Admins can update posts"
  on public.cms_posts for update
  using (public.is_cms_admin())
  with check (public.is_cms_admin());

drop policy if exists "Admins can delete posts" on public.cms_posts;
create policy "Admins can delete posts"
  on public.cms_posts for delete
  using (public.is_cms_admin());

-- cms_post_tags: public reads tags attached to visible posts; admins manage all
drop policy if exists "Public can read post tags" on public.cms_post_tags;
create policy "Public can read post tags"
  on public.cms_post_tags for select
  using (
    exists (
      select 1 from public.cms_posts p
      where p.id = post_id
        and (
          (p.status = 'published' and (p.published_at is null or p.published_at <= now()))
          or (p.status = 'scheduled' and p.published_at is not null and p.published_at <= now())
          or public.is_cms_admin()
        )
    )
  );

drop policy if exists "Admins can manage post tags" on public.cms_post_tags;
create policy "Admins can manage post tags"
  on public.cms_post_tags for all
  using (public.is_cms_admin())
  with check (public.is_cms_admin());

-- cms_media: public can read media records; only admins can upload/update/delete
drop policy if exists "Public can read media metadata" on public.cms_media;
create policy "Public can read media metadata"
  on public.cms_media for select
  using (true);

drop policy if exists "Admins can manage media metadata" on public.cms_media;
create policy "Admins can manage media metadata"
  on public.cms_media for all
  using (public.is_cms_admin())
  with check (public.is_cms_admin());

-- -----------------------------------------------------------------------------
-- 6. Supabase Storage Bucket & Policies ('blog-media')
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('blog-media', 'blog-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read access for blog-media" on storage.objects;
create policy "Public read access for blog-media"
  on storage.objects for select
  using (bucket_id = 'blog-media');

drop policy if exists "Admins can upload to blog-media" on storage.objects;
create policy "Admins can upload to blog-media"
  on storage.objects for insert
  with check (bucket_id = 'blog-media' and public.is_cms_admin());

drop policy if exists "Admins can update blog-media" on storage.objects;
create policy "Admins can update blog-media"
  on storage.objects for update
  using (bucket_id = 'blog-media' and public.is_cms_admin());

drop policy if exists "Admins can delete from blog-media" on storage.objects;
create policy "Admins can delete from blog-media"
  on storage.objects for delete
  using (bucket_id = 'blog-media' and public.is_cms_admin());
