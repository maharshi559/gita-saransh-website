# Gita Saransh website (waitlist)

Static site built from the "Gita Saransh Website" design canvas. No build step: plain HTML, CSS and JS.

```
index.html          the page (header, hero, how it works, Ask Krishna, courtyard, sign-up, FAQ, footer)
privacy.html        waitlist privacy notice
styles.css          design tokens, layout (breakpoints 700px and 1100px), animations
app.js              greeting, Ask Krishna age tabs, FAQ, sign-up form, app preview video
config.js           Supabase URL + anon key  <- fill in once
settings.js         loads editable text from the site_settings table
assets/krishna/     Krishna in 6 ages (animated SVG, from the canvas)
assets/vyasa/       Vyasa idle / blessing
assets/items/       15 courtyard offerings
assets/og-image.png link preview image (1200x630)
assets/app/          growth video + poster for the "Inside the app" phone previews (from the app's animations)
supabase/waitlist.sql       sign-up table + join_waitlist() function
supabase/site_settings.sql  editable site text (launch month, price, perk...)
tools/build_svgs.py    regenerates the SVGs from the canvas .dc.html files
```

## Preview locally

```bash
cd gita-saransh-website   # this repository
python -m http.server 8000     # then open http://localhost:8000
```

Without Supabase set up, the page shows fallback wording and the form only logs sign-ups to the browser console.

## 1. Set up Supabase (once)

1. Supabase dashboard > SQL Editor > New query. Paste and run `supabase/waitlist.sql`, then `supabase/site_settings.sql`.
2. Project Settings > API: copy the Project URL and the `anon` `public` key into `config.js`. This is the only code edit.
3. See sign-ups: Table Editor > `waitlist`.

The anon key can only read `site_settings` and call `join_waitlist()`; nobody can read the waitlist with it. Re-submitting the same email updates that row ("Change my details").

## 2. Change the site text from Supabase

Table Editor > `site_settings`: edit the **value** column, then reload the site. Each row has a description of where it appears.

| key | example | shown in |
|---|---|---|
| `launch_month` | January 2027 | hero pill, FAQ |
| `founding_perk` | your first month free | sign-up card, FAQ |
| `founding_spots` | 500 | sign-up card |
| `price` | ₹99 | FAQ (needs `trial_length`) |
| `trial_length` | 7-day | FAQ (needs `price`) |
| `contact_email` | hello@gitasaransh.app | footer Contact link, privacy page |
| `city` | Hyderabad | footer |
| `site_url` | https://gitasaransh.app | WhatsApp share message |
| `privacy_updated` | 1 October 2026 | privacy page |

An empty value shows friendly fallback wording (e.g. "coming soon"), so the site never shows a placeholder. Visitors' browsers remember the last values, so repeat visits don't flicker.

To add a new setting: add a row in `site_settings`, then mark the text in the HTML with `data-tpl="... {your_key} ..."` (see the top of `settings.js`).

Link previews (WhatsApp, etc.) don't run JavaScript, so `og:image` in `index.html` needs the full URL (`https://your-domain/assets/og-image.png`) once you have a domain.

## WhatsApp numbers

The form has a country-code picker (India, US, Canada, UK, Gulf, Singapore, Australia and other diaspora countries), preselected from the visitor's time zone. People can also type any full number starting with `+`. Numbers are saved in international format (`+919876543210`, `+15552345678`), so WhatsApp tools can use them directly. Indian and US/Canadian numbers get a strict length check; other countries a general one.

## 3. Publish (GitHub Pages)

This repository is public and served by GitHub Pages at **https://maharshi559.github.io/gita-saransh-website/**

- One-time setup: repo **Settings > Pages > Build and deployment**: Source "Deploy from a branch", branch `main`, folder `/ (root)`.
- After that, every `git push` to `main` updates the live site within a minute or two.
- `.nojekyll` tells GitHub to serve the files as they are.
- Custom domain later: Settings > Pages > Custom domain, then update `og:url` and `og:image` in `index.html` to the new address.

Nothing here is secret: the Supabase anon key in `config.js` is meant to be public (it can only read `site_settings` and call `join_waitlist()`).

## Page notes

- **Inside the app** section: three phone previews built in HTML/CSS (Recite, Chapter path, growth moment). The growth phone plays `assets/app/growth-1.webm` (mp4 fallback) only while visible, and shows a still for people who prefer reduced motion. When real app screenshots exist, you can swap a phone's screen for an `<img>`.
- **Language**: there is no site language switcher (the site is English). The hero greeting and the form's "Which language will you learn in?" field are preset from the visitor's browser language.
- **Footer Contact link** appears once `contact_email` is set in `site_settings` (it stays hidden rather than pointing nowhere).
- **SEO**: `index.html` has Open Graph / Twitter tags with absolute URLs and a schema.org `MobileApplication` block. Update the URLs there if you move to a custom domain.

## Notes

- The site copy is English only for now (Hindi/Telugu copy is still open).
- Animations respect "reduce motion". The FAQ uses native `<details>`, so it works without JavaScript.
- Spam: the form has a hidden honeypot field. If bots become a problem, add Cloudflare Turnstile.
