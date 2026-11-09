# Neha & Deepak · Wedding Invitation

A mobile-first digital wedding invitation: wax-sealed envelope intro, scratch-to-reveal date,
live countdown, festivities timeline with map directions, photo collage, and contact numbers.

Plain HTML/CSS/JS, no build step. Hosted on GitHub Pages.

## Editing

| What | Where |
| --- | --- |
| Text, events, addresses, contacts | `index.html` |
| Wedding date/time for the countdown | `WEDDING_DATE` at the top of `script.js` |
| Colours & layout | `styles.css` |
| Photos | drop files into `images/` (see `images/README.md` for names) |

Commit and push to `main`; GitHub Pages redeploys in about a minute.

After changing `styles.css` or `script.js`, bump the `?v=` date on their links in `index.html`
so phones don't mix a fresh page with a cached old stylesheet (GitHub Pages caches for 10 minutes).

## Preview locally

Open `index.html` directly in a browser, or run `.claude/serve.ps1` and visit http://localhost:8080.
