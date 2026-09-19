#!/usr/bin/env node
/*
 * Renders _posts/*.md into static blog pages and a real api/posts.json.
 *
 * GitHub Pages runs Jekyll, which does this itself (see _layouts/blog.html and
 * api/posts.source.json). Vercel has no Jekyll step, so without this script it
 * serves the raw Liquid template, main.js fails to parse it, and the site falls
 * back to the "Build Mode" placeholder. This script produces the same URLs
 * Jekyll does — /blog/:year/:month/:day/:title/ and /api/posts.json — and
 * shares blog.css with the Jekyll layout so the two stay visually identical.
 *
 * Outputs (blog/ and api/posts.json) are gitignored build artifacts.
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

const ROOT = path.join(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "_posts");
const BLOG_OUT = path.join(ROOT, "blog");
const BLOG_INDEX_OUT = path.join(ROOT, "blogs", "index.html");
const API_OUT = path.join(ROOT, "api", "posts.json");

const AUTHOR_NAME = "Apurv Chudasama";
const AUTHOR_BIO =
  "AI Engineer and Data Scientist focused on applied machine learning, deep learning, and production AI systems.";
const AVATAR_URL = "/Images/avatar.png";
const WORDS_PER_MINUTE = 180;
const SITE = "https://fluteofthesoul.dev";
const ASSET_VERSION = "20260919-dark";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

marked.setOptions({ gfm: true, breaks: false });

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Mirrors Jekyll's :title slug: filename minus the leading date.
function parseFilename(filename) {
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.(md|markdown)$/);
  if (!match) return null;
  const [, year, month, day, slug] = match;
  return { year, month, day, slug };
}

function readMinutes(markdown) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  // Matches the Liquid layout: integer division, then +1.
  return Math.floor(words / WORDS_PER_MINUTE) + 1;
}

function heroImage(data) {
  const image = data.image;
  if (!image) return null;
  return typeof image === "string" ? image : image.path || null;
}

function firstCategory(data) {
  const categories = data.categories;
  if (!categories) return null;
  return Array.isArray(categories) ? categories[0] || null : categories;
}

function excerptFrom(data, markdown) {
  const source =
    data.description ||
    markdown
      .replace(/^#+\s.*$/gm, "")
      .replace(/[*_`>#\[\]]/g, "")
      .trim()
      .split(/\n\s*\n/)[0] ||
    "";
  const text = source.replace(/\s+/g, " ").trim();
  // Liquid's `truncate: 160` includes the ellipsis in the 160 chars.
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

function renderRelatedPosts(posts) {
  if (!posts.length) return "";
  return `<section class="related-posts" aria-labelledby="related-posts-title">
          <h2 id="related-posts-title">Continue reading</h2>
          <div class="related-posts-grid">
            ${posts.map((post) => `<a href="${post.url}" class="related-post">
              <span>${escapeHtml(post.category || "AI Engineering")}</span>
              <strong>${escapeHtml(post.title)}</strong>
            </a>`).join("")}
          </div>
          <p class="related-posts-links"><a href="/blogs/">Browse all AI engineering notes</a><a href="/">View Apurv's AI engineering portfolio</a></p>
        </section>`;
}

function isoDate(value, fallback) {
  if (!value) return fallback;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const match = String(value).match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : fallback;
}

function renderBlogIndex(posts) {
  const cards = posts.map((post) => `<a class="seo-page__card" href="${post.url}">
      <span>${escapeHtml(post.dateDisplay)}</span>
      <strong>${escapeHtml(post.title)}</strong>
      <p>${escapeHtml(post.excerpt)}</p>
    </a>`).join("\n");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AI Engineering Blog | Flute of the Soul</title>
<meta name="description" content="Technical notes on AI agents, autonomous systems, LangGraph, RAG, model evaluation, and production AI engineering by Apurv Chudasama." />
<link rel="canonical" href="${SITE}/blogs/" /><link rel="stylesheet" href="/assets/site.css?v=${ASSET_VERSION}" />
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Blog","name":"Flute of the Soul — AI Engineering Notes","url":"${SITE}/blogs/","author":{"@type":"Person","name":"${AUTHOR_NAME}"}}</script>
</head><body><main class="seo-page"><nav class="seo-page__nav" aria-label="Primary"><a href="/">Home</a><a href="/about/">About</a><a href="/projects/">Projects</a><a href="/publications/">Publications</a></nav><span class="seo-page__eyebrow">Writing</span><h1>AI engineering notes</h1><p class="seo-page__lede">Practical essays on AI agents, autonomous systems, LangGraph, retrieval, evaluation, and deploying LLM applications.</p><div class="seo-page__grid">${cards}</div></main></body></html>`;
}

function renderPage(post, relatedPosts) {
  const kicker = post.category
    ? `<div class="article-kicker">${escapeHtml(post.category)}</div>`
    : "";
  const subtitle = post.description
    ? `<p class="article-subtitle">${escapeHtml(post.description)}</p>`
    : "";
  const hero = post.hero
    ? `<div class="hero-image-wrap">
          <img
            class="hero-image"
            src="${escapeHtml(post.hero)}"
            alt="${escapeHtml(post.title)}"
            loading="lazy"
            onerror="this.closest('.hero-image-wrap').remove()"
          />
        </div>`
    : "";
  const ogImage = post.hero
    ? `<meta property="og:image" content="${escapeHtml(post.hero)}" />`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(post.title)} | ${AUTHOR_NAME}</title>
    <meta name="description" content="${escapeHtml(post.excerpt)}" />

    <meta property="og:title" content="${escapeHtml(post.title)} | ${AUTHOR_NAME}" />
    <meta property="og:description" content="${escapeHtml(post.excerpt)}" />
    ${ogImage}

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Marcellus&family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />

    <link rel="canonical" href="${SITE}${post.url}" />
    <meta property="og:url" content="${SITE}${post.url}" />
    <meta property="og:type" content="article" />
    <meta property="article:published_time" content="${post.iso}" />
    <meta property="article:author" content="${AUTHOR_NAME}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": ${JSON.stringify(post.title)},
      "description": ${JSON.stringify(post.excerpt)},
      "datePublished": "${post.iso}",
      "dateModified": "${post.updated}",
      "author": { "@type": "Person", "name": "${AUTHOR_NAME}", "url": "${SITE}/" },
      "mainEntityOfPage": "${SITE}${post.url}"
    }
    </script>

    <!-- Shared reading theme (also used by _layouts/blog.html). -->
    <link rel="stylesheet" href="/assets/blog.css?v=${ASSET_VERSION}" />
  </head>
  <body>
    <div class="mac-window">
      <header class="mac-titlebar">
        <span class="traffic-lights" aria-hidden="true">
          <span class="traffic-light traffic-light--close"></span>
          <span class="traffic-light traffic-light--minimize"></span>
          <span class="traffic-light traffic-light--zoom"></span>
        </span>
        <span class="titlebar-title">${escapeHtml(post.title)}</span>
        <span class="titlebar-meta">${post.readMinutes} min read</span>
      </header>

      <main class="article-shell">
        <header class="article-head">
          ${kicker}
          <h1 class="article-title">${escapeHtml(post.title)}</h1>
          ${subtitle}

          <div class="author-row">
            <img class="author-avatar" src="${AVATAR_URL}" alt="${AUTHOR_NAME}" />
            <div class="author-meta">
              <span class="author-name">${escapeHtml(post.author)}</span>
              <span class="author-line">${escapeHtml(post.dateDisplay)} · ${post.readMinutes} min read</span>
            </div>
          </div>
        </header>

        ${hero}

        <article class="article-content">${post.html}</article>

        ${renderRelatedPosts(relatedPosts)}

        <section class="author-card">
          <img class="author-avatar" src="${AVATAR_URL}" alt="${AUTHOR_NAME}" />
          <div>
            <div class="author-name">Written by ${escapeHtml(post.author)}</div>
            <p>${escapeHtml(post.authorBio)}</p>
          </div>
        </section>

        <footer class="page-footer">
          <p>&copy; ${post.year} ${AUTHOR_NAME}. All rights reserved.</p>
        </footer>
      </main>
    </div>
  </body>
</html>
`;
}

function build() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`[build-blog] No _posts directory at ${POSTS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((file) => /\.(md|markdown)$/.test(file))
    .sort();

  const posts = [];
  const skipped = [];

  for (const file of files) {
    const parsed = parseFilename(file);
    if (!parsed) {
      skipped.push(file);
      continue;
    }

    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const { year, month, day, slug } = parsed;

    posts.push({
      title: data.title || slug,
      description: data.description || "",
      excerpt: excerptFrom(data, content),
      author: data.author || AUTHOR_NAME,
      authorBio: data.author_bio || AUTHOR_BIO,
      category: firstCategory(data),
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
      hero: heroImage(data),
      html: marked.parse(content),
      readMinutes: readMinutes(content),
      dateDisplay: `${MONTHS[Number(month) - 1]} ${day}, ${year}`,
      iso: `${year}-${month}-${day}`,
      updated: isoDate(data.updated, `${year}-${month}-${day}`),
      sortKey: `${year}-${month}-${day}-${slug}`,
      year,
      url: `/blog/${year}/${month}/${day}/${slug}/`,
      outDir: path.join(BLOG_OUT, year, month, day, slug),
    });
  }

  // Newest first, matching Jekyll's site.posts ordering.
  posts.sort((a, b) => b.sortKey.localeCompare(a.sortKey));

  fs.rmSync(BLOG_OUT, { recursive: true, force: true });

  for (const post of posts) {
    const relatedPosts = posts
      .filter((candidate) => candidate.url !== post.url)
      .map((candidate) => ({
        post: candidate,
        score:
          (candidate.category && candidate.category === post.category ? 3 : 0) +
          candidate.tags.filter((tag) => post.tags.includes(tag)).length,
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || b.post.sortKey.localeCompare(a.post.sortKey))
      .slice(0, 3)
      .map(({ post: relatedPost }) => relatedPost);
    fs.mkdirSync(post.outDir, { recursive: true });
    fs.writeFileSync(path.join(post.outDir, "index.html"), renderPage(post, relatedPosts));
  }

  fs.mkdirSync(path.dirname(BLOG_INDEX_OUT), { recursive: true });
  fs.writeFileSync(BLOG_INDEX_OUT, renderBlogIndex(posts));

  const index = posts.map((post) => ({
    title: post.title,
    date: post.dateDisplay,
    image: post.hero,
    url: post.url,
    excerpt: post.excerpt,
  }));

  fs.mkdirSync(path.dirname(API_OUT), { recursive: true });
  fs.writeFileSync(API_OUT, `${JSON.stringify(index, null, 2)}\n`);

  // Sitemap and robots.txt, generated from the same post list so they can
  // never drift from what actually shipped.
  const urls = [
    { loc: `${SITE}/`, priority: "1.0", changefreq: "weekly" },
    { loc: `${SITE}/about/`, priority: "0.7", changefreq: "monthly" },
    { loc: `${SITE}/projects/`, priority: "0.8", changefreq: "monthly" },
    { loc: `${SITE}/publications/`, priority: "0.7", changefreq: "monthly" },
    { loc: `${SITE}/blogs/`, priority: "0.8", changefreq: "weekly" },
    ...posts.map((post) => ({
      loc: `${SITE}${post.url}`,
      lastmod: post.updated,
      priority: "0.7",
      changefreq: "monthly",
    })),
  ];

  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url>\n    <loc>${u.loc}</loc>\n` +
          (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : "") +
          `    <changefreq>${u.changefreq}</changefreq>\n` +
          `    <priority>${u.priority}</priority>\n  </url>`
      )
      .join("\n") +
    `\n</urlset>\n`;

  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap);
  fs.writeFileSync(
    path.join(ROOT, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`
  );

  console.log(`[build-blog] Rendered ${posts.length} posts to blog/`);
  console.log(`[build-blog] Wrote sitemap.xml (${urls.length} urls) and robots.txt`);
  console.log(`[build-blog] Wrote ${path.relative(ROOT, API_OUT)}`);
  if (skipped.length) {
    console.warn(
      `[build-blog] Skipped ${skipped.length} file(s) without a YYYY-MM-DD-title name: ${skipped.join(", ")}`
    );
  }
}

build();
