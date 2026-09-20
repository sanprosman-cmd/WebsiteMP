#!/usr/bin/env node
/**
 * Static-site integrity validator for this folder (maharaniprima-site).
 * Checks: local file references, same-page anchors, cross-page anchors,
 * JSON-LD validity, tag balance, SEO meta presence, generated .min asset
 * freshness, sitemap lastmod drift against git history (warn only).
 *
 * Run:  node tools/validate.js
 */
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const pages = fs.readdirSync(root).filter(f => f.endsWith(".html"));
let issues = 0;

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1]);

  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|#)/.test(ref)) continue;
    const clean = decodeURIComponent(ref.split("#")[0].split("?")[0]);
    if (clean && !fs.existsSync(path.join(root, clean))) {
      console.log(`MISSING FILE ${page} -> ${ref}`); issues++;
    }
  }

  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
  for (const ref of refs) {
    if (!ref.startsWith("#")) continue;
    const frag = ref.slice(1);
    if (frag && !ids.has(frag)) { console.log(`BROKEN ANCHOR ${page} -> #${frag}`); issues++; }
  }

  for (const ref of refs) {
    const m = ref.match(/^([^#]+\.html)#(.+)$/);
    if (!m || /^https?:/.test(ref)) continue;
    const targetPath = path.join(root, m[1]);
    if (!fs.existsSync(targetPath)) { console.log(`CROSS PAGE 404 ${page} -> ${ref}`); issues++; continue; }
    const target = fs.readFileSync(targetPath, "utf8");
    const tids = new Set([...target.matchAll(/id="([^"]+)"/g)].map(x => x[1]));
    if (!tids.has(m[2])) { console.log(`CROSS ANCHOR ${page} -> ${ref}`); issues++; }
  }

  for (const ld of [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]) {
    try { JSON.parse(ld[1]); } catch (e) { console.log(`BAD JSON-LD ${page}: ${e.message}`); issues++; }
  }

  for (const tag of ["div","section","article","header","footer","nav","main","form","table","figure","aside","ul","ol","li"]) {
    const open = (html.match(new RegExp(`<${tag}[\\s>]`, "g")) || []).length;
    const close = (html.match(new RegExp(`</${tag}>`, "g")) || []).length;
    if (open !== close) { console.log(`TAG IMBALANCE ${page} <${tag}>: ${open} open / ${close} close`); issues++; }
  }

  const noindex = /<meta name="robots"[^>]*noindex/i.test(html);
  if (page !== "404.html") {
    if (!/<meta name="description"/.test(html)) console.log(`NO DESCRIPTION ${page}`);
    // noindex pages (e.g. thank-you.html) intentionally omit canonical — they must not be indexed or submitted
    if (!noindex && !/rel="canonical"/.test(html)) console.log(`NO CANONICAL ${page}`);
  }
}

/* Generated assets: the pages only ever load the .min files, so a stale or
   missing one ships silently. Fail when it is absent or older than its source. */
const MIN_PAIRS = [
  ["css/styles.css", "css/styles.min.css"],
  ["js/main.js", "js/main.min.js"],
];
for (const [src, min] of MIN_PAIRS) {
  const srcPath = path.join(root, src);
  const minPath = path.join(root, min);
  if (!fs.existsSync(minPath)) {
    console.log(`MISSING GENERATED ASSET ${min} (build it from ${src})`); issues++;
    continue;
  }
  const srcM = fs.statSync(srcPath).mtimeMs;
  const minM = fs.statSync(minPath).mtimeMs;
  if (minM < srcM) {
    console.log(`STALE GENERATED ASSET ${min} is older than ${src} — rebuild it`); issues++;
  }
}

/* Sitemap freshness: a page that changed while the sitemap did not is stale.
   File mtimes cannot tell you that — on a fresh clone every page looks edited
   today, which trains everyone to ignore the warning. So ask git instead: warn
   when a page's last commit is newer than sitemap.xml's (a commit that touched
   both had its chance), and fall back to mtime only for uncommitted edits. */
const touched = {};            // path -> ms of the most recent commit that changed it
const dirty = new Set();       // pages modified in the working tree
let byGit = false;
try {
  const { execFileSync } = require("child_process");
  const log = execFileSync("git", ["log", "--format=%cI", "--name-only"],
    { cwd: root, encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
  let ms = 0;
  for (const line of log.split(/\r?\n/)) {
    if (/^\d{4}-\d{2}-\d{2}T/.test(line)) { ms = Date.parse(line); continue; }
    if (!line.endsWith(".html") && line !== "sitemap.xml") continue;
    if (!(line in touched)) touched[line] = ms;
  }
  for (const line of execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).split(/\r?\n/)) {
    const file = line.slice(3).split(" -> ").pop().trim();
    if (file.endsWith(".html")) dirty.add(file);
  }
  byGit = true;
} catch (e) { /* no git to ask — the mtime fallback is noisier but never silent */ }

const sitemapMs = touched["sitemap.xml"] || 0;
function dayString(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
/* Returns a reason to warn about, or "" when the entry is straight. */
function driftOf(name, lastmod) {
  const byMtime = () => {
    const day = dayString(fs.statSync(path.join(root, name)).mtime);
    return day > lastmod ? `edited ${day}, lastmod ${lastmod}` : "";
  };
  if (dirty.has(name) || !byGit) return byMtime();
  const ms = touched[name];
  if (!ms || ms <= sitemapMs) return "";
  return `committed ${dayString(new Date(ms))}, lastmod ${lastmod}`;
}

const warns = [];
const sitemapPath = path.join(root, "sitemap.xml");
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  for (const entry of [...sitemap.matchAll(/<url>[\s\S]*?<\/url>/g)]) {
    const loc = (entry[0].match(/<loc>([^<]+)<\/loc>/) || [])[1];
    const lastmod = (entry[0].match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1];
    if (!loc || !lastmod) continue;
    let name = decodeURIComponent(loc.replace(/^https?:\/\/[^/]+\/?/, ""));
    if (name === "") name = "index.html";
    if (!name.endsWith(".html")) continue;
    const filePath = path.join(root, name);
    if (!fs.existsSync(filePath)) continue;
    const drift = driftOf(name, lastmod);
    if (drift) warns.push(`SITEMAP DRIFT ${name}: ${drift} — bump <lastmod>`);
  }
}
warns.forEach(w => console.log(w));

console.log(issues === 0 ? "ALL CHECKS PASSED" : `${issues} ISSUES FOUND`);
process.exit(issues === 0 ? 0 : 1);
