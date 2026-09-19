/* Small local runtime for the static site plus Vercel-style API functions. */
const fs = require("fs");
const http = require("http");
const path = require("path");
const { URL } = require("url");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.PORT || 3000);

function loadEnv() {
  const envFile = path.join(ROOT, ".env");
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function runContact(request, response) {
  let body = "";
  request.on("data", (chunk) => { body += chunk; });
  request.on("end", async () => {
    try {
      request.body = body ? JSON.parse(body) : {};
    } catch {
      return sendJson(response, 400, { error: "Invalid JSON body." });
    }
    const result = {
      statusCode: 200,
      headers: {},
      status(code) { this.statusCode = code; return this; },
      setHeader(name, value) { this.headers[name] = value; },
      json(payload) { response.writeHead(this.statusCode, this.headers); response.end(JSON.stringify(payload)); },
    };
    try {
      await require(path.join(ROOT, "api", "contact.js"))(request, result);
    } catch (error) {
      console.error("[dev-server] API error", error);
      sendJson(response, 500, { error: "Local API error." });
    }
  });
}

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".pdf": "application/pdf" };
function serveStatic(request, response) {
  const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const safePath = path.normalize(requestPath).replace(/^([.][.][\\/])+/, "");
  let filePath = path.join(ROOT, safePath);
  if (requestPath.endsWith("/")) filePath = path.join(filePath, "index.html");
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) filePath = path.join(ROOT, "index.html");
  const extension = path.extname(filePath).toLowerCase();
  response.writeHead(200, { "Content-Type": `${MIME[extension] || "application/octet-stream"}; charset=utf-8` });
  fs.createReadStream(filePath).pipe(response);
}

loadEnv();
http.createServer((request, response) => {
  if (request.url.startsWith("/api/contact") && request.method === "POST") return runContact(request, response);
  if (request.url.startsWith("/api/contact")) return sendJson(response, 405, { error: "Method not allowed" });
  serveStatic(request, response);
}).listen(PORT, () => console.log(`[dev-server] http://localhost:${PORT}`));
