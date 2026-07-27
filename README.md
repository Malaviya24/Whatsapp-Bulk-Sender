<div align="center">

<img src="public/logo.png" alt="BulkSender Logo" width="120" />

# BulkSender

### Free, Open-Source WhatsApp Bulk Message Sender

A professional desktop application for sending bulk WhatsApp messages with anti-ban protection, media support, and real-time delivery tracking.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/Malaviya24/Whatsapp-Bulk-Sender?include_prereleases&label=release)](https://github.com/Malaviya24/Whatsapp-Bulk-Sender/releases/latest)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/platform-Windows-0078D6?logo=windows&logoColor=white)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Screenshots](#-screenshots) • [Configuration](#-configuration) • [Contributing](#-contributing)

</div>

---

## Why BulkSender?

Most WhatsApp bulk senders are either expensive paid tools, fragile Python scripts, or developer libraries. **BulkSender is a complete desktop application** that anyone can use — no coding skills, no subscriptions, no cloud accounts. Just install and send.


## ✨ Features

### 📤 Smart Sending
- **Bulk messaging** — Send to hundreds of contacts in one go
- **Multiple input methods** — Type numbers directly or upload TXT/CSV/Excel files
- **Auto column detection** — Excel/CSV files: auto-detects phone/number/mobile columns
- **Spin syntax** — `{Hi|Hello|Hey}` randomizes per recipient (looks human)

### 🖼️ Rich Media Support
- Images (JPG, PNG, GIF, WebP)
- Videos (MP4, MOV, 3GP)
- Documents (PDF, DOCX, XLSX)
- Audio files
- Text captions with media

### 🛡️ Anti-Ban Protection
- **Random delays** between messages (configurable min/max)
- **Batch cooldowns** — Long pauses every N messages
- **Phone validation** — Skips numbers not on WhatsApp
- **Cancel anytime** — Stop mid-batch without losing progress

### 📊 Real-Time Tracking
- Live progress bar with sent/failed/pending counts
- Delivery status: **Pending → Sent → Delivered → Read**
- Click stat cards to filter (Sent, Failed, Total)
- Search and filter message history
- Export full history to Excel

### 🎨 Professional UI
- Modern dashboard with sidebar navigation
- Dark sidebar, clean cards
- Toast notifications
- Mobile responsive
- WhatsApp-themed branding

### 🔒 Privacy First
- **100% local** — Everything runs on your machine
- **No accounts, no signup** — Just install and use
- **Your data stays yours** — No analytics, no tracking, no cloud uploads
- **Session saved locally** — Scan QR once, stay logged in

## 🚀 Installation

### Option 1: One-Click Install (Recommended)

1. **Download** the latest release ZIP from the [Latest Release](https://github.com/Malaviya24/Whatsapp-Bulk-Sender/releases/latest) page (or download this repo as ZIP)
2. **Extract** the ZIP to any folder (e.g., `C:\BulkSender`)
3. **Double-click** `install.bat`
4. Wait while it auto-installs everything (Node.js if needed, packages, shortcuts)
5. Look for the **BulkSender** icon on your desktop — that's it!

The installer handles:
- ✅ Auto-downloading and installing Node.js (if not present)
- ✅ Installing all npm packages
- ✅ Creating desktop shortcut with custom logo
- ✅ Adding entries to Start Menu (searchable in Windows)
- ✅ Creating default `.env` configuration

### Option 2: Manual Setup (For Developers)

```bash
# Clone this repository
git clone https://github.com/Malaviya24/Whatsapp-Bulk-Sender.git
cd Whatsapp-Bulk-Sender

# Install dependencies
npm install

# Run the app
npm start
```

Open `http://localhost:5000` in your browser.

### Requirements

- **Windows 10/11** (other platforms may work but not officially supported)
- **Internet connection**
- **WhatsApp account** on your phone

---

## 🎮 Usage

### First-Time Setup

1. **Launch BulkSender** — Double-click the desktop icon
2. The browser opens automatically at `http://localhost:5000`
3. Click **"Connect"** in the sidebar
4. Click **"Generate QR Code"** — wait 20-30 seconds
5. **Scan the QR** with WhatsApp on your phone:
   - Open WhatsApp → ⋮ menu → **Linked Devices** → **Link a Device** → Scan
6. You're connected! Session is saved — no need to scan again next time

### Sending Messages

1. Go to **Send Messages** in the sidebar
2. **Add phone numbers**:
   - Type them (one per line, with country code: `+919876543210`)
   - OR upload a TXT/CSV/Excel file
3. **Add your message**:
   - Type directly (supports multi-line)
   - OR upload a TXT file
   - Use spin syntax: `{Hi|Hello|Hey} there!`
4. **Optional: Attach media** — image, video, or document
5. **Configure anti-ban settings** (defaults are safe)
6. Click **Start Sending** — sit back and relax!

### Closing the App

You have multiple options to close BulkSender:
- 🟢 **System tray icon** (bottom-right corner) → Right-click → Quit
- 🔘 **Quit button** in the sidebar (bottom of dashboard)
- 📁 **Stop BulkSender** in Start Menu
- 📁 Run `stop.bat` from the project folder

## 📷 Screenshots

> Add your screenshots here:
> - Dashboard
> - QR scan page
> - Send messages page
> - History with filters

---

## ⚙️ Configuration

Settings are stored in `.env` (auto-created on first run):

```env
# Server port
PORT=5000

# Anti-ban delays (seconds between messages)
DELAY_MIN=10
DELAY_MAX=25

# Batch settings (0 = no batching)
BATCH_SIZE=25
BATCH_COOLDOWN=180
```

You can also change these from the **Settings** page in the dashboard.

### Recommended Settings by Volume

| Daily Volume | Min Delay | Max Delay | Batch Size | Batch Cooldown |
|--------------|-----------|-----------|------------|----------------|
| Light (under 50) | 5 | 15 | 0 (off) | — |
| Medium (50-200) | 10 | 25 | 25 | 180 (3 min) |
| Heavy (200-500) | 15 | 30 | 30 | 300 (5 min) |

### Safe Sending Limits

⚠️ **WhatsApp bans accounts that send too many messages too fast.** Stay under these limits:

| Account Age | Safe Daily Limit |
|-------------|------------------|
| New (under 1 month) | 30-50 messages |
| Old (3+ months) | 100-150 messages |
| Active old account | 200-250 messages |

**Best times to send:** 10 AM - 8 PM (your timezone). Avoid late night.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js + Express |
| **WhatsApp** | [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) (uses Puppeteer) |
| **Frontend** | Vanilla JavaScript + Bootstrap 5 + Font Awesome |
| **File Parsing** | xlsx (Excel/CSV support) |
| **System Tray** | systray |
| **QR Generation** | qrcode |

---

## 📁 Project Structure

```
BulkSender/
├── install.bat              # One-click installer
├── BulkSender.vbs           # Silent launcher (used by desktop icon)
├── run.bat                  # Manual launcher (with console)
├── stop.bat                 # Stop the running server
├── uninstall.bat            # Clean uninstaller
├── package-for-share.bat    # Create shareable ZIP
├── server.js                # Backend (Express + whatsapp-web.js)
├── package.json             # Dependencies
├── .env                     # Configuration (auto-created)
├── README.md                # This file
├── LICENSE                  # MIT License
├── CONTRIBUTING.md          # How to contribute
├── assets/
│   └── icon.ico             # App icon (multiple sizes)
├── public/                  # Frontend
│   ├── dashboard.html       # Main UI
│   ├── styles.css           # Styles
│   ├── app.js               # Client JavaScript
│   └── logo.png             # Logo image
└── scripts/                 # PowerShell helpers
    ├── create-icon.ps1      # Generate .ico file
    ├── create-png-logo.ps1  # Generate .png logo
    └── create-shortcuts.ps1 # Create desktop/start menu shortcuts
```

## 🤝 Contributing

**Contributions are welcome!** This is a free, open-source project — feel free to use, modify, and share.

### Ways to Contribute

- 🐛 **Report bugs** by opening an [Issue](../../issues)
- 💡 **Suggest features** in the [Issues](../../issues) tab
- 🔧 **Submit Pull Requests** for fixes or improvements
- ⭐ **Star this repo** if you find it useful
- 📢 **Share with others** who might benefit

### Development Setup

```bash
git clone https://github.com/Malaviya24/Whatsapp-Bulk-Sender.git
cd Whatsapp-Bulk-Sender
npm install
npm start
```

Make your changes, test them, then submit a PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Ideas for Future Features

- [ ] Schedule messages for future delivery
- [ ] Multiple WhatsApp account support
- [ ] Group message sending
- [ ] Message templates library
- [ ] Auto-reply bot mode
- [ ] CSV variable replacement (`{{Name}}`, `{{Company}}`)
- [ ] macOS / Linux support
- [ ] Built-in installer (.exe with electron-builder)

Pick any of these and submit a PR!

---

## ❓ FAQ

### Is this safe? Will my account get banned?

It can be — WhatsApp doesn't allow bulk messaging from personal accounts. **Use responsibly:**
- Stay under daily limits (see Configuration table above)
- Use realistic delays (10-25 seconds between messages)
- Use spin syntax to avoid identical text
- Don't send to non-contacts only — mix with people who know you
- Don't send at unusual hours (3 AM)

For commercial/production bulk messaging, use the official [WhatsApp Business API](https://business.whatsapp.com/products/business-platform).

### Can I deploy this to a cloud server (Vercel, AWS, etc.)?

**No.** This app uses Puppeteer to control a browser, which requires a desktop environment. It only runs locally on your computer.

### How is this different from paid bulk senders?

Most paid tools cost $30-200/month. BulkSender is free, open-source, and you own your data. No subscription, no limits, no surveillance.

### What about WhatsApp Business?

This works with both WhatsApp and WhatsApp Business apps. Business accounts have slightly higher tolerance for bulk messaging.

### Can I customize the UI?

Absolutely! Edit `public/dashboard.html`, `public/styles.css`, and `public/app.js`. The MIT license lets you modify and redistribute freely.

### How do I update to a new version?

Just download the latest version and replace the files. Your `.wwebjs_auth/` folder (saved login) and `history.json` will be preserved.

---

## 🔐 Security & Privacy

- **No telemetry, no analytics, no tracking**
- All data (messages, contacts, history) stays on your device
- WhatsApp session stored locally in `.wwebjs_auth/` folder
- No external servers contacted (except WhatsApp's official servers)
- Open source — audit the code yourself

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

**TL;DR:** You can use, copy, modify, distribute, and even sell this software. Just include the original copyright notice. Use at your own risk.

---

## ⚠️ Disclaimer

This software is **not affiliated with, endorsed by, or sponsored by** WhatsApp, Meta, or any of their subsidiaries. It is an independent, unofficial tool that automates WhatsApp Web for personal use.

**Use at your own risk.** Bulk messaging on personal WhatsApp accounts may violate [WhatsApp's Terms of Service](https://www.whatsapp.com/legal/terms-of-service) and can result in account suspension or permanent ban. The authors take no responsibility for any account issues, data loss, or other consequences resulting from the use of this software.

For commercial bulk messaging, use the official [WhatsApp Business API](https://business.whatsapp.com).

---

## 💖 Acknowledgments

Built on top of these amazing open-source projects:

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) — WhatsApp Web automation library
- [Express](https://expressjs.com) — Web framework
- [Puppeteer](https://pptr.dev) — Browser automation
- [Bootstrap](https://getbootstrap.com) — UI components
- [Font Awesome](https://fontawesome.com) — Icons

---

## 📞 Support

- 🐛 **Found a bug?** [Open an Issue](../../issues/new)
- 💡 **Have a question?** Check existing [Issues](../../issues) or open a new one
- ⭐ **Like this project?** Give it a star! It helps others find it

---

<div align="center">

**Made with ❤️ for the open-source community**

If BulkSender helped you, please ⭐ this repository and share it with others!

</div>
