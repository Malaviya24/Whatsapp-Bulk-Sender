const path = require('path');
const http = require('http');
const fs = require('fs');
const { app, BrowserWindow, Menu, Tray, shell, dialog } = require('electron');

let mainWindow = null;
let tray = null;

function getPort() {
    return process.env.PORT || 5000;
}

function getAppUrl() {
    return `http://127.0.0.1:${getPort()}`;
}

function waitForServer(timeoutMs = 30000) {
    const startedAt = Date.now();

    return new Promise((resolve, reject) => {
        const poll = () => {
            const req = http.get(getAppUrl(), (res) => {
                res.resume();
                resolve();
            });

            req.on('error', () => {
                if (Date.now() - startedAt > timeoutMs) {
                    reject(new Error('BulkSender server did not start in time.'));
                    return;
                }
                setTimeout(poll, 500);
            });

            req.setTimeout(1000, () => {
                req.destroy();
            });
        };

        poll();
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 820,
        minWidth: 1024,
        minHeight: 700,
        title: 'BulkSender',
        icon: path.join(__dirname, 'assets', 'icon.ico'),
        autoHideMenuBar: true,
        backgroundColor: '#f6f7f9',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    mainWindow.loadURL(getAppUrl());

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });
}

function createTray() {
    const iconPath = path.join(__dirname, 'assets', 'icon.ico');
    tray = new Tray(iconPath);
    tray.setToolTip('BulkSender');
    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: 'Open BulkSender',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            },
        },
        {
            label: 'Open Data Folder',
            click: () => shell.openPath(app.getPath('userData')),
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.isQuiting = true;
                app.quit();
            },
        },
    ]));

    tray.on('double-click', () => {
        if (mainWindow) mainWindow.show();
    });
}

app.whenReady().then(async () => {
    process.env.BULKSENDER_DESKTOP = 'true';
    process.env.BULKSENDER_DATA_DIR = app.getPath('userData');
    process.env.PUPPETEER_CACHE_DIR = app.isPackaged
        ? path.join(process.resourcesPath, 'puppeteer')
        : path.join(__dirname, '.puppeteer-cache');

    const envPath = path.join(process.env.BULKSENDER_DATA_DIR, '.env');
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath, override: true });
    }

    try {
        require('./server');
        await waitForServer();
        createWindow();
        createTray();
    } catch (error) {
        dialog.showErrorBox('BulkSender could not start', error.message);
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    } else if (mainWindow) {
        mainWindow.show();
    }
});

app.on('before-quit', () => {
    app.isQuiting = true;
});
