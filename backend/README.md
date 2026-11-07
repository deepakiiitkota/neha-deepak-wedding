# RSVP → Google Sheet

The website is static (GitHub Pages), so RSVPs are stored in a Google Sheet through a free
Google Apps Script "web app". Every time a guest taps **Send RSVP**, one row is added.

| Submitted at | Name | Phone | Attending | Guests | Logistics help | Pick-up date & time | Pick-up location | Drop location |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

## One-time setup (about 5 minutes)

1. Go to <https://sheets.new> (signed in to the Google account that should own the RSVPs).
   Name it e.g. **Neha & Deepak – RSVPs**.
2. In the Sheet: **Extensions → Apps Script**.
3. Delete the sample code, paste the whole of [`rsvp-google-sheet.gs`](rsvp-google-sheet.gs), click **Save** (💾).
4. Click **Deploy → New deployment**. Click the ⚙ next to "Select type" → **Web app**.
   - Description: `RSVP`
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, then **Authorize access**. Pick your account. Google shows
   "Google hasn't verified this app": click **Advanced → Go to (project name) (unsafe)** → **Allow**.
   (It's your own script; this warning appears for every personal Apps Script.)
6. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/AKfy…/exec`).
7. Open the URL in a browser tab: it should say `{"ok":true,"message":"RSVP endpoint is live"}`.
8. Put the URL into `RSVP_SHEET_URL` at the top of [`../script.js`](../script.js), commit and push.

## Notes

- **Sharing:** share the Sheet (view or edit) with whoever handles logistics. The web app URL only
  lets people *add* rows; it can't read the Sheet.
- **Totals:** e.g. guests coming: `=SUMIF(D:D,"Yes",E:E)` · pick-ups needed: `=COUNTIF(F:F,"Yes")`.
- **Changing the script later:** after editing, use **Deploy → Manage deployments → ✏ → Version: New version → Deploy**
  so the same URL keeps working.
- **Spam:** a hidden "honeypot" field drops most bots; text is trimmed to 200 characters per field.
