// ─── Navigation ───
function navigateTo(page) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.toggle('active', a.dataset.page === page));
    if (page === 'history') loadHistory();
    if (page === 'settings') loadSettings();
    if (page === 'dashboard') refreshDashboard();
    if (page === 'send') updateSendWarning();
}
document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); navigateTo(a.dataset.page); });
});

// ─── Toast ───
function showToast(msg, type='success') {
    const icon = type==='success'?'check-circle':type==='error'?'times-circle':'info-circle';
    const color = type==='success'?'var(--accent)':type==='error'?'var(--danger)':'var(--warning)';
    const el = document.createElement('div');
    el.className = 'toast-msg';
    el.innerHTML = `<i class="fas fa-${icon}" style="color:${color}"></i> ${msg}`;
    document.getElementById('toastContainer').appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

// ─── WhatsApp Connection ───
let waConnected = false;
let qrPollTimer = null;

async function connectWA() {
    document.getElementById('connectBtn').disabled = true;
    document.getElementById('connectIdle').style.display = 'none';
    document.getElementById('connectAuth').style.display = 'block';

    // Simulate progress so user knows it's working
    simulateLoadProgress();

    const resp = await fetch('/api/connect', { method: 'POST' });
    const data = await resp.json();

    if (data.state === 'qr') {
        showToast('QR ready!', 'success');
    } else if (data.state === 'ready') {
        showToast('Already connected!', 'success');
    } else {
        showToast('Loading WhatsApp...', 'info');
    }
    startQrPoll();
}

function simulateLoadProgress() {
    const steps = [
        { time: 0, percent: 5, text: 'Starting browser engine...' },
        { time: 3000, percent: 25, text: 'Launching Chromium...' },
        { time: 7000, percent: 45, text: 'Loading WhatsApp Web...' },
        { time: 12000, percent: 65, text: 'Initializing WhatsApp client...' },
        { time: 18000, percent: 85, text: 'Generating QR code...' },
        { time: 25000, percent: 95, text: 'Almost ready...' },
    ];
    steps.forEach(step => {
        setTimeout(() => {
            const stepEl = document.getElementById('connectAuthStep');
            const barEl = document.getElementById('loadProgress');
            if (stepEl) stepEl.textContent = step.text;
            if (barEl) barEl.style.width = step.percent + '%';
        }, step.time);
    });
}

function startQrPoll() {
    if (qrPollTimer) clearInterval(qrPollTimer);
    qrPollTimer = setInterval(checkQrStatus, 2000);
    checkQrStatus();
}

async function checkQrStatus() {
    try {
        const resp = await fetch('/api/qr');
        const data = await resp.json();

        if (data.ready) {
            // Connected!
            waConnected = true;
            document.getElementById('connectIdle').style.display = 'none';
            document.getElementById('connectAuth').style.display = 'none';
            document.getElementById('connectQR').style.display = 'none';
            document.getElementById('connectReady').style.display = 'block';
            document.getElementById('sidebarStatus').innerHTML = '<small style="color:#6b7280;font-size:.75rem;"><i class="fas fa-circle" style="color:var(--accent);font-size:6px;"></i> Connected</small>';
            updateSendWarning();
            clearInterval(qrPollTimer);
            showToast('WhatsApp Connected!');
        } else if (data.qr) {
            // Show QR
            document.getElementById('connectAuth').style.display = 'none';
            document.getElementById('connectQR').style.display = 'block';
            document.getElementById('qrImage').src = data.qr;
        }
    } catch (e) { console.error(e); }
}

async function disconnectWA() {
    await fetch('/api/disconnect', { method: 'POST' });
    waConnected = false;
    document.getElementById('connectIdle').style.display = 'block';
    document.getElementById('connectReady').style.display = 'none';
    document.getElementById('connectBtn').disabled = false;
    document.getElementById('sidebarStatus').innerHTML = '<small style="color:#6b7280;font-size:.75rem;"><i class="fas fa-circle" style="color:var(--danger);font-size:6px;"></i> Disconnected</small>';
    updateSendWarning();
    showToast('Disconnected', 'info');
}

function updateSendWarning() {
    const warn = document.getElementById('sendWarning');
    if (warn) warn.style.display = waConnected ? 'none' : 'block';
}

// ─── File Uploads ───
document.getElementById('numbersFile').addEventListener('change', function() {
    if (this.files[0]) { document.getElementById('numFileName').textContent = this.files[0].name; document.getElementById('numUploadZone').classList.add('has-file'); }
});
document.getElementById('messageFile').addEventListener('change', function() {
    if (this.files[0]) { document.getElementById('msgFileName').textContent = this.files[0].name; document.getElementById('msgUploadZone').classList.add('has-file'); }
});
document.getElementById('messageText').addEventListener('input', function() {
    document.getElementById('charCount').textContent = this.value.length;
});

// ─── Media Upload ───
document.getElementById('mediaFile').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;

    document.getElementById('mediaFileName').textContent = file.name;
    document.getElementById('mediaUploadZone').classList.add('has-file');
    document.getElementById('mediaPreview').style.display = 'block';

    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    document.getElementById('mediaSize').textContent = `${file.name} (${sizeMB} MB)`;

    const url = URL.createObjectURL(file);
    document.getElementById('mediaPreviewImg').style.display = 'none';
    document.getElementById('mediaPreviewVid').style.display = 'none';
    document.getElementById('mediaPreviewDoc').style.display = 'none';

    if (file.type.startsWith('video/')) {
        document.getElementById('mediaPreviewVid').style.display = 'inline-block';
        document.getElementById('mediaPreviewVid').src = url;
    } else if (file.type.startsWith('image/')) {
        document.getElementById('mediaPreviewImg').style.display = 'inline-block';
        document.getElementById('mediaPreviewImg').src = url;
    } else {
        document.getElementById('mediaPreviewDoc').style.display = 'inline-block';
    }
});

function clearMedia() {
    document.getElementById('mediaFile').value = '';
    document.getElementById('mediaFileName').textContent = 'Click to upload Image, Video, or Document';
    document.getElementById('mediaUploadZone').classList.remove('has-file');
    document.getElementById('mediaPreview').style.display = 'none';
}

// ─── Send Form ───
document.getElementById('sendForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!waConnected) { showToast('Connect WhatsApp first!', 'error'); return; }

    const btn = document.getElementById('sendBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    document.getElementById('cancelBtn').style.display = 'inline-block';

    try {
        const resp = await fetch('/api/send', { method: 'POST', body: new FormData(this) });
        const data = await resp.json();
        if (data.error) {
            showToast(data.error, 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="fab fa-whatsapp"></i> Start Sending';
            document.getElementById('cancelBtn').style.display = 'none';
            return;
        }

        showToast(`Sending to ${data.total} contacts...`, 'info');
        document.getElementById('sendProgress').style.display = 'block';
        document.getElementById('sendLogs').style.display = 'block';
        document.getElementById('liveProgress').style.display = 'block';
        document.getElementById('spTotal').textContent = data.total;
        startStatusPoll();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fab fa-whatsapp"></i> Start Sending';
        document.getElementById('cancelBtn').style.display = 'none';
    }
});

async function cancelSending() {
    await fetch('/api/cancel', { method: 'POST' });
    showToast('Cancellation requested...', 'info');
}

let statusTimer = null;
function startStatusPoll() {
    if (statusTimer) clearInterval(statusTimer);
    statusTimer = setInterval(fetchStatus, 1500);
}

async function fetchStatus() {
    try {
        const resp = await fetch('/api/status');
        const data = await resp.json();
        const done = data.sent + data.failed;
        const pct = data.total ? Math.round((done / data.total) * 100) : 0;

        document.getElementById('spSent').textContent = data.sent;
        document.getElementById('spFailed').textContent = data.failed;
        document.getElementById('spPending').textContent = data.pending;
        document.getElementById('spTotal').textContent = data.total;
        document.getElementById('spBar').style.width = pct + '%';
        document.getElementById('sendProgressCount').textContent = `${done}/${data.total}`;
        document.getElementById('liveBar').style.width = pct + '%';
        document.getElementById('liveCount').textContent = `${done}/${data.total}`;

        if (data.isSending) {
            document.getElementById('spText').textContent = `Sending... ${done} of ${data.total} processed`;
            document.getElementById('liveText').textContent = `Sending message ${done + 1} of ${data.total}...`;
        } else if (done > 0) {
            document.getElementById('spText').textContent = `Done! ${data.sent} sent, ${data.failed} failed`;
            document.getElementById('liveText').textContent = `Completed!`;
            document.getElementById('liveProgress').style.display = 'none';
            clearInterval(statusTimer);
            const btn = document.getElementById('sendBtn');
            btn.disabled = false;
            btn.innerHTML = '<i class="fab fa-whatsapp"></i> Start Sending';
            document.getElementById('cancelBtn').style.display = 'none';
            showToast(`Complete: ${data.sent} sent, ${data.failed} failed`);
            refreshDashboard();
        }
        updateSendLogs(data.logs);
    } catch (e) {}
}

function getDeliveryBadge(status) {
    const map = {
        'pending': { cls: 'badge-pending', icon: 'clock', label: 'Pending' },
        'sent': { cls: 'badge-sent', icon: 'check', label: 'Sent' },
        'delivered': { cls: 'badge-delivered', icon: 'check-double', label: 'Delivered' },
        'read': { cls: 'badge-read', icon: 'eye', label: 'Read' },
    };
    const s = map[status] || map['pending'];
    return `<span class="badge-status ${s.cls}"><i class="fas fa-${s.icon}"></i> ${s.label}</span>`;
}

function updateSendLogs(logs) {
    const tbody = document.getElementById('sendLogsBody');
    tbody.innerHTML = '';
    logs.forEach((log, i) => {
        const cls = log.status==='sent'?'badge-sent':log.status==='failed'?'badge-failed':'badge-sending';
        const icon = log.status==='sent'?'check-circle':log.status==='failed'?'times-circle':'clock';
        const mediaIcon = log.hasMedia ? '<i class="fas fa-paperclip" style="color:var(--accent);margin-left:4px;"></i>' : '';
        const delivery = log.status === 'sent' ? getDeliveryBadge(log.deliveryStatus) : '-';
        tbody.innerHTML += `<tr>
            <td>${i+1}</td>
            <td><code>${log.number}</code></td>
            <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${log.message}${mediaIcon}</td>
            <td><span class="badge-status ${cls}"><i class="fas fa-${icon}"></i> ${log.status}</span></td>
            <td>${delivery}</td>
            <td><small>${log.timestamp}</small></td>
        </tr>`;
    });
}

async function clearCurrentLogs() {
    await fetch('/api/clear-logs', { method: 'POST' });
    document.getElementById('sendLogsBody').innerHTML = '';
    showToast('Logs cleared');
}

// ─── Dashboard ───
let dashFilter = 'all';
let dashHistoryCache = [];

function setDashFilter(filter) {
    dashFilter = filter;
    // Update filter pills
    document.querySelectorAll('.filter-pill[data-filter]').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === filter);
    });
    // Update stat card highlighting
    document.querySelectorAll('.stat-clickable').forEach(c => {
        c.classList.toggle('active', c.dataset.filter === filter);
    });
    // Update title
    const titleMap = { all: 'Recent Activity', sent: 'Sent Messages', failed: 'Failed Messages' };
    document.getElementById('recentTitle').textContent = titleMap[filter] || 'Recent Activity';
    renderRecentLogs();
}

function renderRecentLogs() {
    let filtered = dashHistoryCache;
    if (dashFilter === 'sent') filtered = filtered.filter(h => h.status === 'sent');
    else if (dashFilter === 'failed') filtered = filtered.filter(h => h.status === 'failed');

    const recent = filtered.slice(-15).reverse();
    const tbody = document.getElementById('recentLogs');
    tbody.innerHTML = '';

    if (recent.length === 0) {
        const labelMap = { sent: 'sent', failed: 'failed', all: 'recent' };
        tbody.innerHTML = `<tr><td colspan="3"><div class="empty-state"><i class="fas fa-inbox"></i><br>No ${labelMap[dashFilter]} messages yet</div></td></tr>`;
        return;
    }

    recent.forEach(log => {
        const cls = log.status==='sent'?'badge-sent':'badge-failed';
        const errorTip = log.error ? ` title="${log.error.replace(/"/g,'&quot;')}"` : '';
        tbody.innerHTML += `<tr${errorTip}><td><code>${log.number}</code></td><td><span class="badge-status ${cls}">${log.status}</span></td><td><small>${log.timestamp}</small></td></tr>`;
    });
}

async function refreshDashboard() {
    try {
        const resp = await fetch('/api/history');
        dashHistoryCache = await resp.json();

        const sent = dashHistoryCache.filter(h => h.status==='sent').length;
        const failed = dashHistoryCache.filter(h => h.status==='failed').length;
        const total = dashHistoryCache.length;
        const rate = total > 0 ? Math.round((sent/total)*100) : 0;

        document.getElementById('dashSent').textContent = sent;
        document.getElementById('dashFailed').textContent = failed;
        document.getElementById('dashTotal').textContent = total;
        document.getElementById('dashRate').textContent = rate + '%';

        renderRecentLogs();
    } catch (e) {}

    // Check connection state
    try {
        const resp = await fetch('/api/qr');
        const data = await resp.json();
        if (data.ready) {
            waConnected = true;
            document.getElementById('sidebarStatus').innerHTML = '<small style="color:#6b7280;font-size:.75rem;"><i class="fas fa-circle" style="color:var(--accent);font-size:6px;"></i> Connected</small>';
        }
    } catch (e) {}
}

// ─── History ───
let histFilter = 'all';
let histCache = [];

function setHistFilter(filter) {
    histFilter = filter;
    document.querySelectorAll('.filter-pill[data-hist-filter]').forEach(b => {
        b.classList.toggle('active', b.dataset.histFilter === filter);
    });
    renderHistory();
}

function renderHistory() {
    const search = (document.getElementById('histSearch')?.value || '').toLowerCase().trim();
    let filtered = histCache.slice();

    // Apply status filter
    if (histFilter === 'sent') filtered = filtered.filter(h => h.status === 'sent');
    else if (histFilter === 'failed') filtered = filtered.filter(h => h.status === 'failed');
    else if (histFilter === 'delivered') filtered = filtered.filter(h => h.deliveryStatus === 'delivered' || h.deliveryStatus === 'read');
    else if (histFilter === 'read') filtered = filtered.filter(h => h.deliveryStatus === 'read');

    // Apply search
    if (search) {
        filtered = filtered.filter(h =>
            (h.number || '').toLowerCase().includes(search) ||
            (h.message || '').toLowerCase().includes(search)
        );
    }

    const tbody = document.getElementById('historyBody');
    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-search"></i><br>No messages match this filter</div></td></tr>`;
        return;
    }

    filtered.slice().reverse().forEach((log, i) => {
        const cls = log.status==='sent'?'badge-sent':'badge-failed';
        const delivery = log.status === 'sent' ? getDeliveryBadge(log.deliveryStatus) : '-';
        tbody.innerHTML += `<tr>
            <td>${i+1}</td>
            <td><code>${log.number}</code></td>
            <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${(log.fullMessage||log.message||'').replace(/"/g,'&quot;')}">${log.message}</td>
            <td><span class="badge-status ${cls}">${log.status}</span></td>
            <td>${delivery}</td>
            <td><small style="color:var(--danger);">${log.error||'-'}</small></td>
            <td><small>${log.timestamp}</small></td>
        </tr>`;
    });
}

function updateHistCounts() {
    const sent = histCache.filter(h => h.status === 'sent').length;
    const failed = histCache.filter(h => h.status === 'failed').length;
    const delivered = histCache.filter(h => h.deliveryStatus === 'delivered' || h.deliveryStatus === 'read').length;
    const read = histCache.filter(h => h.deliveryStatus === 'read').length;
    document.getElementById('histCountAll').textContent = histCache.length;
    document.getElementById('histCountSent').textContent = sent;
    document.getElementById('histCountFailed').textContent = failed;
    document.getElementById('histCountDelivered').textContent = delivered;
    document.getElementById('histCountRead').textContent = read;
}

async function loadHistory() {
    const resp = await fetch('/api/history');
    histCache = await resp.json();
    updateHistCounts();
    renderHistory();
}

async function clearAllHistory() {
    if (!confirm('Clear all history?')) return;
    await fetch('/api/history/clear', { method: 'POST' });
    histCache = [];
    updateHistCounts();
    renderHistory();
    showToast('History cleared');
    refreshDashboard();
}

function exportHistory() {
    window.location.href = '/api/history/export';
}

// ─── Settings ───
async function loadSettings() {
    try {
        const resp = await fetch('/api/settings');
        const s = await resp.json();
        document.getElementById('setPort').value = s.port;
        document.getElementById('setDelayMin').value = s.delayMin;
        document.getElementById('setDelayMax').value = s.delayMax;
        document.getElementById('setBatchSize').value = s.batchSize;
        document.getElementById('setBatchCooldown').value = s.batchCooldown;
    } catch (e) {}
}

document.getElementById('settingsForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const payload = {
        port: document.getElementById('setPort').value,
        delayMin: document.getElementById('setDelayMin').value,
        delayMax: document.getElementById('setDelayMax').value,
        batchSize: document.getElementById('setBatchSize').value,
        batchCooldown: document.getElementById('setBatchCooldown').value,
    };
    const resp = await fetch('/api/settings/save', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    const data = await resp.json();
    if (data.success) showToast(data.message);
});

// ─── Init ───
refreshDashboard();

// ─── Quit App ───
async function quitApp() {
    if (!confirm('Quit BulkSender?\n\nThis will close the server. You will need to launch it again from the desktop icon.')) return;

    try {
        await fetch('/api/quit', { method: 'POST' });
    } catch (e) {}

    // Show shutdown screen
    document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Inter,sans-serif;background:#f0f2f5;text-align:center;padding:20px;">
            <i class="fab fa-whatsapp" style="font-size:4rem;color:#25D366;margin-bottom:20px;"></i>
            <h2 style="font-weight:700;color:#1a1d23;">BulkSender Closed</h2>
            <p style="color:#6b7280;max-width:400px;">The server has been shut down. You can safely close this browser tab.</p>
            <p style="color:#6b7280;font-size:.85rem;margin-top:20px;">To run BulkSender again, double-click the desktop icon.</p>
        </div>
    `;
}
