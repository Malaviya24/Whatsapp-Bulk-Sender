# Contributing to BulkSender

First off, thank you for considering contributing! Every contribution helps make BulkSender better for everyone.

## Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest features
- 📝 Improve documentation
- 🔧 Submit code (bug fixes, new features)
- 🌍 Translate the UI to other languages
- ⭐ Star the repo and share it

## Reporting Bugs

Before opening a new issue:
1. **Search existing issues** to avoid duplicates
2. **Update to the latest version** to confirm the bug still exists

When opening a bug report, include:
- **Clear title** describing the issue
- **Steps to reproduce** (numbered list)
- **Expected behavior** vs **actual behavior**
- **Screenshots** if relevant
- **Your environment**: Windows version, Node.js version, browser

## Suggesting Features

Open an Issue with:
- **Clear title** starting with "[Feature Request]"
- **Use case** — why this feature is useful
- **Proposed solution** if you have one
- **Alternatives considered**

## Pull Requests

### Setup

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/Malaviya24/Whatsapp-Bulk-Sender.git
cd Whatsapp-Bulk-Sender
npm install
npm start
```

### Development Workflow

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/my-new-feature
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes** — keep them focused and minimal
3. **Test thoroughly** — try edge cases
4. **Commit with clear messages**:
   ```bash
   git commit -m "Add: scheduling support for messages"
   git commit -m "Fix: QR code timeout handling"
   ```

5. **Push and open a PR**:
   ```bash
   git push origin feature/my-new-feature
   ```

### Code Style

- Use **2 spaces** for indentation
- Use **single quotes** for strings in JS
- Add **comments** for complex logic
- Keep functions **small and focused**
- **Test your changes** before submitting

### What Makes a Good PR

✅ **Good:**
- One feature/fix per PR
- Clear description of what changed and why
- Tested manually
- No unrelated changes

❌ **Avoid:**
- Mixing multiple features in one PR
- Reformatting unrelated code
- Adding heavy dependencies without discussion
- Breaking existing features

## Project Structure

```
server.js           — Backend logic (Express + WhatsApp client)
public/
  dashboard.html    — Main UI
  app.js            — Frontend JavaScript
  styles.css        — Styles
scripts/            — PowerShell scripts for setup
```

### Adding a New API Endpoint

1. Add the route in `server.js`
2. Add corresponding frontend call in `public/app.js`
3. Update UI in `public/dashboard.html` if needed
4. Test the full flow end-to-end

### Adding a New UI Feature

1. Add HTML structure in `public/dashboard.html`
2. Add styles in `public/styles.css`
3. Add JavaScript handlers in `public/app.js`
4. Wire up to backend if needed

## Feature Ideas Looking for Contributors

- [ ] **Schedule messages** — Send at specific date/time
- [ ] **Multi-account** — Support multiple WhatsApp numbers
- [ ] **Group messaging** — Send to WhatsApp groups
- [ ] **Templates library** — Save and reuse message templates
- [ ] **CSV variables** — `{{Name}}`, `{{Company}}` from CSV columns
- [ ] **Auto-reply mode** — Reply to incoming messages automatically
- [ ] **macOS support** — Test and adapt scripts for macOS
- [ ] **Linux support** — Test and adapt scripts for Linux
- [ ] **i18n** — Translate UI to other languages
- [ ] **Dark mode toggle** — User-switchable theme
- [ ] **Electron version** — Standalone .exe build
- [ ] **Message preview** — See what each message will look like before sending
- [ ] **Failed retry** — Auto-retry failed messages

Pick one, comment on the related Issue (or open one), and submit a PR!

## Code of Conduct

Be kind, respectful, and constructive. We're all here to build something cool together.

## Questions?

Open an Issue with the `question` label, or comment on existing discussions.

---

Thanks for contributing! 🙌
