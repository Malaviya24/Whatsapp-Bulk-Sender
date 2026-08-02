# Changelog

All notable changes to BulkSender will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.2] - 2026-08-02

### Fixed
- Messages are no longer sent twice. The previous retry logic resent a message when whatsapp-web.js resolved `sendMessage` without a message object, which duplicated deliveries.
- Sent messages are no longer reported as `failed`. When whatsapp-web.js cannot build the returned message object (WhatsApp Web version drift), the app now verifies delivery through the chat store and marks the message as sent.
- WhatsApp Web version is now pinned to the exact build this app delivers on (`2.3000.1044306241`), bundled with the app and served with strict caching, so the app can never silently fall back to an incompatible live build again.

## [2.0.1] - 2026-08-02

### Fixed
- Sending no longer fails with `Cannot read properties of undefined (reading 'id')` when WhatsApp's chat/comms layer is not fully ready. Such sends now retry once after waiting for the connection to settle.
- Message delivery status (Delivered/Read) now persists to history across restarts.
- Uploaded media and temporary files are cleaned up automatically, and upload filenames are sanitized to prevent path traversal.
- History/dashboard no longer render raw HTML from message content (XSS hardening).
- Corrupt numbers files and media save failures now return a clear error instead of hanging the request.

## [2.0.0] - 2026-05-22

### Added
- Complete rewrite using `whatsapp-web.js` for reliable messaging
- Professional dashboard UI with sidebar navigation
- QR code scanning directly in the dashboard (no separate browser)
- Real-time delivery tracking (Pending → Sent → Delivered → Read)
- Anti-ban protection with random delays and batch cooldowns
- Media attachment support (images, videos, documents)
- Spin syntax (`{Hi|Hello|Hey}`) for human-like messaging
- Phone number validation before sending
- Cancel sending mid-batch
- Filterable dashboard (Sent, Failed, Total)
- Search and filter message history
- Export history to Excel
- System tray icon with quit/restart menu
- One-click installer (`install.bat`)
- Auto-installs Node.js if not present
- Desktop shortcut with custom icon
- Start Menu integration
- Silent launcher via VBS for clean startup
- Stop and uninstall scripts
- Settings page to configure `.env` from UI
- Sample files included (numbers and message)

### Changed
- Switched from Python (Selenium) to Node.js (whatsapp-web.js)
- Better error handling — server doesn't crash on Puppeteer errors
- Sessions saved permanently — no need to scan QR every time

### Removed
- Python/Flask backend (replaced with Node.js)
- Selenium dependency (was unreliable)
- pywhatkit (limited functionality)

## [1.0.0] - 2026-05-21

### Added
- Initial Python/Flask version
- Basic bulk messaging with pywhatkit
- File upload for numbers and messages
- Simple web UI

[2.0.0]: https://github.com/Malaviya24/Whatsapp-Bulk-Sender/releases/tag/v2.0.0
[1.0.0]: https://github.com/Malaviya24/Whatsapp-Bulk-Sender/releases/tag/v1.0.0
