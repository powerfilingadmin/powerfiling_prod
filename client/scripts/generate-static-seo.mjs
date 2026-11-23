/**
 * Runs automatically after `vite build` (see package.json "build" script).
 *
 * 1. Guard   – fails the build if a service in servicesData.js has no entry
 *              in seoData.js (so a new service can't ship with no title).
 * 2. Pages   – writes a copy of dist/index.html for every public URL with that
 *              page's own <title>, description, canonical and Open Graph tags.
 *              Crawlers / link-preview bots that do not run JavaScript
 *              (WhatsApp, LinkedIn, many SEO audit tools) then see the correct
 *              tags, not the homepage's. Vercel serves these static files
 *              before applying the "/(.*) -> /" SPA rewrite.
 * 3. Sitemap – writes dist/sitemap.xml with every indexable URL.
 *
 * Usage:
 *   node scripts/generate-static-seo.mjs                  (normal build step)
 *   node scripts/generate-static-seo.mjs --sitemap-public (also refresh public/sitemap.xml)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const srcData = path.join(root, "src", "data");

/* ---------- load seoData.js without needing "type": "module" ---------- */
const seoSource = fs.readFileSync(path.join(srcData, "seoData.js"), "utf8");
const seo = await import(
  "data:text/javascript;base64," + Buffer.from(seoSource).toString("base64")
);
const { SITE_URL, DEFAULT_OG_IMAGE, pageSeo, serviceSeo, SITEMAP_PRIORITY } = seo;

const blogsRaw = fs.readFileSync(path.join(srcData, "blogs.json"), "utf8").replace(/^\uFEFF/, "");
const blogs = JSON.parse(blogsRaw);

/* ---------- 1. guard: every real service must have SEO data ---------- */
const servicesSource = fs
  .readFileSync(path.join(srcData, "servicesData.js"), "utf8")
  .split(/\r?\n/)
  .filter((line) => !line.trim().startsWith("//"))
  .join("\n");
const serviceIds = [...servicesSource.matchAll(/^ {4}id:\s*"([^"]+)"/gm)].map((m) => m[1]);
const missing = serviceIds.filter((id) => !serviceSeo[id]);
if (missing.length) {
  console.error(
    `\n[seo] BUILD FAILED – add title/description in src/data/seoData.js for: ${missing.join(", ")}\n`
  );
  process.exit(1);
}
const extra = Object.keys(serviceSeo).filter((id) => !serviceIds.includes(id));
if (extra.length) console.warn(`[seo] warning: seoData has entries with no matching service: ${extra.join(", ")}`);

/* ---------- helpers ---------- */
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const setMeta = (html, attr, key, value) => {
  const re = new RegExp(`(<meta data-rh="true" ${attr}="${key}" content=")[^"]*(" ?/?>)`);
  if (!re.test(html)) throw new Error(`[seo] template is missing <meta ${attr}="${key}" data-rh>`);
  return html.replace(re, `$1${esc(value)}$2`);
};

const buildPage = (template, { title, description, canonicalPath, ogType = "website" }) => {
  const url = `${SITE_URL}${canonicalPath}`;
  let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = setMeta(html, "name", "description", description);
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:type", ogType);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "property", "og:image", DEFAULT_OG_IMAGE);
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", description);
  html = html.replace(
    /(<link data-rh="true" rel="canonical" href=")[^"]*(" ?\/?>)/,
    `$1${url}$2`
  );
  return html;
};

const writeRoute = (routePath, html) => {
  const file =
    routePath === "/"
      ? path.join(dist, "index.html")
      : path.join(dist, routePath.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
};

/* ---------- 2. per-page static HTML ---------- */
const indexPath = path.join(dist, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error("[seo] dist/index.html not found – run `vite build` first.");
  process.exit(1);
}
const template = fs.readFileSync(indexPath, "utf8");

const routes = [];
for (const [p, v] of Object.entries(pageSeo)) routes.push({ path: p, ...v });
for (const [id, v] of Object.entries(serviceSeo)) routes.push({ path: `/services/${id}`, ...v });
for (const b of blogs) {
  routes.push({
    path: `/blog/${b.id}`,
    title: b.metaTitle || b.title,
    description: b.metaDescription || b.excerpt,
    ogType: "article",
    lastmod: toIsoDate(b.date),
  });
}

function toIsoDate(s) {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

for (const r of routes) {
  writeRoute(r.path, buildPage(template, { ...r, canonicalPath: r.path }));
}

/* ---------- 3. sitemap ---------- */
const urlEntry = (r) => {
  const [freq, prio] =
    SITEMAP_PRIORITY[r.path] ||
    (r.path.startsWith("/services/") ? ["monthly", "0.8"]
      : r.path.startsWith("/calculators/") ? ["monthly", "0.7"]
      : r.path.startsWith("/blog/") ? ["monthly", "0.6"]
      : ["yearly", "0.3"]);
  return [
    "  <url>",
    `    <loc>${SITE_URL}${r.path === "/" ? "/" : r.path}</loc>`,
    r.lastmod ? `    <lastmod>${r.lastmod}</lastmod>` : null,
    `    <changefreq>${freq}</changefreq>`,
    `    <priority>${prio}</priority>`,
    "  </url>",
  ].filter(Boolean).join("\n");
};

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes.map(urlEntry).join("\n") +
  `\n</urlset>\n`;

fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);
if (process.argv.includes("--sitemap-public")) {
  fs.writeFileSync(path.join(root, "public", "sitemap.xml"), sitemap);
  console.log("[seo] public/sitemap.xml refreshed");
}

console.log(`[seo] wrote ${routes.length} static pages + sitemap.xml (${routes.length} URLs)`);
