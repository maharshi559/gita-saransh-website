/* Connection to Supabase. Set once, then manage everything else
   (launch month, price, perk, contact email...) in the site_settings table.
   The anon key is safe to publish: it can only read site_settings and add
   sign-ups through join_waitlist(); nobody can read the waitlist with it. */
window.GITA_SARANSH = {
  SUPABASE_URL: 'https://bfczeusklfmposqrhktp.supabase.co',        // e.g. 'https://abcdefgh.supabase.co'
  SUPABASE_ANON_KEY: 'sb_publishable_6EJr_10zHmAzs_tppspklA_xNyqV0vn',   // Supabase: Project Settings > API Keys > publishable key (sb_publishable_...) or legacy anon key (eyJ...)
  SITE_URL: ''             // optional fallback; prefer the site_url row in site_settings
};
