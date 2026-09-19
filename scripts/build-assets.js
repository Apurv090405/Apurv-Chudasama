#!/usr/bin/env node
/* Build the local presentation layer once for production. The source files
 * remain easy to edit; Vercel serves only the bundled, minified assets. */
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUTDIR = path.join(ROOT, "assets");

async function build() {
  fs.mkdirSync(OUTDIR, { recursive: true });

  const scripts = ["main.js", "anim.js"]
    .map((file) => fs.readFileSync(path.join(ROOT, file), "utf8"))
    .join("\n");
  await esbuild.transform(scripts, {
    loader: "js",
    minify: true,
    target: ["es2018"],
  }).then((result) => fs.writeFileSync(path.join(OUTDIR, "site.js"), result.code));

  const styles = ["styles.css", "soul.css", "mac-app.css", "boot.css", "anim.css", "pages.css"]
    .map((file) => fs.readFileSync(path.join(ROOT, file), "utf8"))
    .join("\n");

  await esbuild.transform(styles, {
    loader: "css",
    minify: true,
    target: ["es2018"],
  }).then((result) => fs.writeFileSync(path.join(OUTDIR, "site.css"), result.code));

  const blogStyles = fs.readFileSync(path.join(ROOT, "blog.css"), "utf8");
  await esbuild.transform(blogStyles, {
    loader: "css",
    minify: true,
    target: ["es2018"],
  }).then((result) => fs.writeFileSync(path.join(OUTDIR, "blog.css"), result.code));

  console.log("[build-assets] Wrote optimized CSS and JavaScript assets");
}

build().catch((error) => {
  console.error("[build-assets]", error);
  process.exit(1);
});
