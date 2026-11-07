/**
 * RSVP receiver for the Neha & Deepak wedding site.
 *
 * Setup (one time, ~5 minutes) — see backend/README.md:
 *   1. Create a Google Sheet, then Extensions → Apps Script.
 *   2. Replace the default code with this file and Save.
 *   3. Deploy → New deployment → Web app
 *        Execute as: Me      Who has access: Anyone
 *   4. Copy the Web app URL (ends in /exec) into RSVP_SHEET_URL in script.js.
 *
 * Every RSVP becomes one row in the "RSVPs" tab.
 */

const SHEET_NAME = 'RSVPs';
const HEADERS = ['Submitted at', 'Name', 'Phone', 'Attending', 'Guests', 'Logistics help',
                 'Pick-up date & time', 'Pick-up location', 'Drop location'];
const MAX_LEN = 200; // trims anything longer, so the sheet can't be flooded with huge text

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // stops two guests submitting at once from overwriting each other
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Honeypot: a hidden field real guests never fill in. Bots usually do.
    if (data.website) return json({ ok: true });

    const clean = (v) => String(v == null ? '' : v).trim().slice(0, MAX_LEN);
    if (!clean(data.name) || !clean(data.phone)) return json({ ok: false, error: 'missing name or phone' });

    const sheet = getSheet();
    sheet.appendRow([
      new Date(),
      clean(data.name),
      "'" + clean(data.phone),            // leading ' keeps +91 numbers as text
      clean(data.attending),
      data.attending === 'Yes' ? Number(data.guests) || 1 : 0,
      clean(data.logistics),
      clean(data.pickupTime),
      clean(data.pickupFrom),
      clean(data.dropAt),
    ]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Visiting the Web app URL in a browser shows this — a quick way to check the deployment works.
function doGet() {
  return json({ ok: true, message: 'RSVP endpoint is live' });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#4A1620').setFontColor('#FBF6EC');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
