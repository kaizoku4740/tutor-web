
MathByMsGarg — tutoring site with multi-TA support

Files:
- index.html — landing page with hero and pricing
- tas.html — directory of tutoring team (loads from tas.json)
- tas.json — TA data (name, bio, subjects, etc.)
- reviews/{taId}.html — individual review pages for each TA (msgarg.html, ta2.html, ta3.html, etc.)
- contact.html — contact form demo (local-only)
- css/styles.css — responsive styles with animations
- js/main.js — global interactivity (nav toggle, form handling, helpers)

Features:
- ✅ 6 TA profiles with individual review pages
- ✅ Per-TA reviews stored separately in localStorage
- ✅ Delete reviews with password protection (password: `delete123`)
- ✅ Sort reviews by newest/highest rating
- ✅ Average rating display and review count
- ✅ Responsive design with subtle animations
- ✅ Favicon and meta descriptions

To preview locally:

```bash
cd /Users/abhi/lm
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

To add/modify a TA:
1. Edit `tas.json` — add or update TA info (id, name, title, bio, subjects).
2. Create `reviews/{taId}.html` (or copy template from reviews/template.html) — each TA gets their own review page.
3. Reviews for each TA are keyed as `reviews-{taId}` in localStorage (e.g., `reviews-msgarg`, `reviews-ta2`).

Delete reviews:
- On any review page, click "Delete" button next to a review.
- Enter password: `delete123`
- Review is removed from localStorage.

Notes:
- Reviews are per-browser localStorage — each visitor sees their own reviews unless using a shared device.
- If you want shared reviews (visible to all visitors), I can wire a Cloudflare Worker + Workers KV backend.

Deploying to Cloudflare Workers/Pages:
1. Create a Git repo and push the site.
2. Set up Cloudflare Pages or Workers to serve the static files from your repo root.
3. Map your custom domain (MathByMrsGarg.com) to the Worker/Pages project.
