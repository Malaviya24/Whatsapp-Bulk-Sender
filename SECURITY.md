# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in BulkSender, please **do not open a public Issue**. Instead, report it privately:

1. Open a [GitHub Security Advisory](../../security/advisories/new) (preferred)
2. Or email the maintainer directly

We will respond within 48 hours and work with you to address the issue.

## Scope

BulkSender is a desktop application that runs locally. The main security concerns are:

- **WhatsApp session storage** — Stored in `.wwebjs_auth/` folder
- **User data** — Phone numbers, messages, history stored locally
- **Local server** — Runs on `localhost:5000` (not exposed to internet by default)

## What We Consider a Vulnerability

✅ **In Scope:**
- Code execution from malicious uploaded files
- Path traversal in file uploads
- Exposure of WhatsApp session data
- Bypassing the local-only server binding
- Injection attacks (XSS, command injection)

❌ **Not in Scope:**
- WhatsApp account bans (use anti-ban features)
- Rate limiting bypasses (this is by design — local app)
- Issues that require physical access to the user's machine
- Issues in upstream dependencies (report to them directly)

## Security Best Practices for Users

- 🔒 **Never share your `.wwebjs_auth/` folder** — It contains your WhatsApp session
- 🔒 **Don't run BulkSender on shared computers**
- 🔒 **Don't expose the local server to the internet** without authentication
- 🔒 **Keep Node.js and dependencies updated**
- 🔒 **Verify download sources** — Only download from official Releases or official repo

## Known Limitations

- The local web server (`localhost:5000`) has no authentication by default. This is fine for local use but should not be exposed to a network without adding auth.
- WhatsApp session data is stored unencrypted on disk (per `whatsapp-web.js` design).
