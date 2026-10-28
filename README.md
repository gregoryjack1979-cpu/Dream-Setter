# Dream Setter — website

Marketing site for Dream Setter, the AI appointment setter (dreamsetter.net).
Static files, no build step. Upload the folder contents to the web host's document root.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole site: hero, how it works, features, pain points, comparison, calculator, FAQ, contact, footer. |
| `styles.css` | All styling. Dark brand look with a light calculator band. Fonts load from Google Fonts with system fallbacks. |
| `site-config.js` | **Edit this first.** Booking link, phone, email, and contact-form endpoint. Empty values hide that control. |
| `site.js` | Mobile menu, applies `site-config.js`, contact form submit. |
| `model.js` | Calculator math (unchanged from the verified October 19 build). |
| `app.js` | Calculator UI: three steps, results, copy/download (unchanged from the verified October 19 build). |
| `privacy.html`, `terms.html` | Privacy Policy and Terms of Service for Dream Setter Inc., including the text-message (SMS) consent language that carriers require for A2P 10DLC registration. Have an attorney review before relying on them. |
| `assets/` | Badge logo, favicons, Apple touch icon, social preview image. |

## Before launch

1. Fill in `site-config.js`:
   - `bookingUrl` — a full `https://` calendar link. When set, every "Book a demo" button opens it.
   - `phone` and `email` — shown in the contact section as tap-to-call / mail links.
   - `formEndpoint` — where the contact form posts JSON (Formspree, Basin, a Make or Zapier webhook). Leave empty to hide the form.
   Until at least one is set, the contact section shows "details are being finalized".
2. Confirm pricing, coverage, and service-scope wording. The calculator's $50 per-appointment fee and 13% booking rate are illustrative sample inputs, not quotes.
3. If the live domain is not `https://dreamsetter.net/`, update the `canonical`, `og:url`, and `og:image` tags in `index.html`.
4. Test on a phone (Safari and the Facebook in-app browser) and on desktop: menu, calculator steps, copy/download, contact links.

## Business identity on the site

Legal entity: **Dream Setter Inc.**, Missouri corporation, 1040 Pike St, Saint Charles, MO 63301. The footer shows the legal name and city; the full address appears in the privacy policy and terms. The EIN is never published on the site.

The contact form includes a required SMS-consent checkbox. The form posts `smsConsent: "yes"` with the other fields, so the CRM can record consent. Keep that checkbox and the policy links; phone-number registration (A2P 10DLC) reviewers check for them.

## Calculator check

Defaults should produce **$14,450 / month** and **$173,400 / year**. "Keeping your team? Use $0" should produce **$8,000 / month**.

## Hosting

GoDaddy cPanel: My Products → Web Hosting → Manage → File Manager for dreamsetter.net → upload into the document root (usually `public_html`) so `index.html` sits at the top level. Enable SSL and the HTTPS redirect in the hosting panel.

GitHub Pages also works: Settings → Pages → deploy from this branch, root folder.
