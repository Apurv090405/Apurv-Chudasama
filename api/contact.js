const OWNER_EMAIL = "fluteofthesoul@gmail.com";
// Resend requires this address/domain to be verified. Keep the Gmail address
// as the recipient, not the sender.
const DEFAULT_FROM = "hello@fluteofthesoul.dev";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sendResendEmail(payload, headers) {
  const body = JSON.stringify(payload);
  return fetch("https://api.resend.com/emails", { method: "POST", headers, body }).catch(() =>
    new Promise((resolve, reject) => {
      const https = require("https");
      const request = https.request("https://api.resend.com/emails", {
        method: "POST",
        headers: { ...headers, "Content-Length": Buffer.byteLength(body) },
      }, (response) => {
        let responseBody = "";
        response.on("data", (chunk) => { responseBody += chunk; });
        response.on("end", () => resolve({ ok: response.statusCode >= 200 && response.statusCode < 300, status: response.statusCode, text: async () => responseBody }));
      });
      request.on("error", reject);
      request.write(body);
      request.end();
    })
  );
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, subject, message, website } = req.body || {};
  if (website) return res.status(200).json({ ok: true });

  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "").trim();
  const cleanSubject = String(subject || "Website contact").trim();
  const cleanMessage = String(message || "").trim();

  if (!cleanName || !cleanEmail || !cleanMessage || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
    return res.status(400).json({ error: "Please provide a valid name, email, and message." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Email service is not configured." });

  const from = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  const safeName = escapeHtml(cleanName);
  const safeEmail = escapeHtml(cleanEmail);
  const safeSubject = escapeHtml(cleanSubject);
  const safeMessage = escapeHtml(cleanMessage).replaceAll("\n", "<br>");

  const ownerEmail = {
    from: `Flute of the Soul <${from}>`,
    to: [OWNER_EMAIL],
    reply_to: cleanEmail,
    subject: `[Portfolio] ${cleanSubject}`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>New portfolio message</h2><p><strong>From:</strong> ${safeName} &lt;${safeEmail}&gt;</p><p><strong>Subject:</strong> ${safeSubject}</p><p>${safeMessage}</p></div>`,
  };
  const confirmationEmail = {
    from: `Flute of the Soul <${from}>`,
    to: [cleanEmail],
    subject: "Thanks for reaching out to Flute of the Soul",
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Thanks for your message, ${safeName}.</h2><p>I received your note and will get back to you soon.</p><p><strong>Your subject:</strong> ${safeSubject}</p><p style="color:#667085">This is an automatic confirmation from fluteofthesoul.dev.</p></div>`,
  };

  try {
    const responses = await Promise.all([
      sendResendEmail(ownerEmail, headers),
      sendResendEmail(confirmationEmail, headers),
    ]);
    const responseBodies = await Promise.all(responses.map(async (response) => ({
      ok: response.ok,
      status: response.status,
      body: await response.text(),
    })));
    if (responseBodies.some((response) => !response.ok)) {
      console.error("[contact] Resend rejected email", responseBodies.map(({ status, body }) => ({ status, body })));
      const payload = { error: "The message could not be delivered. Please email directly." };
      if (process.env.NODE_ENV !== "production") payload.details = responseBodies.map(({ status, body }) => ({ status, body }));
      return res.status(502).json(payload);
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[contact] Resend request failed", error);
    const payload = { error: "The message could not be delivered. Please email directly." };
    if (process.env.NODE_ENV !== "production") payload.details = [{ message: error.message }];
    return res.status(502).json(payload);
  }
}
