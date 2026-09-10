#!/usr/bin/env node
/* ------------------------------------------------------------------
 * inject-security-meta.js
 * Adds Content-Security-Policy + Referrer-Policy meta tags to every
 * top-level HTML file in the site. Idempotent: skips files that
 * already contain the tags.
 *
 * Usage:  node tools/inject-security-meta.js
 * ------------------------------------------------------------------ */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// CSP tailored to a static site with GA4, Sentry (optional), self-hosted
// fonts/images/video, mailto: form fallback, and inline GA/cookie scripts.
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' mailto:",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://browser.sentry-cdn.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://sentry.io https://*.ingest.sentry.io https://*.ingest.us.sentry.io mailto:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

const REFERRER = "strict-origin-when-cross-origin";

const SNIPPET =
  `  <meta http-equiv="Content-Security-Policy" content="${CSP}">\n` +
  `  <meta name="referrer" content="${REFERRER}">`;

const HTML_FILES = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith(".html"))
  .map((f) => path.join(ROOT, f));

let touched = 0;
let skipped = 0;

for (const file of HTML_FILES) {
  const src = fs.readFileSync(file, "utf8");
  const name = path.basename(file);

  if (src.includes('http-equiv="Content-Security-Policy"')) {
    console.log(`  =  ${name} (already has CSP)`);
    skipped++;
    continue;
  }

  // Insert right after the viewport meta line. Preserve existing CRLF/LF.
  const eol = src.includes("\r\n") ? "\r\n" : "\n";
  const snippetEol = SNIPPET.replace(/\n/g, eol);
  const viewportRe = /(<meta name="viewport"[^>]*>)(\r?\n)/;

  if (!viewportRe.test(src)) {
    console.log(`  !  ${name} (no viewport meta — skipped)`);
    skipped++;
    continue;
  }

  const out = src.replace(viewportRe, `$1$2${snippetEol}${eol}`);
  fs.writeFileSync(file, out, "utf8");
  console.log(`  +  ${name}`);
  touched++;
}

console.log(
  `\nDone. Injected: ${touched}   Skipped: ${skipped}   Total: ${HTML_FILES.length}`
);
