# Monetization Plan (ads) — deferred

> To execute **after the product is ready** (usable, some content, custom
> domain, privacy compliance). Ads on a thin/new site get rejected and earn
> nothing without traffic. folgaextra monetized with Google AdSense — same path
> is viable here.

## Prerequisites (must exist before applying to any ad network)
1. **Custom domain** (not `*.github.io`) with HTTPS.
2. **Privacy policy** + terms pages (pt-BR). folgaextra had `/politica-privacidade`.
   Required by AdSense and by LGPD.
3. **Cookie/consent banner (LGPD, Brazil).** Ad + analytics scripts must load
   **only after consent**. For AdSense in EEA/UK a Google-certified **CMP** is
   mandatory; for Brazil-only, a consent gate is still the right default.
4. **Real usability + a bit of content** — AdSense reviews for original,
   navigable content. A single tool page may need a few supporting pages
   (about, how-it-works, FAQ) to pass review.
5. **Analytics (GA4)** to measure traffic (ads need traffic to earn).

## Ad networks (pick one to start)
- **Google AdSense** — easiest entry, what folgaextra used. Start here.
- **Ezoic / Mediavine / AdThrive** — higher RPM but require traffic thresholds
  (Ezoic low, Mediavine ~50k sessions/mo). Migrate later if volume justifies.
- **Media.net** — contextual alternative/fallback.

## Integration approach (keep it modular + privacy-first)
- Isolated `Ads` component + a **consent gate**: no ad/analytics script loads
  until the user accepts. One place to enable/disable (env flag; off in dev).
- **Lazy-load** the ad script; never block first paint. Guard Core Web Vitals —
  the product's edge is UX, so ads must not tank layout/CLS or speed.
- Reserve fixed-size slots to avoid layout shift (CLS).
- Static-site friendly: AdSense is a client script — fine with `output: 'export'`.

## Placement (non-intrusive)
- Below the results list, and/or a single sidebar unit on wide screens.
- Between logical sections, never inside the input form or over results.
- Start with 1–2 units; add only if RPM justifies and UX survives.

## Rollout order
1. Ship product + custom domain + privacy policy + consent banner + GA4.
2. Grow a little traffic (SEO: good titles/meta/OG, sitemap, shareable URLs).
3. Apply to AdSense; add the verification snippet (consent-gated).
4. Place 1–2 units; monitor RPM + Web Vitals for 2–4 weeks.
5. Optimize placements / consider Ezoic once traffic supports it.

## Compliance notes
- **LGPD**: lawful basis + consent for tracking cookies; clear privacy policy;
  honor opt-out. Consent banner blocks scripts pre-consent.
- Do not place ads that mislead or mimic the app's own controls (AdSense policy).
- Keep an ads-free path working (app must be fully usable if a user declines).
