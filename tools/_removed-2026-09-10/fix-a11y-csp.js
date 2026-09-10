#!/usr/bin/env node
/* ------------------------------------------------------------------
   fix-a11y-csp.js — one-shot remediation for Lighthouse findings
   1. errors-in-console : remove `frame-ancestors 'none';` from the CSP
      <meta> (that directive is IGNORED in meta and only logs a warning;
      clickjacking protection must be delivered via an HTTP header).
   2. heading-order     : footer column headings <h4> -> <h3> so the
      document outline does not skip a level (content ends at <h2>).
   Idempotent + preserves each file's existing CRLF/LF endings.
------------------------------------------------------------------ */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const files = fs.readdirSync(root).filter((f) => f.endsWith(".html"));

let touched = 0;
const report = [];

for (const file of files) {
  const full = path.join(root, file);
  const before = fs.readFileSync(full, "utf8");
  let after = before;
  const notes = [];

  // 1. drop frame-ancestors from the meta CSP (ignored + noisy)
  if (after.includes("frame-ancestors 'none'; ")) {
    after = after.replace(/frame-ancestors 'none'; /g, "");
    notes.push("csp:frame-ancestors-removed");
  }

  // 2. footer headings h4 -> h3 (exact strings; mega-menu h4 untouched)
  if (after.includes("<h4>Explore</h4>")) {
    after = after.replace(/<h4>Explore<\/h4>/g, "<h3>Explore</h3>");
    notes.push("heading:Explore->h3");
  }
  if (after.includes("<h4>Contact</h4>")) {
    after = after.replace(/<h4>Contact<\/h4>/g, "<h3>Contact</h3>");
    notes.push("heading:Contact->h3");
  }

  if (after !== before) {
    fs.writeFileSync(full, after, "utf8");
    touched++;
    report.push(`  \u2713 ${file}  [${notes.join(", ")}]`);
  }
}

console.log(`fix-a11y-csp: ${touched} of ${files.length} HTML files updated`);
console.log(report.join("\n"));
