// WhatsApp Bulk Sender - Node.js Backend
// Uses whatsapp-web.js for reliable messaging

require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const xlsx = require('xlsx');
const { exec } = require('child_process');

const app = express();
const APP_ROOT = __dirname;
const DATA_DIR = process.env.BULKSENDER_DATA_DIR || APP_ROOT;
const PUBLIC_DIR = path.join(APP_ROOT, 'public');
const ASSETS_DIR = path.join(APP_ROOT, 'assets');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const dataEnvPath = path.join(DATA_DIR, '.env');
if (fs.existsSync(dataEnvPath)) {
    require('dotenv').config({ path: dataEnvPath, override: true });
}

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ createParentPath: true, useTempFiles: false }));
app.use(express.static(PUBLIC_DIR));

// Folders
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const SESSION_DIR = path.join(DATA_DIR, '.wwebjs_auth');
const CACHE_DIR = path.join(DATA_DIR, '.wwebjs_cache');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// State
let waClient = null;
let qrCodeData = null;
let waReady = false;
let waState = 'idle'; // idle, qr, authenticating, ready, disconnected
let messageLogs = [];
let sendingStatus = {
    isSending: false,
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
};
let allHistory = [];
let cancelRequested = false;

// Load history
function loadHistory() {
    if (fs.existsSync(HISTORY_FILE)) {
        try {
            allHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
        } catch (e) {
            allHistory = [];
        }
    }
}
function saveHistory() {
    try {
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(allHistory, null, 2));
    } catch (e) {}
}
loadHistory();

// ─── WhatsApp Client ───
function findChromePath() {
    // Optional: use system Chrome instead of bundled Chromium
    // Set USE_SYSTEM_CHROME=true in .env to enable (faster but can be unstable with whatsapp-web.js)
    if (process.env.USE_SYSTEM_CHROME !== 'true') {
        return null;
    }
    const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    ];
    for (const p of possiblePaths) {
        if (p && fs.existsSync(p)) {
            console.log(`[WA] Using browser: ${p}`);
            return p;
        }
    }
    return null;
}

function initWhatsApp() {
    if (waClient) {
        try { waClient.destroy(); } catch (e) {}
    }

    const chromePath = findChromePath();

    const puppeteerOptions = {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-extensions',
            '--no-first-run',
            '--disable-notifications',
            '--mute-audio',
        ],
    };

    if (chromePath) {
        puppeteerOptions.executablePath = chromePath;
    }

    waClient = new Client({
        authStrategy: new LocalAuth({ dataPath: SESSION_DIR }),
        puppeteer: puppeteerOptions,
        webVersionCache: {
            type: 'local',
            path: CACHE_DIR,
        },
    });

    waState = 'authenticating';
    qrCodeData = null;
    waReady = false;

    waClient.on('qr', async (qr) => {
        try {
            qrCodeData = await qrcode.toDataURL(qr);
            waState = 'qr';
            console.log('[WA] QR Code generated. Scan it from the dashboard.');
        } catch (e) {
            console.error('[WA] QR generation failed:', e);
        }
    });

    waClient.on('authenticated', () => {
        console.log('[WA] Authenticated!');
        waState = 'authenticating';
    });

    waClient.on('auth_failure', (msg) => {
        console.error('[WA] Auth failure:', msg);
        waState = 'idle';
        qrCodeData = null;
    });

    waClient.on('ready', () => {
        console.log('[WA] Client is ready!');
        waReady = true;
        waState = 'ready';
        qrCodeData = null;
    });

    waClient.on('disconnected', (reason) => {
        console.log('[WA] Disconnected:', reason);
        waReady = false;
        waState = 'disconnected';
        qrCodeData = null;
    });

    waClient.on('message_ack', (msg, ack) => {
        // ack: 1=sent, 2=delivered, 3=read
        // Update message status in logs if we tracked the message ID
        const idx = messageLogs.findIndex(l => l.messageId === msg.id._serialized);
        if (idx !== -1) {
            if (ack >= 3) messageLogs[idx].deliveryStatus = 'read';
            else if (ack === 2) messageLogs[idx].deliveryStatus = 'delivered';
            else if (ack === 1) messageLogs[idx].deliveryStatus = 'sent';
        }
    });

    waClient.initialize().catch(err => {
        console.error('[WA] Initialize error:', err.message);
        waState = 'idle';
        waReady = false;
        qrCodeData = null;
    });
}

// Global error handler so puppeteer errors don't crash the server
process.on('uncaughtException', (err) => {
    console.error('[!] Uncaught error:', err.message);
    if (err.message.includes('Execution context was destroyed') ||
        err.message.includes('Target closed') ||
        err.message.includes('Protocol error')) {
        // These are puppeteer errors during navigation - ignore
        waState = 'idle';
        waReady = false;
        qrCodeData = null;
    }
});
process.on('unhandledRejection', (err) => {
    console.error('[!] Unhandled rejection:', err && err.message ? err.message : err);
});

// ─── Helpers ───
function parseNumbersFromFile(filePath, ext) {
    const numbers = [];
    ext = ext.toLowerCase();

    if (ext === '.txt') {
        const content = fs.readFileSync(filePath, 'utf-8');
        content.split(/\r?\n/).forEach(line => {
            const cleaned = line.trim();
            if (cleaned) numbers.push(cleaned);
        });
    } else if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Find phone column
        let phoneCol = null;
        if (data.length > 0) {
            const cols = Object.keys(data[0]);
            phoneCol = cols.find(c => /phone|number|mobile|contact|whatsapp/i.test(c)) || cols[0];
        }

        data.forEach(row => {
            let val = row[phoneCol];
            if (val !== undefined && val !== null && val !== '') {
                let num = String(val).trim();
                if (num.endsWith('.0')) num = num.slice(0, -2);
                numbers.push(num);
            }
        });
    }

    return numbers;
}

function formatNumber(num) {
    // Strip non-digits except leading +
    let cleaned = num.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
    return cleaned;
}

// Spin syntax: {Hi|Hello|Hey} -> picks one randomly
function processSpinSyntax(text) {
    return text.replace(/\{([^{}]+)\}/g, (match, group) => {
        const options = group.split('|');
        if (options.length > 1) {
            return options[Math.floor(Math.random() * options.length)];
        }
        return match;
    });
}

// Template variables: {{Name}} -> replaced from row data
function processTemplateVars(text, vars) {
    return text.replace(/\{\{([^{}]+)\}\}/g, (match, key) => {
        const cleanKey = key.trim();
        return vars[cleanKey] !== undefined ? vars[cleanKey] : match;
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Send Messages ───
async function sendBulkMessages(numbers, message, mediaPath, options) {
    const { delayMin, delayMax, batchSize, batchCooldown } = options;

    sendingStatus.isSending = true;
    sendingStatus.total = numbers.length;
    sendingStatus.sent = 0;
    sendingStatus.failed = 0;
    sendingStatus.pending = numbers.length;
    cancelRequested = false;

    const batchId = new Date().toISOString().replace(/[:.]/g, '-');

    let media = null;
    if (mediaPath && fs.existsSync(mediaPath)) {
        try {
            media = MessageMedia.fromFilePath(mediaPath);
        } catch (e) {
            console.error('[WA] Media load error:', e);
        }
    }

    for (let i = 0; i < numbers.length; i++) {
        if (cancelRequested) {
            console.log('[WA] Sending cancelled by user');
            break;
        }

        const rawNumber = numbers[i];
        const formatted = formatNumber(rawNumber);
        const chatId = `${formatted}@c.us`;

        const log = {
            number: '+' + formatted,
            message: message.length > 80 ? message.slice(0, 80) + '...' : message,
            fullMessage: message,
            status: 'sending',
            deliveryStatus: 'pending',
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            batchId,
            error: '',
            hasMedia: !!media,
            messageId: null,
        };

        try {
            // Check if number is registered on WhatsApp
            const isRegistered = await waClient.isRegisteredUser(chatId);
            if (!isRegistered) {
                throw new Error('Number not registered on WhatsApp');
            }

            // Process spin syntax for each message
            const processedMsg = processSpinSyntax(message);

            let sentMsg;
            if (media) {
                sentMsg = await waClient.sendMessage(chatId, media, { caption: processedMsg });
            } else {
                sentMsg = await waClient.sendMessage(chatId, processedMsg);
            }

            log.status = 'sent';
            log.deliveryStatus = 'sent';
            log.messageId = sentMsg.id._serialized;
            sendingStatus.sent++;
        } catch (err) {
            log.status = 'failed';
            log.error = (err.message || String(err)).slice(0, 150);
            sendingStatus.failed++;
        }

        sendingStatus.pending--;
        messageLogs.push(log);
        allHistory.push(log);

        // Anti-ban: random delay between messages
        if (i < numbers.length - 1 && !cancelRequested) {
            const delay = Math.floor(Math.random() * (delayMax - delayMin + 1)) + delayMin;
            await sleep(delay * 1000);

            // Batch cooldown
            if (batchSize && (i + 1) % batchSize === 0) {
                console.log(`[WA] Batch cooldown: ${batchCooldown}s`);
                await sleep(batchCooldown * 1000);
            }
        }
    }

    sendingStatus.isSending = false;
    saveHistory();
}

// ─── Routes ───
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Connection
app.post('/api/connect', (req, res) => {
    if (waReady) {
        return res.json({ success: true, message: 'Already connected', state: waState });
    }
    // If already authenticating or showing QR, don't restart
    if (waState === 'authenticating' || waState === 'qr') {
        return res.json({ success: true, message: 'Already initializing...', state: waState });
    }
    initWhatsApp();
    res.json({ success: true, message: 'Initializing WhatsApp...', state: 'authenticating' });
});

app.get('/api/qr', (req, res) => {
    res.json({
        qr: qrCodeData,
        state: waState,
        ready: waReady,
    });
});

app.post('/api/disconnect', async (req, res) => {
    if (waClient) {
        try {
            await waClient.logout();
            await waClient.destroy();
        } catch (e) {}
        waClient = null;
    }
    waReady = false;
    waState = 'idle';
    qrCodeData = null;
    res.json({ success: true });
});

app.post('/api/cancel', (req, res) => {
    cancelRequested = true;
    res.json({ success: true, message: 'Cancellation requested' });
});

// Send
app.post('/api/send', async (req, res) => {
    if (sendingStatus.isSending) {
        return res.status(400).json({ error: 'Already sending. Please wait.' });
    }
    if (!waReady) {
        return res.status(400).json({ error: 'WhatsApp not connected. Please scan QR first.' });
    }

    // Get message
    let message = '';
    if (req.files && req.files.message_file) {
        message = req.files.message_file.data.toString('utf-8').trim();
    } else if (req.body.message_text) {
        message = req.body.message_text.trim();
    }

    // Get media
    let mediaPath = null;
    if (req.files && req.files.media_file) {
        const mediaFile = req.files.media_file;
        const safeName = `media_${Date.now()}_${mediaFile.name}`;
        mediaPath = path.join(UPLOAD_DIR, safeName);
        await mediaFile.mv(mediaPath);
    }

    if (!message && !mediaPath) {
        return res.status(400).json({ error: 'Provide a message, media, or both.' });
    }

    // Get numbers
    let numbers = [];
    if (req.files && req.files.numbers_file) {
        const numFile = req.files.numbers_file;
        const ext = path.extname(numFile.name);
        const numPath = path.join(UPLOAD_DIR, `nums_${Date.now()}${ext}`);
        await numFile.mv(numPath);
        numbers = parseNumbersFromFile(numPath, ext);
    } else if (req.body.numbers_text) {
        numbers = req.body.numbers_text.trim().split('\n').map(n => n.trim()).filter(n => n);
    }

    if (numbers.length === 0) {
        return res.status(400).json({ error: 'No valid phone numbers.' });
    }

    // Options
    const options = {
        delayMin: parseInt(req.body.delay_min) || 5,
        delayMax: parseInt(req.body.delay_max) || 12,
        batchSize: parseInt(req.body.batch_size) || 0,
        batchCooldown: parseInt(req.body.batch_cooldown) || 60,
    };

    // Reset and start
    messageLogs = [];
    sendBulkMessages(numbers, message, mediaPath, options);

    res.json({
        success: true,
        message: `Started sending to ${numbers.length} numbers`,
        total: numbers.length,
    });
});

app.get('/api/status', (req, res) => {
    res.json({
        ...sendingStatus,
        logs: messageLogs,
        waState,
        waReady,
    });
});

app.get('/api/history', (req, res) => {
    res.json(allHistory.slice(-500));
});

app.post('/api/history/clear', (req, res) => {
    allHistory = [];
    saveHistory();
    res.json({ success: true });
});

app.get('/api/history/export', (req, res) => {
    if (allHistory.length === 0) {
        return res.status(400).json({ error: 'No history to export' });
    }
    const ws = xlsx.utils.json_to_sheet(allHistory);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'History');
    const exportPath = path.join(UPLOAD_DIR, 'history_export.xlsx');
    xlsx.writeFile(wb, exportPath);
    res.download(exportPath, 'whatsapp_history.xlsx');
});

app.get('/api/settings', (req, res) => {
    res.json({
        port: PORT,
        delayMin: parseInt(process.env.DELAY_MIN) || 5,
        delayMax: parseInt(process.env.DELAY_MAX) || 12,
        batchSize: parseInt(process.env.BATCH_SIZE) || 0,
        batchCooldown: parseInt(process.env.BATCH_COOLDOWN) || 60,
    });
});

app.post('/api/settings/save', (req, res) => {
    const data = req.body;
    const envContent = `# WhatsApp Bulk Sender Configuration
PORT=${data.port || 5000}
DELAY_MIN=${data.delayMin || 5}
DELAY_MAX=${data.delayMax || 12}
BATCH_SIZE=${data.batchSize || 0}
BATCH_COOLDOWN=${data.batchCooldown || 60}
`;
    fs.writeFileSync(dataEnvPath, envContent);
    res.json({ success: true, message: 'Settings saved! Restart app to apply.' });
});

app.post('/api/clear-logs', (req, res) => {
    messageLogs = [];
    res.json({ success: true });
});

// Quit the application
app.post('/api/quit', async (req, res) => {
    res.json({ success: true, message: 'Shutting down...' });
    setTimeout(async () => {
        console.log('\n[*] Quit requested from dashboard. Shutting down...');
        if (waClient) {
            try { await waClient.destroy(); } catch (e) {}
        }
        saveHistory();
        process.exit(0);
    }, 500);
});

// ─── System Tray ───
function setupSystemTray() {
    let SysTray;
    try {
        SysTray = require('systray').default;
    } catch (e) {
        console.log('[*] systray not available, skipping tray icon');
        return;
    }

    const iconPath = path.join(ASSETS_DIR, 'icon.ico');
    let icon = '';
    try {
        if (fs.existsSync(iconPath)) {
            icon = fs.readFileSync(iconPath).toString('base64');
        }
    } catch (e) {}

    const systray = new SysTray({
        menu: {
            icon: icon,
            title: 'BulkSender',
            tooltip: 'BulkSender - WhatsApp Bulk Messenger',
            items: [
                { title: 'Open Dashboard', tooltip: 'Open in browser', checked: false, enabled: true },
                { title: 'Restart Server', tooltip: 'Restart', checked: false, enabled: true },
                { title: '__SEPARATOR__', tooltip: '', checked: false, enabled: false },
                { title: `Running on port ${PORT}`, tooltip: '', checked: false, enabled: false },
                { title: '__SEPARATOR__', tooltip: '', checked: false, enabled: false },
                { title: 'Quit BulkSender', tooltip: 'Shutdown the server', checked: false, enabled: true },
            ],
        },
        debug: false,
        copyDir: true,
    });

    systray.onClick(action => {
        if (action.seq_id === 0) {
            // Open Dashboard
            exec(`start http://localhost:${PORT}`);
        } else if (action.seq_id === 1) {
            // Restart - just exit, the launcher can be re-run
            console.log('[*] Restart requested');
            process.exit(0);
        } else if (action.seq_id === 5) {
            // Quit
            console.log('[*] Quit requested from tray');
            systray.kill(false);
            setTimeout(async () => {
                if (waClient) {
                    try { await waClient.destroy(); } catch (e) {}
                }
                saveHistory();
                process.exit(0);
            }, 200);
        }
    });

    systray.onError(err => {
        console.log('[*] Tray error:', err.message);
    });

    return systray;
}

// Start server
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('  BulkSender v2.0');
    console.log(`  Open: http://localhost:${PORT}`);
    console.log('='.repeat(50) + '\n');

    // Setup system tray icon for script/browser mode. Electron handles its own tray.
    if (process.env.BULKSENDER_DESKTOP !== 'true') {
        try { setupSystemTray(); } catch (e) { console.log('[*] Tray setup skipped'); }
    }

    // Auto-initialize ONLY if there's an existing session (faster auto-login)
    if (fs.existsSync(SESSION_DIR) && fs.readdirSync(SESSION_DIR).length > 0) {
        console.log('[*] Existing session found, auto-connecting...');
        setTimeout(() => {
            try { initWhatsApp(); } catch (e) { console.error('[*] Auto-connect failed:', e.message); }
        }, 1000);
    }
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n[ERROR] Port ${PORT} is already in use.`);
        console.error('Either close the other instance or change PORT in .env\n');
        process.exit(1);
    }
    throw err;
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n[*] Shutting down...');
    if (waClient) {
        try { await waClient.destroy(); } catch (e) {}
    }
    saveHistory();
    process.exit(0);
});
