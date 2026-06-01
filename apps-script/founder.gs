// ─────────────────────────────────────────────────────────────
// whatsyourun.xyz · founder program — Google Apps Script backend
//
// Paste this whole file into script.google.com, bind it to the Sheet
// (Resources → Cloud Platform project → or simply open the Apps
// Script editor FROM the Sheet via Extensions → Apps Script).
// Deploy as a Web App: "Execute as me", "Who has access: anyone".
// The resulting /exec URL goes into index.html as APPS_SCRIPT_URL.
//
// Two endpoints on one URL — dispatched by HTTP method and payload
// discriminator:
//
//   GET   <exec>              → { founders, solves, total: 500 }
//   POST  <exec>   type=claim → { number, total } | { existing, number }
//                              | { closed: true } | { error: '...' }
//   POST  <exec>   type=solve → { ok: true, solves }
//                              | { ok: true, solves, duplicate: true }
//
// Counter starts at 0 (both tabs created empty with header rows).
// Atomic counter assignment via LockService — two simultaneous POSTs
// queue, neither gets the same number. Solve-event dedup via
// SpreadsheetApp's TextFinder on the session_id column.
//
// PRIVACY
//   · No IP is stored. Apps Script web apps don't even expose client
//     IP to the script — we couldn't log it if we tried.
//   · Email lives only in the Founders tab (necessary for fulfillment).
//   · Solves tab stores session_id only — no email, no UA.
// ─────────────────────────────────────────────────────────────

// The Sheet this script writes to. Extract the ID from the Sheet URL
// (the long string between /d/ and /edit). The Sheet the user supplied:
//   https://docs.google.com/spreadsheets/d/1T7V4_xTOFKT_nVJvNNqrrE6JL6L9yha0HUuTH2PASNY/
const SHEET_ID = '1T7V4_xTOFKT_nVJvNNqrrE6JL6L9yha0HUuTH2PASNY';

const TOTAL_SEATS = 500;
const SOLVE_DEDUP_TTL_SEC = 6 * 60 * 60; // CacheService max 6h; supplemented by TextFinder on sheet for durability

// Backfill — the Visits tab only started counting on v1.6 deploy day,
// but Cloudflare has been counting unique visitors at the edge for the
// life of the domain. This anchors the public counter to that real
// 30-day figure at the moment of deploy. Every new visitor after deploy
// ticks both Cloudflare's number and the Visits tab by 1, so the two
// stay roughly in sync going forward (± bot noise).
//
// To re-anchor later: open the Cloudflare dashboard → whatsyourun.xyz
// → 30-day Unique Visitors → set this constant to that number, then
// truncate the Visits tab so the math doesn't double-count.
const VISIT_BASE_OFFSET = 2030;

// Sheet tab names
const FOUNDERS_SHEET = 'Founders';
const SOLVES_SHEET   = 'Solves';
const VISITS_SHEET   = 'Visits';
const PILOT_SHEET    = 'Pilot';

// Header rows (column order matters — read code below relies on it)
const FOUNDERS_HEADERS = ['number', 'email', 'name', 'ref', 'created_at'];
const SOLVES_HEADERS   = ['session_id', 'ref', 'time_to_solve_ms', 'device', 'viewport_w', 'viewport_h', 'referrer', 'created_at'];
const VISITS_HEADERS   = ['session_id', 'ref', 'referrer', 'created_at'];
const PILOT_HEADERS    = ['name', 'phone', 'email', 'sodaChoice', 'interest', 'market', 'functional', 'flavour', 'created_at'];


// ═══════════════════════════════════════════════════════════
// Setup — run ONCE manually from the Apps Script editor to
// initialize the two tabs with header rows. After this, you
// can delete this function or leave it (it's idempotent).
// ═══════════════════════════════════════════════════════════
function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  ensureSheet(ss, FOUNDERS_SHEET, FOUNDERS_HEADERS);
  ensureSheet(ss, SOLVES_SHEET,   SOLVES_HEADERS);
  ensureSheet(ss, VISITS_SHEET,   VISITS_HEADERS);
  ensureSheet(ss, PILOT_SHEET,    PILOT_HEADERS);
  Logger.log('✓ Sheets initialized: "Founders" + "Solves" + "Visits" + "Pilot" (all empty, headers only)');
}


// ═══════════════════════════════════════════════════════════
// doGet — counter read. Cheap, polls every ~10-30s from clients.
// ═══════════════════════════════════════════════════════════
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const founders = rowCount(ss, FOUNDERS_SHEET);
    const solves   = rowCount(ss, SOLVES_SHEET);
    const visits   = rowCount(ss, VISITS_SHEET) + VISIT_BASE_OFFSET;
    const pilots   = rowCount(ss, PILOT_SHEET);
    return json({ founders: founders, solves: solves, visits: visits, pilots: pilots, total: TOTAL_SEATS });
  } catch (err) {
    return json({ error: 'server', message: String(err && err.message || err) });
  }
}


// ═══════════════════════════════════════════════════════════
// doPost — dispatches on body.type.
// Browser POSTs with Content-Type: text/plain (to avoid CORS
// preflight); the body is still JSON-encoded and parsed here.
// ═══════════════════════════════════════════════════════════
function doPost(e) {
  try {
    const raw = (e && e.postData && e.postData.contents) || '{}';
    const body = JSON.parse(raw);
    if (body.type === 'claim') return handleClaim(body);
    if (body.type === 'solve') return handleSolve(body);
    if (body.type === 'visit') return handleVisit(body);
    if (body.type === 'pilot') return handlePilot(body);
    return json({ error: 'bad_type' });
  } catch (err) {
    return json({ error: 'server', message: String(err && err.message || err) });
  }
}


// ── POST · founder claim ─────────────────────────────────────
// Serializes via LockService so two near-simultaneous claims get
// distinct numbers. Email-dedup is authoritative via a TextFinder
// on the email column (cheap — Sheets has an internal index).
function handleClaim(body) {
  // Honeypot — bots fill hidden fields. Return a plausible-but-fake
  // response so the bot doesn't retry. Counter is not burned.
  if (body.website) return json({ number: 0, total: TOTAL_SEATS });

  const email = ((body.email || '') + '').trim().toLowerCase();
  const name  = ((body.name  || '') + '').trim();
  const ref   = ((body.ref   || '') + '').trim() || null;

  if (!isValidEmail(email)) return json({ error: 'invalid_email' });
  if (!isValidName(name))   return json({ error: 'invalid_name' });
  if (ref && !/^\d{1,5}$/.test(ref)) return json({ error: 'invalid_ref' });

  // Soft rate-limit by email hash — the teaser doesn't have IP access
  // from Apps Script, so this is the best we can do. (True IP-rate-
  // limiting requires Cloudflare Worker; see worker/founder.js.)
  const cache = CacheService.getScriptCache();
  const rlKey = 'rl:' + sha256Short(email);
  if (cache.get(rlKey)) return json({ error: 'rate_limited' });
  cache.put(rlKey, '1', 600); // 10 min

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10 * 1000)) {
    return json({ error: 'busy' });
  }
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ensureSheet(ss, FOUNDERS_SHEET, FOUNDERS_HEADERS);

    // Email dedup — linear scan via TextFinder (fast: Sheets indexes internally)
    const finder = sheet
      .getRange(2, 2, Math.max(1, sheet.getLastRow() - 1), 1)
      .createTextFinder(email)
      .matchCase(false)
      .matchEntireCell(true);
    const hit = finder.findNext();
    if (hit) {
      const existingNumber = sheet.getRange(hit.getRow(), 1).getValue();
      return json({ number: Number(existingNumber), total: TOTAL_SEATS, existing: true });
    }

    const currentCount = Math.max(0, sheet.getLastRow() - 1);
    if (currentCount >= TOTAL_SEATS) {
      return json({ closed: true, total: TOTAL_SEATS });
    }

    const next = currentCount + 1;
    sheet.appendRow([
      next,
      email,
      name,
      ref || '',
      new Date().toISOString()
    ]);
    return json({ number: next, total: TOTAL_SEATS });
  } finally {
    lock.releaseLock();
  }
}


// ── POST · anonymous solve ───────────────────────────────────
// No email, no IP. Just session_id + dimensions.
// Dedup via CacheService (fast, 6h TTL) with Sheet-TextFinder as a
// durable second layer so a user who refreshes 7h later still can't
// double-count their solve.
function handleSolve(body) {
  const sessionId = ((body.session_id || '') + '').trim();
  if (!sessionId || sessionId.length > 64 || !/^[A-Za-z0-9_-]+$/.test(sessionId)) {
    return json({ error: 'invalid_session' });
  }

  const cache = CacheService.getScriptCache();
  const dedupKey = 'solve:' + sessionId;

  // Fast-path dedup from cache
  if (cache.get(dedupKey)) {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    return json({ ok: true, solves: rowCount(ss, SOLVES_SHEET), duplicate: true });
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5 * 1000)) {
    // Under contention, just accept the write — worst case is a duplicate
    // row, which gets filtered on the next TextFinder-based dedup.
  }
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ensureSheet(ss, SOLVES_SHEET, SOLVES_HEADERS);

    // Durable dedup — check if this session_id already recorded
    if (sheet.getLastRow() > 1) {
      const dedupFinder = sheet
        .getRange(2, 1, sheet.getLastRow() - 1, 1)
        .createTextFinder(sessionId)
        .matchEntireCell(true);
      if (dedupFinder.findNext()) {
        cache.put(dedupKey, '1', SOLVE_DEDUP_TTL_SEC);
        return json({ ok: true, solves: rowCount(ss, SOLVES_SHEET), duplicate: true });
      }
    }

    const viewport = Array.isArray(body.viewport) ? body.viewport : [0, 0];
    sheet.appendRow([
      sessionId,
      (body.ref || '') + '',
      Number(body.time_to_solve_ms) || 0,
      (body.device || 'unknown') + '',
      Number(viewport[0]) || 0,
      Number(viewport[1]) || 0,
      (body.referrer || '') + '',
      new Date().toISOString()
    ]);
    cache.put(dedupKey, '1', SOLVE_DEDUP_TTL_SEC);
    return json({ ok: true, solves: rowCount(ss, SOLVES_SHEET) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}


// ── POST · anonymous visit ───────────────────────────────────
// Counts unique visitors (one row per session_id). Same privacy
// model as solves — no email, no IP, no UA. Lighter payload than
// solves because there's no time-to-solve, device, or viewport.
function handleVisit(body) {
  const sessionId = ((body.session_id || '') + '').trim();
  if (!sessionId || sessionId.length > 64 || !/^[A-Za-z0-9_-]+$/.test(sessionId)) {
    return json({ error: 'invalid_session' });
  }

  const cache = CacheService.getScriptCache();
  const dedupKey = 'visit:' + sessionId;

  // Fast-path dedup from cache
  if (cache.get(dedupKey)) {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    return json({ ok: true, visits: rowCount(ss, VISITS_SHEET), duplicate: true });
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5 * 1000)) {
    // Under contention, accept the write — TextFinder dedup catches duplicates
  }
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ensureSheet(ss, VISITS_SHEET, VISITS_HEADERS);

    // Durable dedup — check if this session_id already recorded
    if (sheet.getLastRow() > 1) {
      const dedupFinder = sheet
        .getRange(2, 1, sheet.getLastRow() - 1, 1)
        .createTextFinder(sessionId)
        .matchEntireCell(true);
      if (dedupFinder.findNext()) {
        cache.put(dedupKey, '1', SOLVE_DEDUP_TTL_SEC);
        return json({ ok: true, visits: rowCount(ss, VISITS_SHEET), duplicate: true });
      }
    }

    sheet.appendRow([
      sessionId,
      (body.ref || '') + '',
      (body.referrer || '') + '',
      new Date().toISOString()
    ]);
    cache.put(dedupKey, '1', SOLVE_DEDUP_TTL_SEC);
    return json({ ok: true, visits: rowCount(ss, VISITS_SHEET) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}


// ── POST · pilot signup ("Become an Insider") ────────────────
// The /pilot page collects name + phone (+ optional email) and 5
// survey answers. We append one row per submission to the Pilot
// tab. No dedup — a person may legitimately resubmit, and we'd
// rather keep every answer than silently swallow one. LockService
// serializes appends so concurrent submits don't collide on a row.
function handlePilot(body) {
  // Honeypot — same convention as handleClaim. Bots fill hidden
  // fields; return a plausible ok so they don't retry. Nothing written.
  if (body.website) return json({ ok: true, pilots: 0 });

  const name  = ((body.name  || '') + '').trim();
  const phone = ((body.phone || '') + '').trim();
  const email = ((body.email || '') + '').trim();

  // Name + phone are required by the form; email is optional. Keep
  // server validation light (the form already validates client-side)
  // but cap lengths so a row can't be stuffed with garbage.
  if (!name  || name.length  > 80)  return json({ error: 'invalid_name' });
  if (!phone || phone.length > 32)  return json({ error: 'invalid_phone' });
  if (email.length > 254)           return json({ error: 'invalid_email' });

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10 * 1000)) {
    return json({ error: 'busy' });
  }
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ensureSheet(ss, PILOT_SHEET, PILOT_HEADERS);

    // Column order must match PILOT_HEADERS.
    sheet.appendRow([
      name,
      phone,
      email,
      (body.sodaChoice || '') + '',
      (body.interest   || '') + '',
      (body.market     || '') + '',
      (body.functional || '') + '',
      (body.flavour    || '') + '',
      new Date().toISOString()
    ]);
    return json({ ok: true, pilots: rowCount(ss, PILOT_SHEET) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}


// ═══════════════════════════════════════════════════════════
// helpers
// ═══════════════════════════════════════════════════════════
function ensureSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function rowCount(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return 0;
  return Math.max(0, sheet.getLastRow() - 1); // minus header
}

function isValidEmail(e) {
  if (!e || e.length < 5 || e.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function isValidName(n) {
  if (!n || n.length < 1 || n.length > 60) return false;
  return /^[A-Za-zÀ-ÖØ-öø-ÿ' \-]+$/.test(n);
}

function sha256Short(s) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s);
  return bytes.map(function(b) {
    // signed byte → unsigned hex
    const v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('').slice(0, 16);
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
