-- =============================================================================
-- Insight Marketing Kenya — Optional Starter Content Seed (No WordPress Imports)
-- Run AFTER supabase/schema.sql if you want initial categories, tags, and guides.
-- =============================================================================

insert into public.cms_categories (name, slug, description) values
  ('SEO Strategy', 'seo-strategy', 'Practical guidance on technical SEO, local search, and organic growth across Kenya.'),
  ('AI Search & GEO', 'ai-search-geo', 'How foundation SEO supports Google AI Overviews, ChatGPT, Gemini, Claude, and Voice Search.'),
  ('Paid Advertising', 'paid-advertising', 'Managing Google Ads and Meta Ads budgets cleanly for Kenyan buyer enquiries.'),
  ('Web Design & CRO', 'web-design-cro', 'Website speed, clarity, and conversion rate optimisation for Kenyan businesses.')
on conflict (slug) do nothing;

insert into public.cms_tags (name, slug) values
  ('Kenyan SMEs', 'kenyan-smes'),
  ('Local SEO', 'local-seo'),
  ('Technical SEO', 'technical-seo'),
  ('AEO & GEO', 'aeo-geo'),
  ('Google Ads', 'google-ads'),
  ('Conversion Rate', 'conversion-rate')
on conflict (slug) do nothing;

with cat_seo as (select id from public.cms_categories where slug = 'seo-strategy' limit 1),
     cat_ai as (select id from public.cms_categories where slug = 'ai-search-geo' limit 1),
     cat_web as (select id from public.cms_categories where slug = 'web-design-cro' limit 1)
insert into public.cms_posts (
  title,
  slug,
  excerpt,
  content_html,
  featured_image_url,
  featured_image_alt,
  category_id,
  author_name,
  author_role,
  author_bio,
  status,
  is_featured,
  published_at,
  seo_title,
  meta_description,
  canonical_url,
  og_image_url,
  og_description,
  related_service_slug,
  reading_time_minutes
) values
(
  'How Kenyan Businesses Build Sustainable Search Visibility Without Relying Solely on Ads',
  'sustainable-search-visibility-kenya',
  'Paid campaigns generate immediate traffic, but organic search foundations keep bringing qualified enquiries month after month without paying per click.',
  '<p>Many growing Kenyan businesses begin online marketing by boosting social posts or launching Google Ads. While paid traffic works well for urgent campaigns, relying exclusively on ad spend means enquiries slow down the moment budgets pause.</p><h2>1. Start with commercial search intent</h2><p>Before publishing articles or adjusting tags, map the exact phrases your buyers type when ready to request a quote or compare suppliers in Kenya. Each core service deserves its own focused page.</p><h2>2. Fix mobile speed and indexing foundations</h2><p>Most buyers browse on mobile data across 4G and 3G connections. Slow image payloads, broken redirects, or blocked crawling quietly reduce both organic rankings and paid landing page conversion rates.</p><h2>3. Connect service pages with helpful guides</h2><p>Supporting buyer guides answer pricing, process, and comparison questions in plain English—building trust with prospects and giving Google clear topical depth.</p>',
  '/assets/blog/seo-strategy-guide.jpg',
  'Editorial strategy workspace representing sustainable SEO planning in Kenya',
  (select id from cat_seo),
  'Insight Marketing Editorial',
  'SEO & Growth Strategists',
  'Helping Kenyan businesses combine technical SEO, paid media, and conversion-ready web design.',
  'published',
  true,
  now() - interval '7 days',
  'Sustainable Search Visibility for Kenyan Businesses | Insight Marketing',
  'Learn how Kenyan SMEs combine commercial keyword mapping, technical SEO, and plain-English service pages to win organic leads.',
  'https://insightmarketing.co.ke/blog/sustainable-search-visibility-kenya/',
  '/assets/blog/seo-strategy-guide.jpg',
  'Build compounding organic leads across Google Search in Kenya without relying solely on ad spend.',
  '/seo-services-kenya/',
  4
),
(
  'AEO, GEO & Foundation SEO: Earning Citations in Google AI Overviews and AI Assistants',
  'aeo-geo-and-foundation-seo-kenya',
  'AI assistants and Google AI Overviews do not replace foundation SEO—they depend on structured content clusters, verified business facts, and direct answers.',
  '<p>Buyers across Kenya increasingly ask detailed questions in Google Search, read instant Google AI Overviews, use Voice Search, or ask ChatGPT, Gemini, and Claude to recommend reliable providers.</p><h2>Why foundation SEO remains essential</h2><p>Answer engines and generative models pull from crawlable, authoritative websites. When your technical structure and core service pages are weak, AI summaries rarely cite your business accurately.</p><h2>Structure content clusters around buyer questions</h2><p>Connect primary service pages to focused explainer articles, cost guides, and local pages. Clear topic clusters demonstrate real expertise across both search indexes and AI retrieval systems.</p><h2>Write clear, quotable answers</h2><p>Pair question-led headings with concise two-to-three sentence explanations before expanding into deeper technical detail.</p>',
  '/assets/blog/seo-strategy-guide.jpg',
  'Structured content cluster blueprint supporting SEO, AEO, and GEO visibility',
  (select id from cat_ai),
  'Insight Marketing Editorial',
  'Search & AI Visibility Team',
  'Helping Kenyan businesses combine technical SEO, paid media, and conversion-ready web design.',
  'published',
  false,
  now() - interval '3 days',
  'AEO, GEO & Foundation SEO in Kenya | Insight Marketing',
  'Discover how content clusters, structured answers, and foundation SEO help Kenyan businesses appear in Google AI Overviews, ChatGPT, and Voice Search.',
  'https://insightmarketing.co.ke/blog/aeo-geo-and-foundation-seo-kenya/',
  '/assets/blog/seo-strategy-guide.jpg',
  'Connect foundation SEO with Answer Engine Optimisation and Generative Engine Optimisation in Kenya.',
  '/ai-search-aeo-geo-kenya/',
  4
),
(
  'Why Business Websites Look Good But Still Fail to Generate Enquiries in Kenya',
  'why-kenyan-websites-lose-enquiries',
  'A brochure website filled with company history rarely wins leads. Learn how clear buyer messaging, mobile speed, and direct WhatsApp pathways improve conversions.',
  '<p>Many organisations invest in a new website only to find months pass with very few calls or quote enquiries. In most cases, the barrier is not colour palette—it is unclear buyer messaging and hidden contact paths.</p><h2>Lead with customer problems, not internal jargon</h2><p>Visitors arriving from Google Search or Meta Ads decide within seconds whether your company understands their need. State clearly who you serve, what outcome you deliver, and how to take the next step.</p><h2>Make mobile enquiries effortless</h2><p>Some prospects prefer completing a short quote form; others want to call or message on WhatsApp straight from their phone. Support all three cleanly without cluttering the screen.</p>',
  '/assets/projects/sr.png',
  'Conversion-focused storefront design example built by Insight Marketing Kenya',
  (select id from cat_web),
  'Insight Marketing Editorial',
  'Web Design & CRO Team',
  'Helping Kenyan businesses combine technical SEO, paid media, and conversion-ready web design.',
  'published',
  false,
  now() - interval '1 day',
  'Why Business Websites Fail to Generate Enquiries in Kenya | Insight Marketing',
  'Fix the messaging, mobile speed, and contact friction issues stopping Kenyan business websites from turning visitors into leads.',
  'https://insightmarketing.co.ke/blog/why-kenyan-websites-lose-enquiries/',
  '/assets/projects/sr.png',
  'Practical website conversion improvements for Kenyan businesses seeking more qualified leads.',
  '/web-design-kenya/',
  3
)
on conflict (slug) do nothing;
