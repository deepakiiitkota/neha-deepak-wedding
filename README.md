# Neha & Deepak · Wedding Invitation

A mobile-first digital wedding invitation: wax-sealed envelope intro, scratch-to-reveal date,
live countdown, festivities timeline with map directions, photo collage, and a WhatsApp RSVP.

Plain HTML/CSS/JS, no build step. Hosted on GitHub Pages.

## Editing

| What | Where |
| --- | --- |
| Text, events, addresses, contacts | `index.html` |
| Wedding date/time for the countdown | `WEDDING_DATE` at the top of `script.js` |
| WhatsApp number that receives RSVPs | `RSVP_WHATSAPP_NUMBER` at the top of `script.js` (digits only, with country code, e.g. `919876543210`) |
| Colours & layout | `styles.css` |
| Photos | drop files into `images/` (see `images/README.md` for names) |

Commit and push to `main`; GitHub Pages redeploys in about a minute.

## Preview locally

Open `index.html` directly in a browser, or run `.claude/serve.ps1` and visit http://localhost:8080.
