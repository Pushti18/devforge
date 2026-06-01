// ========== Navigation ==========
function switchTool(tool) {
    document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    const panel = document.getElementById('panel-' + tool);
    if (panel) panel.classList.add('active');
    const btn = document.querySelector(`.tool-btn[data-tool="${tool}"]`);
    if (btn) btn.classList.add('active');
    closeSidebar();
    if (tool === 'color') colorFromPicker();

    if (tool !== 'welcome') {
        history.replaceState(null, '', '#' + tool);
    } else {
        history.replaceState(null, '', location.pathname);
    }

    try { localStorage.setItem('buildbox-last-tool', tool); } catch(e) {}
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('open');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
}

// ========== Sidebar Search ==========
function filterSidebar() {
    const query = document.getElementById('sidebar-search-input').value.toLowerCase().trim();
    const sections = document.querySelectorAll('.sidebar-section');

    sections.forEach(section => {
        const buttons = section.querySelectorAll('.tool-btn');
        let anyVisible = false;
        buttons.forEach(btn => {
            const text = btn.textContent.toLowerCase();
            if (!query || text.includes(query)) {
                btn.classList.remove('filtered-out');
                anyVisible = true;
            } else {
                btn.classList.add('filtered-out');
            }
        });
        section.classList.toggle('hidden', !anyVisible && !!query);
    });
}

// ========== Utilities ==========
function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => toast('Copied to clipboard!'));
}

function copyOutput(id) {
    const el = document.getElementById(id);
    const text = el.innerText || el.textContent;
    copyToClipboard(text);
}

function clearFields(...ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') el.value = '';
        else el.textContent = '';
    });
}

function setActiveBtn(btn) {
    const row = btn.closest('.btn-row');
    if (row) {
        row.querySelectorAll('.btn').forEach(b => b.classList.remove('btn-active'));
        btn.classList.add('btn-active');
    }
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-row .btn');
    if (btn) setActiveBtn(btn);
});

function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ========== JSON ==========
function jsonFormat() {
    try {
        const parsed = JSON.parse(document.getElementById('json-input').value);
        document.getElementById('json-output').textContent = JSON.stringify(parsed, null, 2);
        document.getElementById('json-output').className = 'output-area success';
        document.getElementById('json-status').innerHTML = '<span class="status-badge valid">Valid JSON</span>';
    } catch(e) {
        document.getElementById('json-output').textContent = 'Error: ' + e.message;
        document.getElementById('json-output').className = 'output-area error';
        document.getElementById('json-status').innerHTML = '<span class="status-badge invalid">Invalid</span>';
    }
}

function jsonMinify() {
    try {
        const parsed = JSON.parse(document.getElementById('json-input').value);
        document.getElementById('json-output').textContent = JSON.stringify(parsed);
        document.getElementById('json-output').className = 'output-area success';
    } catch(e) {
        document.getElementById('json-output').textContent = 'Error: ' + e.message;
        document.getElementById('json-output').className = 'output-area error';
    }
}

function jsonValidate() {
    try {
        JSON.parse(document.getElementById('json-input').value);
        document.getElementById('json-output').textContent = 'Valid JSON!';
        document.getElementById('json-output').className = 'output-area success';
        document.getElementById('json-status').innerHTML = '<span class="status-badge valid">Valid</span>';
    } catch(e) {
        document.getElementById('json-output').textContent = 'Invalid: ' + e.message;
        document.getElementById('json-output').className = 'output-area error';
        document.getElementById('json-status').innerHTML = '<span class="status-badge invalid">Invalid</span>';
    }
}

// ========== JSON Tree View ==========
function jsonTreeView() {
    try {
        const parsed = JSON.parse(document.getElementById('json-input').value);
        const output = document.getElementById('json-output');
        output.className = 'output-area success';
        output.innerHTML = '<div class="json-tree">' + buildTreeHTML(parsed, '$') + '</div>';
        document.getElementById('json-status').innerHTML = '<span class="status-badge valid">Tree View</span>';
    } catch(e) {
        document.getElementById('json-output').textContent = 'Error: ' + e.message;
        document.getElementById('json-output').className = 'output-area error';
        document.getElementById('json-status').innerHTML = '<span class="status-badge invalid">Invalid</span>';
    }
}

function buildTreeHTML(value, path) {
    if (value === null) return '<span class="json-tree-null">null</span>';
    if (typeof value === 'boolean') return '<span class="json-tree-boolean">' + value + '</span>';
    if (typeof value === 'number') return '<span class="json-tree-number">' + value + '</span>';
    if (typeof value === 'string') return '<span class="json-tree-string">"' + escapeHtml(value) + '"</span>';

    const isArray = Array.isArray(value);
    const entries = isArray ? value.map((v, i) => [i, v]) : Object.entries(value);
    const open = isArray ? '[' : '{';
    const close = isArray ? ']' : '}';

    if (entries.length === 0) return open + close;

    let html = '<span class="json-tree-expanded">';
    html += '<span class="json-tree-toggle" onclick="this.parentElement.classList.toggle(\'json-tree-expanded\');this.parentElement.classList.toggle(\'json-tree-collapsed\')"></span>';
    html += open;
    html += '<span class="json-tree-children">';

    entries.forEach(([key, val], idx) => {
        const childPath = isArray ? path + '[' + key + ']' : path + '.' + key;
        html += '<div>';
        if (!isArray) {
            html += '<span class="json-tree-path" onclick="copyToClipboard(\'' + escapeHtml(childPath) + '\')" title="Copy path: ' + escapeHtml(childPath) + '">';
            html += '<span class="json-tree-key">"' + escapeHtml(String(key)) + '"</span>';
            html += '</span>: ';
        }
        html += buildTreeHTML(val, childPath);
        if (idx < entries.length - 1) html += ',';
        html += '</div>';
    });

    html += '</span>' + close + '</span>';
    return html;
}

// ========== HTML Formatter ==========
function htmlBeautify() {
    const input = document.getElementById('html-format-input').value;
    if (!input.trim()) { toast('Enter HTML to format'); return; }

    const formatted = beautifyHTML(input);
    document.getElementById('html-format-output').textContent = formatted;
    document.getElementById('html-format-output').className = 'output-area success';
}

function htmlMinify() {
    const input = document.getElementById('html-format-input').value;
    if (!input.trim()) { toast('Enter HTML to minify'); return; }

    const minified = input
        .replace(/\n/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/>\s+</g, '><')
        .replace(/\s*\/>/g, '/>')
        .trim();

    document.getElementById('html-format-output').textContent = minified;
    document.getElementById('html-format-output').className = 'output-area success';
}

function htmlPreview() {
    const input = document.getElementById('html-format-input').value;
    if (!input.trim()) { toast('Enter HTML to preview'); return; }

    const container = document.getElementById('html-preview-container');
    let frame = document.getElementById('html-preview-frame');
    if (frame) frame.remove();

    frame = document.createElement('iframe');
    frame.id = 'html-preview-frame';
    frame.style.cssText = 'width:100%;height:300px;border:1px solid var(--border);border-radius:10px;margin-top:1rem;background:white;';
    frame.sandbox = 'allow-same-origin';
    container.appendChild(frame);

    const doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    doc.write(input);
    doc.close();
}

function beautifyHTML(html) {
    const voidElements = new Set([
        'area','base','br','col','embed','hr','img','input',
        'link','meta','param','source','track','wbr'
    ]);

    let result = '';
    let indent = 0;
    const tab = '  ';

    // Normalize whitespace
    html = html.replace(/\s+/g, ' ').trim();

    let i = 0;
    while (i < html.length) {
        if (html[i] === '<') {
            // Find end of tag
            const tagEnd = html.indexOf('>', i);
            if (tagEnd === -1) break;

            const tag = html.slice(i, tagEnd + 1);
            const isClosing = tag[1] === '/';
            const isSelfClosing = tag[tagEnd - i - 1] === '/';
            const isDoctype = tag.startsWith('<!');
            const isComment = tag.startsWith('<!--');

            // Get tag name
            let tagName = '';
            if (!isComment && !isDoctype) {
                const nameMatch = tag.match(/<\/?([a-zA-Z][a-zA-Z0-9-]*)/);
                if (nameMatch) tagName = nameMatch[1].toLowerCase();
            }

            if (isComment) {
                const commentEnd = html.indexOf('-->', i);
                if (commentEnd !== -1) {
                    const comment = html.slice(i, commentEnd + 3);
                    result += tab.repeat(indent) + comment + '\n';
                    i = commentEnd + 3;
                } else {
                    result += tab.repeat(indent) + html.slice(i) + '\n';
                    break;
                }
            } else if (isClosing) {
                indent = Math.max(0, indent - 1);
                result += tab.repeat(indent) + tag + '\n';
                i = tagEnd + 1;
            } else if (isSelfClosing || voidElements.has(tagName) || isDoctype) {
                result += tab.repeat(indent) + tag + '\n';
                i = tagEnd + 1;
            } else {
                result += tab.repeat(indent) + tag + '\n';
                indent++;
                i = tagEnd + 1;
            }
        } else {
            // Text content
            const nextTag = html.indexOf('<', i);
            let text;
            if (nextTag === -1) {
                text = html.slice(i);
                i = html.length;
            } else {
                text = html.slice(i, nextTag);
                i = nextTag;
            }
            text = text.trim();
            if (text) {
                result += tab.repeat(indent) + text + '\n';
            }
        }
    }

    return result.trimEnd();
}

// ========== Base64 ==========
function b64Encode() {
    try {
        document.getElementById('b64-encoded').value = btoa(unescape(encodeURIComponent(document.getElementById('b64-text').value)));
    } catch(e) { toast('Encoding error: ' + e.message); }
}

function b64Decode() {
    try {
        document.getElementById('b64-text').value = decodeURIComponent(escape(atob(document.getElementById('b64-encoded').value)));
    } catch(e) { toast('Decoding error: Invalid Base64'); }
}

// ========== URL Encode ==========
function urlEncode() {
    document.getElementById('url-encoded').value = encodeURIComponent(document.getElementById('url-decoded').value);
}

function urlDecode() {
    try {
        document.getElementById('url-decoded').value = decodeURIComponent(document.getElementById('url-encoded').value);
    } catch(e) { toast('Invalid URL encoding'); }
}

// ========== JWT ==========
function jwtDecode() {
    const token = document.getElementById('jwt-input').value.trim();
    const parts = token.split('.');
    if (parts.length < 2) {
        document.getElementById('jwt-header').textContent = 'Invalid JWT: needs at least 2 parts';
        document.getElementById('jwt-payload').textContent = '';
        return;
    }
    try {
        const header = JSON.parse(atob(parts[0].replace(/-/g,'+').replace(/_/g,'/')));
        document.getElementById('jwt-header').textContent = JSON.stringify(header, null, 2);
    } catch(e) {
        document.getElementById('jwt-header').textContent = 'Error decoding header: ' + e.message;
    }
    try {
        const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
        let display = JSON.parse(JSON.stringify(payload));
        ['iat','exp','nbf'].forEach(k => {
            if (display[k]) display[k + '_readable'] = new Date(display[k] * 1000).toISOString();
        });
        document.getElementById('jwt-payload').textContent = JSON.stringify(display, null, 2);
    } catch(e) {
        document.getElementById('jwt-payload').textContent = 'Error decoding payload: ' + e.message;
    }
}

// ========== UUID ==========
function generateUUID() {
    if (crypto.randomUUID) return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return hex.slice(0,8) + '-' + hex.slice(8,12) + '-' + hex.slice(12,16) + '-' + hex.slice(16,20) + '-' + hex.slice(20);
}

function generateUUIDs() {
    const count = parseInt(document.getElementById('uuid-count').value) || 5;
    const container = document.getElementById('uuid-output');
    container.innerHTML = '';
    for (let i = 0; i < Math.min(count, 50); i++) {
        const uuid = generateUUID();
        const item = document.createElement('div');
        item.className = 'uuid-item';
        item.innerHTML = `<code>${uuid}</code><button class="btn btn-sm" onclick="copyToClipboard('${uuid}')">Copy</button>`;
        container.appendChild(item);
    }
}

function copyAllUUIDs() {
    const uuids = [...document.querySelectorAll('#uuid-output code')].map(c => c.textContent).join('\n');
    if (uuids) copyToClipboard(uuids);
}

// ========== Hash ==========
async function generateHashes() {
    const text = document.getElementById('hash-input').value;
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const container = document.getElementById('hash-output');
    container.innerHTML = '';

    const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
    for (const algo of algos) {
        const hashBuffer = await crypto.subtle.digest(algo, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        const card = document.createElement('div');
        card.className = 'color-value-card';
        card.innerHTML = `<span>${algo}</span><code onclick="copyToClipboard('${hashHex}')" title="Click to copy">${hashHex}</code>`;
        container.appendChild(card);
    }
}

// ========== Password ==========
function generatePassword() {
    const len = parseInt(document.getElementById('pw-length').value) || 16;
    let chars = '';
    if (document.getElementById('pw-upper').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (document.getElementById('pw-lower').checked) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (document.getElementById('pw-digits').checked) chars += '0123456789';
    if (document.getElementById('pw-symbols').checked) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) { toast('Select at least one character type'); return; }

    const maxValid = Math.floor(256 / chars.length) * chars.length;
    let pw = '';
    while (pw.length < len) {
        const array = new Uint8Array(len - pw.length);
        crypto.getRandomValues(array);
        for (const byte of array) {
            if (byte < maxValid && pw.length < len) {
                pw += chars[byte % chars.length];
            }
        }
    }

    document.getElementById('pw-output').textContent = pw;

    let strength = 0;
    if (len >= 8) strength++;
    if (len >= 12) strength++;
    if (len >= 16) strength++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) strength++;
    if (/\d/.test(pw)) strength++;
    if (/[^A-Za-z0-9]/.test(pw)) strength++;

    const pct = Math.min(strength / 6 * 100, 100);
    const colors = ['#ef4444','#ef4444','#eab308','#eab308','#22c55e','#22c55e','#22c55e'];
    const labels = ['Very Weak','Weak','Fair','Fair','Strong','Very Strong','Very Strong'];
    document.getElementById('pw-meter-fill').style.width = pct + '%';
    document.getElementById('pw-meter-fill').style.backgroundColor = colors[strength];
    document.getElementById('pw-strength-label').textContent = labels[strength] + ' (' + Math.round(pct) + '%)';
}

// ========== Lorem ==========
function generateLorem() {
    const sentences = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
        "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
        "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
        "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis.",
        "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse.",
        "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis.",
        "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus.",
        "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis.",
        "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit.",
        "Nulla pariatur excepteur sint occaecat cupidatat non proident.",
        "Fugiat nulla pariatur sed quia consequuntur magni dolores eos qui ratione."
    ];
    const count = parseInt(document.getElementById('lorem-count').value) || 3;
    let output = '';
    for (let p = 0; p < count; p++) {
        const numSentences = 3 + Math.floor(Math.random() * 4);
        let para = '';
        for (let s = 0; s < numSentences; s++) {
            para += sentences[Math.floor(Math.random() * sentences.length)] + ' ';
        }
        output += para.trim() + '\n\n';
    }
    document.getElementById('lorem-output').textContent = output.trim();
}

// ========== QR Code ==========
function generateQR() {
    const text = document.getElementById('qr-input').value;
    const size = parseInt(document.getElementById('qr-size').value);
    const ec = document.getElementById('qr-ec').value;
    const container = document.getElementById('qr-output');

    if (!text) { toast('Enter text or URL to generate QR code'); return; }

    if (typeof qrcode === 'undefined') {
        container.innerHTML = '<span style="color:var(--text-muted)">QR library loading, please try again...</span>';
        return;
    }

    try {
        const ecLevel = { L: 'L', M: 'M', Q: 'Q', H: 'H' }[ec] || 'M';
        const qr = qrcode(0, ecLevel);
        qr.addData(text);
        qr.make();

        const moduleCount = qr.getModuleCount();
        const cellSize = size;
        const svgSize = moduleCount * cellSize;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">`;
        svg += `<rect width="${svgSize}" height="${svgSize}" fill="white"/>`;
        for (let r = 0; r < moduleCount; r++) {
            for (let c = 0; c < moduleCount; c++) {
                if (qr.isDark(r, c)) {
                    svg += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
                }
            }
        }
        svg += '</svg>';
        container.innerHTML = svg;
    } catch(e) {
        container.innerHTML = '<span style="color:var(--red)">Error: ' + escapeHtml(e.message) + '</span>';
    }
}

// ========== Regex ==========
function regexTest() {
    const pattern = document.getElementById('regex-pattern').value;
    const flags = document.getElementById('regex-flags').value;
    const input = document.getElementById('regex-input').value;
    const output = document.getElementById('regex-output');
    const info = document.getElementById('regex-info');

    if (!pattern) { output.innerHTML = '<span style="color:var(--text-muted)">Enter a pattern to begin...</span>'; info.textContent = ''; return; }

    try {
        const regex = new RegExp(pattern, flags);
        const matches = [...input.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'))];
        info.textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''} found`;

        if (matches.length === 0) {
            output.innerHTML = '<span style="color:var(--text-muted)">No matches</span>';
            return;
        }

        let result = '';
        let lastIndex = 0;
        matches.forEach(m => {
            result += escapeHtml(input.slice(lastIndex, m.index));
            result += `<span class="match-highlight">${escapeHtml(m[0])}</span>`;
            lastIndex = m.index + m[0].length;
        });
        result += escapeHtml(input.slice(lastIndex));
        output.innerHTML = result;

        if (matches[0].length > 1) {
            let groupInfo = '\nCapture groups:\n';
            matches.forEach((m, i) => {
                for (let g = 1; g < m.length; g++) {
                    groupInfo += `Match ${i+1}, Group ${g}: ${m[g]}\n`;
                }
            });
            info.textContent += groupInfo;
        }
    } catch(e) {
        output.innerHTML = `<span style="color:var(--red)">${escapeHtml(e.message)}</span>`;
        info.textContent = '';
    }
}

// ========== Diff ==========
function computeDiff() {
    const left = document.getElementById('diff-left').value.split('\n');
    const right = document.getElementById('diff-right').value.split('\n');
    const output = document.getElementById('diff-output');

    const lcs = lcsLines(left, right);
    let html = '';
    let li = 0, ri = 0, ci = 0;

    while (li < left.length || ri < right.length) {
        if (ci < lcs.length && li < left.length && ri < right.length && left[li] === lcs[ci] && right[ri] === lcs[ci]) {
            html += `<div class="diff-line"> ${escapeHtml(left[li])}</div>`;
            li++; ri++; ci++;
        } else if (ri < right.length && (ci >= lcs.length || right[ri] !== lcs[ci])) {
            html += `<div class="diff-line diff-added">+ ${escapeHtml(right[ri])}</div>`;
            ri++;
        } else if (li < left.length && (ci >= lcs.length || left[li] !== lcs[ci])) {
            html += `<div class="diff-line diff-removed">- ${escapeHtml(left[li])}</div>`;
            li++;
        }
    }

    output.innerHTML = html || '<div class="diff-line" style="color:var(--text-muted);padding:1rem">No differences found</div>';
}

function lcsLines(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({length: m+1}, () => Array(n+1).fill(0));
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);

    const result = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
        if (a[i-1] === b[j-1]) { result.unshift(a[i-1]); i--; j--; }
        else if (dp[i-1][j] > dp[i][j-1]) i--;
        else j--;
    }
    return result;
}

// ========== Cron Parser ==========
function setCron(expr) {
    document.getElementById('cron-input').value = expr;
    parseCron();
}

function parseCron() {
    const input = document.getElementById('cron-input').value.trim();
    const output = document.getElementById('cron-output');
    const runsContainer = document.getElementById('cron-next-runs');

    if (!input) { output.textContent = ''; runsContainer.innerHTML = ''; return; }

    const parts = input.split(/\s+/);
    if (parts.length !== 5) {
        output.innerHTML = '<span style="color:var(--red)">Expected 5 fields: minute hour day month weekday</span>';
        runsContainer.innerHTML = '';
        return;
    }

    const [minute, hour, dom, month, dow] = parts;
    const desc = describeCron(minute, hour, dom, month, dow);
    output.innerHTML = '<span style="color:var(--accent-light);font-size:1.05rem">' + escapeHtml(desc) + '</span>';

    try {
        const runs = getNextCronRuns(parts, 5);
        runsContainer.innerHTML = runs.map((d, i) =>
            `<div class="color-value-card"><span>#${i+1}</span><code>${d.toLocaleString()}</code></div>`
        ).join('');
    } catch(e) {
        runsContainer.innerHTML = '';
    }
}

function describeCron(min, hr, dom, mon, dow) {
    const pieces = [];

    if (min === '*' && hr === '*' && dom === '*' && mon === '*' && dow === '*') return 'Every minute';

    if (min === '*') pieces.push('every minute');
    else if (min.startsWith('*/')) pieces.push('every ' + min.slice(2) + ' minutes');
    else pieces.push('at minute ' + min);

    if (hr === '*') { /* covered */ }
    else if (hr.startsWith('*/')) pieces.push('every ' + hr.slice(2) + ' hours');
    else pieces.push('past hour ' + hr);

    if (dom !== '*') {
        if (dom.startsWith('*/')) pieces.push('every ' + dom.slice(2) + ' days');
        else pieces.push('on day ' + dom);
    }

    const monthNames = ['','January','February','March','April','May','June','July','August','September','October','November','December'];
    if (mon !== '*') {
        if (mon.startsWith('*/')) pieces.push('every ' + mon.slice(2) + ' months');
        else {
            const monthParts = mon.split(',').map(m => {
                const n = parseInt(m);
                return (n >= 1 && n <= 12) ? monthNames[n] : m;
            });
            pieces.push('in ' + monthParts.join(', '));
        }
    }

    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    if (dow !== '*') {
        const dayParts = dow.split(',').map(d => {
            if (d.includes('-')) {
                const [s, e] = d.split('-').map(Number);
                return dayNames[s] + ' to ' + dayNames[e];
            }
            const n = parseInt(d);
            return (n >= 0 && n <= 6) ? dayNames[n] : d;
        });
        pieces.push('on ' + dayParts.join(', '));
    }

    return pieces.join(', ').replace(/^./, c => c.toUpperCase());
}

function getNextCronRuns(parts, count) {
    const [minF, hrF, domF, monF, dowF] = parts;
    const runs = [];
    const now = new Date();
    let d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0);

    for (let attempts = 0; attempts < 525600 && runs.length < count; attempts++) {
        if (cronFieldMatches(monF, d.getMonth() + 1) &&
            cronFieldMatches(domF, d.getDate()) &&
            cronFieldMatches(dowF, d.getDay()) &&
            cronFieldMatches(hrF, d.getHours()) &&
            cronFieldMatches(minF, d.getMinutes())) {
            runs.push(new Date(d));
        }
        d.setMinutes(d.getMinutes() + 1);
    }
    return runs;
}

function cronFieldMatches(field, value) {
    if (field === '*') return true;
    return field.split(',').some(part => {
        if (part.includes('/')) {
            const [range, step] = part.split('/');
            const s = parseInt(step);
            if (range === '*') return value % s === 0;
            const start = parseInt(range);
            return value >= start && (value - start) % s === 0;
        }
        if (part.includes('-')) {
            const [a, b] = part.split('-').map(Number);
            return value >= a && value <= b;
        }
        return parseInt(part) === value;
    });
}

// ========== Timestamp ==========
function tsNow() {
    const now = new Date();
    document.getElementById('ts-unix').value = Math.floor(now.getTime() / 1000);
    tsFromUnix();
}

function tsFromUnix() {
    const val = document.getElementById('ts-unix').value.trim();
    if (!val) return;
    const ts = parseInt(val);
    const ms = val.length > 12 ? ts : ts * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return;
    document.getElementById('ts-human').value = d.toLocaleString();
    showTsDetails(d, ts);
}

function tsFromHuman() {
    const val = document.getElementById('ts-human').value.trim();
    if (!val) return;
    const d = new Date(val);
    if (isNaN(d.getTime())) return;
    const ts = Math.floor(d.getTime() / 1000);
    document.getElementById('ts-unix').value = ts;
    showTsDetails(d, ts);
}

function showTsDetails(d, ts) {
    const container = document.getElementById('ts-details');
    const details = [
        ['ISO 8601', d.toISOString()],
        ['UTC', d.toUTCString()],
        ['Local', d.toLocaleString()],
        ['Unix (s)', Math.floor(d.getTime()/1000)],
        ['Unix (ms)', d.getTime()],
        ['Day of Week', d.toLocaleDateString('en', {weekday:'long'})],
        ['Relative', timeAgo(d)]
    ];
    container.innerHTML = details.map(([label, value]) =>
        `<div class="color-value-card"><span>${label}</span><code onclick="copyToClipboard('${value}')">${value}</code></div>`
    ).join('');
}

function timeAgo(date) {
    const diff = Date.now() - date.getTime();
    const abs = Math.abs(diff);
    const suffix = diff > 0 ? 'ago' : 'from now';
    if (abs < 60000) return Math.round(abs/1000) + 's ' + suffix;
    if (abs < 3600000) return Math.round(abs/60000) + 'm ' + suffix;
    if (abs < 86400000) return Math.round(abs/3600000) + 'h ' + suffix;
    return Math.round(abs/86400000) + 'd ' + suffix;
}

// ========== Color ==========
function colorFromPicker() {
    const hex = document.getElementById('color-picker').value;
    document.getElementById('color-hex-input').value = hex;
    updateColor(hex);
}

function colorFromHex() {
    let hex = document.getElementById('color-hex-input').value.trim();
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        document.getElementById('color-picker').value = hex;
        updateColor(hex);
    }
}

function updateColor(hex) {
    document.getElementById('color-preview').style.backgroundColor = hex;
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);

    const rn=r/255, gn=g/255, bn=b/255;
    const max=Math.max(rn,gn,bn), min=Math.min(rn,gn,bn);
    let h,s,l=(max+min)/2;
    if(max===min){h=s=0;}else{
        const d=max-min;
        s=l>0.5?d/(2-max-min):d/(max+min);
        switch(max){case rn:h=((gn-bn)/d+(gn<bn?6:0))/6;break;case gn:h=((bn-rn)/d+2)/6;break;case bn:h=((rn-gn)/d+4)/6;break;}
    }

    const values = [
        ['HEX', hex],
        ['RGB', `rgb(${r}, ${g}, ${b})`],
        ['RGBA', `rgba(${r}, ${g}, ${b}, 1)`],
        ['HSL', `hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`],
    ];

    document.getElementById('color-values').innerHTML = values.map(([label, value]) =>
        `<div class="color-value-card"><span>${label}</span><code onclick="copyToClipboard('${value}')">${value}</code></div>`
    ).join('');
}

// ========== Number Base ==========
function numConvert(from) {
    const val = document.getElementById('num-' + from).value.trim();
    if (!val) return;
    let num;
    try {
        switch(from) {
            case 'dec': num = parseInt(val, 10); break;
            case 'hex': num = parseInt(val, 16); break;
            case 'oct': num = parseInt(val, 8); break;
            case 'bin': num = parseInt(val, 2); break;
        }
        if (isNaN(num)) return;
        if (from !== 'dec') document.getElementById('num-dec').value = num;
        if (from !== 'hex') document.getElementById('num-hex').value = num.toString(16).toUpperCase();
        if (from !== 'oct') document.getElementById('num-oct').value = num.toString(8);
        if (from !== 'bin') document.getElementById('num-bin').value = num.toString(2);
    } catch(e) {}
}

// ========== CSS Units ==========
function unitsConvertFrom(from) {
    const base = parseFloat(document.getElementById('units-base').value) || 16;
    const val = parseFloat(document.getElementById('unit-' + from).value);
    if (isNaN(val)) return;

    let px;
    switch(from) {
        case 'px': px = val; break;
        case 'rem': case 'em': px = val * base; break;
        case 'pt': px = val * (96/72); break;
    }

    if (from !== 'px') document.getElementById('unit-px').value = Math.round(px * 1000) / 1000;
    if (from !== 'rem') document.getElementById('unit-rem').value = Math.round(px / base * 1000) / 1000;
    if (from !== 'em') document.getElementById('unit-em').value = Math.round(px / base * 1000) / 1000;
    if (from !== 'pt') document.getElementById('unit-pt').value = Math.round(px * 72 / 96 * 1000) / 1000;
}

function unitsConvert() { unitsConvertFrom('px'); }

// ========== YAML / JSON ==========
function yamlToJson() {
    try {
        if (typeof jsyaml === 'undefined') { toast('YAML library loading, please try again...'); return; }
        const parsed = jsyaml.load(document.getElementById('yaml-input').value);
        document.getElementById('yaml-json-input').value = JSON.stringify(parsed, null, 2);
    } catch(e) { toast('YAML parse error: ' + e.message); }
}

function jsonToYaml() {
    try {
        if (typeof jsyaml === 'undefined') { toast('YAML library loading, please try again...'); return; }
        const parsed = JSON.parse(document.getElementById('yaml-json-input').value);
        document.getElementById('yaml-input').value = jsyaml.dump(parsed, { indent: 2, lineWidth: -1 });
    } catch(e) { toast('JSON parse error: ' + e.message); }
}

// ========== Case Converter ==========
function convertCase(type) {
    const input = document.getElementById('case-input').value;
    const words = input.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').split(/\s+/).filter(Boolean);
    let result;
    switch(type) {
        case 'upper': result = input.toUpperCase(); break;
        case 'lower': result = input.toLowerCase(); break;
        case 'title': result = words.map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' '); break;
        case 'sentence': result = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase(); break;
        case 'camel': result = words.map((w,i) => i===0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()).join(''); break;
        case 'pascal': result = words.map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(''); break;
        case 'snake': result = words.map(w => w.toLowerCase()).join('_'); break;
        case 'kebab': result = words.map(w => w.toLowerCase()).join('-'); break;
        case 'constant': result = words.map(w => w.toUpperCase()).join('_'); break;
    }
    document.getElementById('case-output').textContent = result;
}

// ========== Word Counter ==========
function wordCount() {
    const text = document.getElementById('wc-input').value;
    document.getElementById('wc-chars').textContent = text.length;
    document.getElementById('wc-chars-ns').textContent = text.replace(/\s/g, '').length;
    document.getElementById('wc-words').textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById('wc-sentences').textContent = text.trim() ? (text.match(/[.!?]+/g) || []).length : 0;
    document.getElementById('wc-lines').textContent = text ? text.split('\n').length : 0;
    document.getElementById('wc-paragraphs').textContent = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
}

// ========== SQL Formatter ==========
function sqlFormat() {
    const input = document.getElementById('sql-input').value;
    const keywords = ['SELECT','FROM','WHERE','AND','OR','JOIN','LEFT JOIN','RIGHT JOIN','INNER JOIN','OUTER JOIN','FULL JOIN','ON','ORDER BY','GROUP BY','HAVING','LIMIT','OFFSET','INSERT INTO','VALUES','UPDATE','SET','DELETE FROM','CREATE TABLE','ALTER TABLE','DROP TABLE','UNION','UNION ALL','CASE','WHEN','THEN','ELSE','END','AS','IN','NOT','EXISTS','BETWEEN','LIKE','IS NULL','IS NOT NULL','ASC','DESC','DISTINCT','COUNT','SUM','AVG','MIN','MAX'];

    let sql = input.replace(/\s+/g, ' ').trim();

    keywords.forEach(kw => {
        const regex = new RegExp('\\b' + kw.replace(/ /g, '\\s+') + '\\b', 'gi');
        sql = sql.replace(regex, kw);
    });

    const majorKeywords = ['SELECT','FROM','WHERE','AND','OR','JOIN','LEFT JOIN','RIGHT JOIN','INNER JOIN','ORDER BY','GROUP BY','HAVING','LIMIT','OFFSET','UNION','SET','VALUES'];
    majorKeywords.forEach(kw => {
        const regex = new RegExp('\\b(' + kw.replace(/ /g, '\\s+') + ')\\b', 'g');
        sql = sql.replace(regex, '\n$1');
    });

    sql = sql.replace(/\n(AND|OR)\b/g, '\n  $1');
    sql = sql.replace(/\n(ON)\b/g, '\n  $1');

    document.getElementById('sql-output').textContent = sql.trim();
}

function sqlMinify() {
    const input = document.getElementById('sql-input').value;
    document.getElementById('sql-output').textContent = input.replace(/\s+/g, ' ').trim();
}

function sqlUppercase() {
    const input = document.getElementById('sql-input').value;
    const keywords = ['select','from','where','and','or','join','left','right','inner','outer','full','on','order by','group by','having','limit','offset','insert','into','values','update','set','delete','create','table','alter','drop','union','all','case','when','then','else','end','as','in','not','exists','between','like','is','null','asc','desc','distinct','count','sum','avg','min','max'];
    let sql = input;
    keywords.forEach(kw => {
        const regex = new RegExp('\\b' + kw + '\\b', 'gi');
        sql = sql.replace(regex, kw.toUpperCase());
    });
    document.getElementById('sql-output').textContent = sql;
}

// ========== Markdown Preview ==========
function mdPreview() {
    const input = document.getElementById('md-input').value;

    let html = escapeHtml(input)
        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:var(--bg-card);padding:0.5rem;border-radius:6px;overflow-x:auto"><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code style="background:var(--bg-card);padding:0.15rem 0.4rem;border-radius:4px;font-size:0.85em">$1</code>')
        .replace(/^### (.+)$/gm, '<h3 style="color:var(--text);margin:0.5rem 0;font-size:1.1rem">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 style="color:var(--text);margin:0.5rem 0;font-size:1.3rem">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 style="color:var(--text);margin:0.5rem 0;font-size:1.5rem">$1</h1>')
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        .replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:3px solid var(--accent);padding-left:0.75rem;color:var(--text-secondary);margin:0.5rem 0">$1</blockquote>')
        .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
        .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:1rem 0">')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');

    document.getElementById('md-output').innerHTML = html;
}

// ========== Universal Code Generator ==========
const CODEGEN_LANGS = ['Python','JavaScript','TypeScript','Java','C#','PHP','Go','Ruby','Rust','Swift','Kotlin','C++'];
const CODEGEN_KEYS = ['python','javascript','typescript','java','csharp','php','go','ruby','rust','swift','kotlin','cpp'];
const CODEGEN_TOOLS = ['json','html-format','base64','url','jwt','uuid','hash','password','regex','timestamp','number','case','sql','yaml','commit','mockdata','ghactions','ratelimit','dbschema','apitiming','jsondiff'];

function injectCodeGenerators() {
    CODEGEN_TOOLS.forEach(tool => {
        const panel = document.getElementById('panel-' + tool);
        if (!panel) return;
        const section = document.createElement('div');
        section.className = 'codegen-section';
        section.innerHTML = `<label>Code Generator</label>
            <div class="btn-row">${CODEGEN_LANGS.map((l, i) =>
                `<button class="btn" onclick="codeGen('${tool}','${CODEGEN_KEYS[i]}')">${l}</button>`
            ).join('')}</div>
            <div class="output-area" id="codegen-${tool}" style="position:relative;min-height:120px;display:none">
                <button class="copy-btn" onclick="copyOutput('codegen-${tool}')">Copy</button>
            </div>`;
        panel.appendChild(section);
    });
}

function esc(s) { return (s||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n'); }
function escSingle(s) { return (s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n'); }

function codeGen(tool, lang) {
    const output = document.getElementById('codegen-' + tool);
    const code = codeGenFor(tool, lang);
    if (!code) { toast('Enter input first'); return; }
    output.style.display = 'block';
    output.textContent = code;
}

function codeGenFor(tool, lang) {
    const g = codeGenerators[tool];
    if (!g) return null;
    return g(lang);
}

const codeGenerators = {

// ===== JSON =====
json: (lang) => {
    const input = document.getElementById('json-input').value || '{"key": "value"}';
    const e = esc(input);
    const s = escSingle(input);
    return {
        python: `import json

data = '${escSingle(input)}'

# Parse JSON
parsed = json.loads(data)
print(parsed)

# Format / Pretty print
formatted = json.dumps(parsed, indent=2)
print(formatted)

# Minify
minified = json.dumps(parsed, separators=(",", ":"))
print(minified)

# Access values
# parsed["key"]`,

        javascript: `const data = '${e}';

// Parse JSON
const parsed = JSON.parse(data);
console.log(parsed);

// Format / Pretty print
const formatted = JSON.stringify(parsed, null, 2);
console.log(formatted);

// Minify
const minified = JSON.stringify(parsed);
console.log(minified);`,

        typescript: `const data: string = '${e}';

// Parse JSON
const parsed: Record<string, unknown> = JSON.parse(data);
console.log(parsed);

// Format / Pretty print
const formatted: string = JSON.stringify(parsed, null, 2);
console.log(formatted);

// Minify
const minified: string = JSON.stringify(parsed);
console.log(minified);`,

        java: `import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

public class JsonFormat {
    public static void main(String[] args) {
        String data = "${e}";

        // Parse and format
        JsonElement json = JsonParser.parseString(data);
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        String formatted = gson.toJson(json);
        System.out.println(formatted);

        // Minify
        String minified = new Gson().toJson(json);
        System.out.println(minified);
    }
}`,

        csharp: `using System.Text.Json;

string data = "${e}";

// Parse
var json = JsonDocument.Parse(data);

// Format
var options = new JsonSerializerOptions { WriteIndented = true };
string formatted = JsonSerializer.Serialize(json, options);
Console.WriteLine(formatted);

// Minify
string minified = JsonSerializer.Serialize(json);
Console.WriteLine(minified);`,

        php: `<?php
$data = '${s}';

// Parse JSON
$parsed = json_decode($data, true);
print_r($parsed);

// Format / Pretty print
$formatted = json_encode($parsed, JSON_PRETTY_PRINT);
echo $formatted;

// Minify
$minified = json_encode($parsed);
echo $minified;`,

        go: `package main

import (
\t"encoding/json"
\t"fmt"
)

func main() {
\tdata := \`${input.replace(/`/g, '` + "`" + `')}\`

\t// Parse
\tvar parsed interface{}
\tjson.Unmarshal([]byte(data), &parsed)

\t// Format
\tformatted, _ := json.MarshalIndent(parsed, "", "  ")
\tfmt.Println(string(formatted))

\t// Minify
\tminified, _ := json.Marshal(parsed)
\tfmt.Println(string(minified))
}`,

        ruby: `require 'json'

data = '${s}'

# Parse
parsed = JSON.parse(data)
puts parsed

# Format
formatted = JSON.pretty_generate(parsed)
puts formatted

# Minify
minified = JSON.generate(parsed)
puts minified`,

        rust: `use serde_json::Value;

fn main() {
    let data = r#"${input.replace(/"/g, '\\"')}"#;

    // Parse
    let parsed: Value = serde_json::from_str(data).unwrap();

    // Format
    let formatted = serde_json::to_string_pretty(&parsed).unwrap();
    println!("{}", formatted);

    // Minify
    let minified = serde_json::to_string(&parsed).unwrap();
    println!("{}", minified);
}`,

        swift: `import Foundation

let data = "${e}"

if let jsonData = data.data(using: .utf8) {
    // Parse
    let parsed = try JSONSerialization.jsonObject(with: jsonData)

    // Format
    let formatted = try JSONSerialization.data(withJSONObject: parsed, options: .prettyPrinted)
    print(String(data: formatted, encoding: .utf8)!)

    // Minify
    let minified = try JSONSerialization.data(withJSONObject: parsed)
    print(String(data: minified, encoding: .utf8)!)
}`,

        kotlin: `import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement

fun main() {
    val data = "${e}"
    val json = Json { prettyPrint = true }

    // Parse
    val parsed = Json.parseToJsonElement(data)

    // Format
    val formatted = json.encodeToString(JsonElement.serializer(), parsed)
    println(formatted)

    // Minify
    val minified = Json.encodeToString(JsonElement.serializer(), parsed)
    println(minified)
}`,

        cpp: `#include <iostream>
#include <nlohmann/json.hpp>

int main() {
    std::string data = "${e}";

    // Parse
    auto parsed = nlohmann::json::parse(data);

    // Format
    std::cout << parsed.dump(2) << std::endl;

    // Minify
    std::cout << parsed.dump() << std::endl;

    return 0;
}`
    }[lang];
},

// ===== HTML Formatter =====
'html-format': (lang) => {
    const input = document.getElementById('html-format-input').value || '<div><p>Hello</p></div>';
    const e = esc(input);
    return {
        python: `from bs4 import BeautifulSoup

html = "${e}"

# Beautify
soup = BeautifulSoup(html, "html.parser")
formatted = soup.prettify()
print(formatted)

# Minify
import re
minified = re.sub(r">\\s+<", "><", html).strip()
print(minified)`,

        javascript: `// Using built-in DOMParser
const html = "${e}";

// Beautify (basic)
function beautifyHTML(html) {
  let formatted = "", indent = 0;
  html.replace(/></g, ">\\n<").split("\\n").forEach(line => {
    if (line.match(/^<\\//)) indent--;
    formatted += "  ".repeat(Math.max(indent, 0)) + line.trim() + "\\n";
    if (line.match(/^<[^/!]/) && !line.match(/\\/>/)) indent++;
  });
  return formatted.trim();
}

console.log(beautifyHTML(html));

// Minify
const minified = html.replace(/\\s+/g, " ").replace(/>\\s+</g, "><").trim();
console.log(minified);`,

        typescript: `const html: string = "${e}";

function beautifyHTML(html: string): string {
  let formatted = "", indent = 0;
  html.replace(/></g, ">\\n<").split("\\n").forEach((line: string) => {
    if (line.match(/^<\\//)) indent--;
    formatted += "  ".repeat(Math.max(indent, 0)) + line.trim() + "\\n";
    if (line.match(/^<[^/!]/) && !line.match(/\\/>/)) indent++;
  });
  return formatted.trim();
}

console.log(beautifyHTML(html));`,

        java: `import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

public class HtmlFormat {
    public static void main(String[] args) {
        String html = "${e}";

        // Beautify
        Document doc = Jsoup.parse(html);
        doc.outputSettings().indentAmount(2);
        System.out.println(doc.body().html());

        // Minify
        doc.outputSettings().indentAmount(0).outline(false);
        System.out.println(doc.body().html().replaceAll("\\\\s+", " "));
    }
}`,

        csharp: `using System.Xml.Linq;

string html = "${e}";

// Using HtmlAgilityPack
// Install-Package HtmlAgilityPack
var doc = new HtmlAgilityPack.HtmlDocument();
doc.LoadHtml(html);

// Beautify
using var writer = new StringWriter();
doc.Save(writer);
Console.WriteLine(writer.ToString());

// Minify
string minified = System.Text.RegularExpressions.Regex.Replace(html, @">\\s+<", "><").Trim();
Console.WriteLine(minified);`,

        php: `<?php
$html = '${escSingle(input)}';

// Beautify using DOMDocument
$dom = new DOMDocument();
$dom->preserveWhiteSpace = false;
$dom->formatOutput = true;
$dom->loadHTML($html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
echo $dom->saveHTML();

// Minify
$minified = preg_replace('/>\\s+</', '><', $html);
echo trim($minified);`,

        go: `package main

import (
\t"fmt"
\t"strings"
\t"golang.org/x/net/html"
\t"bytes"
)

func main() {
\tsrc := \`${input.replace(/`/g, '` + "`" + `')}\`

\t// Parse
\tdoc, _ := html.Parse(strings.NewReader(src))

\t// Render
\tvar buf bytes.Buffer
\thtml.Render(&buf, doc)
\tfmt.Println(buf.String())
}`,

        ruby: `require 'nokogiri'

html = '${escSingle(input)}'

# Beautify
doc = Nokogiri::HTML.fragment(html)
formatted = doc.to_xhtml(indent: 2)
puts formatted

# Minify
minified = html.gsub(/>\\s+</, '><').strip
puts minified`,

        rust: `// Using scraper crate
use scraper::Html;

fn main() {
    let html = r#"${input.replace(/"/g, '\\"')}"#;

    // Parse
    let document = Html::parse_fragment(html);
    println!("{}", document.html());
}`,

        swift: `import Foundation

let html = "${e}"

// Minify
let minified = html
    .replacingOccurrences(of: ">\\\\s+<", with: "><", options: .regularExpression)
    .trimmingCharacters(in: .whitespacesAndNewlines)
print(minified)`,

        kotlin: `import org.jsoup.Jsoup

fun main() {
    val html = "${e}"

    // Beautify
    val doc = Jsoup.parse(html)
    doc.outputSettings().indentAmount(2)
    println(doc.body().html())
}`,

        cpp: `#include <iostream>
#include <string>
#include <regex>

int main() {
    std::string html = "${e}";

    // Minify
    std::string minified = std::regex_replace(html, std::regex(">\\\\s+<"), "><");
    std::cout << minified << std::endl;

    return 0;
}`
    }[lang];
},

// ===== Base64 =====
base64: (lang) => {
    const text = document.getElementById('b64-text').value || 'Hello World';
    const e = esc(text);
    return {
        python: `import base64

text = "${e}"

# Encode
encoded = base64.b64encode(text.encode()).decode()
print(f"Encoded: {encoded}")

# Decode
decoded = base64.b64decode(encoded).decode()
print(f"Decoded: {decoded}")`,

        javascript: `const text = "${e}";

// Encode
const encoded = btoa(unescape(encodeURIComponent(text)));
console.log("Encoded:", encoded);

// Decode
const decoded = decodeURIComponent(escape(atob(encoded)));
console.log("Decoded:", decoded);`,

        typescript: `const text: string = "${e}";

// Encode
const encoded: string = btoa(unescape(encodeURIComponent(text)));
console.log("Encoded:", encoded);

// Decode
const decoded: string = decodeURIComponent(escape(atob(encoded)));
console.log("Decoded:", decoded);`,

        java: `import java.util.Base64;

public class Base64Example {
    public static void main(String[] args) {
        String text = "${e}";

        // Encode
        String encoded = Base64.getEncoder().encodeToString(text.getBytes());
        System.out.println("Encoded: " + encoded);

        // Decode
        String decoded = new String(Base64.getDecoder().decode(encoded));
        System.out.println("Decoded: " + decoded);
    }
}`,

        csharp: `using System;

string text = "${e}";

// Encode
string encoded = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(text));
Console.WriteLine($"Encoded: {encoded}");

// Decode
string decoded = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(encoded));
Console.WriteLine($"Decoded: {decoded}");`,

        php: `<?php
$text = '${escSingle(text)}';

// Encode
$encoded = base64_encode($text);
echo "Encoded: $encoded\\n";

// Decode
$decoded = base64_decode($encoded);
echo "Decoded: $decoded\\n";`,

        go: `package main

import (
\t"encoding/base64"
\t"fmt"
)

func main() {
\ttext := "${e}"

\t// Encode
\tencoded := base64.StdEncoding.EncodeToString([]byte(text))
\tfmt.Println("Encoded:", encoded)

\t// Decode
\tdecoded, _ := base64.StdEncoding.DecodeString(encoded)
\tfmt.Println("Decoded:", string(decoded))
}`,

        ruby: `require 'base64'

text = '${escSingle(text)}'

# Encode
encoded = Base64.strict_encode64(text)
puts "Encoded: #{encoded}"

# Decode
decoded = Base64.decode64(encoded)
puts "Decoded: #{decoded}"`,

        rust: `use base64::{Engine, engine::general_purpose};

fn main() {
    let text = "${e}";

    // Encode
    let encoded = general_purpose::STANDARD.encode(text);
    println!("Encoded: {}", encoded);

    // Decode
    let decoded = general_purpose::STANDARD.decode(&encoded).unwrap();
    println!("Decoded: {}", String::from_utf8(decoded).unwrap());
}`,

        swift: `import Foundation

let text = "${e}"

// Encode
let encoded = Data(text.utf8).base64EncodedString()
print("Encoded: \\(encoded)")

// Decode
if let data = Data(base64Encoded: encoded) {
    let decoded = String(data: data, encoding: .utf8)!
    print("Decoded: \\(decoded)")
}`,

        kotlin: `import java.util.Base64

fun main() {
    val text = "${e}"

    // Encode
    val encoded = Base64.getEncoder().encodeToString(text.toByteArray())
    println("Encoded: $encoded")

    // Decode
    val decoded = String(Base64.getDecoder().decode(encoded))
    println("Decoded: $decoded")
}`,

        cpp: `#include <iostream>
#include <string>
// Requires a base64 library or implement your own
// Example using boost:
// #include <boost/beast/core/detail/base64.hpp>

int main() {
    std::string text = "${e}";

    // Using OpenSSL
    // BIO *bio, *b64;
    // Encode / Decode with BIO_write / BIO_read

    std::cout << "Use a library like Boost.Beast or OpenSSL for base64" << std::endl;
    return 0;
}`
    }[lang];
},

// ===== URL Encode =====
url: (lang) => {
    const text = document.getElementById('url-decoded').value || 'Hello World & more!';
    const e = esc(text);
    return {
        python: `from urllib.parse import quote, unquote

text = "${e}"

# Encode
encoded = quote(text)
print(f"Encoded: {encoded}")

# Decode
decoded = unquote(encoded)
print(f"Decoded: {decoded}")`,

        javascript: `const text = "${e}";

// Encode
const encoded = encodeURIComponent(text);
console.log("Encoded:", encoded);

// Decode
const decoded = decodeURIComponent(encoded);
console.log("Decoded:", decoded);`,

        typescript: `const text: string = "${e}";

const encoded: string = encodeURIComponent(text);
console.log("Encoded:", encoded);

const decoded: string = decodeURIComponent(encoded);
console.log("Decoded:", decoded);`,

        java: `import java.net.URLEncoder;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

public class UrlEncode {
    public static void main(String[] args) {
        String text = "${e}";

        String encoded = URLEncoder.encode(text, StandardCharsets.UTF_8);
        System.out.println("Encoded: " + encoded);

        String decoded = URLDecoder.decode(encoded, StandardCharsets.UTF_8);
        System.out.println("Decoded: " + decoded);
    }
}`,

        csharp: `using System;
using System.Net;

string text = "${e}";

string encoded = Uri.EscapeDataString(text);
Console.WriteLine($"Encoded: {encoded}");

string decoded = Uri.UnescapeDataString(encoded);
Console.WriteLine($"Decoded: {decoded}");`,

        php: `<?php
$text = '${escSingle(text)}';

$encoded = urlencode($text);
echo "Encoded: $encoded\\n";

$decoded = urldecode($encoded);
echo "Decoded: $decoded\\n";`,

        go: `package main

import (
\t"fmt"
\t"net/url"
)

func main() {
\ttext := "${e}"

\tencoded := url.QueryEscape(text)
\tfmt.Println("Encoded:", encoded)

\tdecoded, _ := url.QueryUnescape(encoded)
\tfmt.Println("Decoded:", decoded)
}`,

        ruby: `require 'uri'

text = '${escSingle(text)}'

encoded = URI.encode_www_form_component(text)
puts "Encoded: #{encoded}"

decoded = URI.decode_www_form_component(encoded)
puts "Decoded: #{decoded}"`,

        rust: `use urlencoding::{encode, decode};

fn main() {
    let text = "${e}";

    let encoded = encode(text);
    println!("Encoded: {}", encoded);

    let decoded = decode(&encoded).unwrap();
    println!("Decoded: {}", decoded);
}`,

        swift: `import Foundation

let text = "${e}"

let encoded = text.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!
print("Encoded: \\(encoded)")

let decoded = encoded.removingPercentEncoding!
print("Decoded: \\(decoded)")`,

        kotlin: `import java.net.URLEncoder
import java.net.URLDecoder

fun main() {
    val text = "${e}"

    val encoded = URLEncoder.encode(text, "UTF-8")
    println("Encoded: $encoded")

    val decoded = URLDecoder.decode(encoded, "UTF-8")
    println("Decoded: $decoded")
}`,

        cpp: `#include <iostream>
#include <string>
#include <curl/curl.h>

int main() {
    std::string text = "${e}";

    CURL *curl = curl_easy_init();
    char *encoded = curl_easy_escape(curl, text.c_str(), text.length());
    std::cout << "Encoded: " << encoded << std::endl;

    int decodedLen;
    char *decoded = curl_easy_unescape(curl, encoded, 0, &decodedLen);
    std::cout << "Decoded: " << decoded << std::endl;

    curl_free(encoded);
    curl_free(decoded);
    curl_easy_cleanup(curl);
    return 0;
}`
    }[lang];
},

// ===== JWT =====
jwt: (lang) => {
    const token = document.getElementById('jwt-input').value || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    const e = esc(token);
    return {
        python: `import jwt  # pip install PyJWT
import json
import base64

token = "${e}"

# Decode without verification
decoded = jwt.decode(token, options={"verify_signature": False})
print(json.dumps(decoded, indent=2))

# Decode header
header = jwt.get_unverified_header(token)
print(json.dumps(header, indent=2))

# Manual decode (no library)
parts = token.split(".")
header_b64 = parts[0] + "=" * (4 - len(parts[0]) % 4)
payload_b64 = parts[1] + "=" * (4 - len(parts[1]) % 4)
header = json.loads(base64.urlsafe_b64decode(header_b64))
payload = json.loads(base64.urlsafe_b64decode(payload_b64))
print(header, payload)`,

        javascript: `const token = "${e}";

// Decode JWT (no verification)
function decodeJWT(token) {
  const parts = token.split(".");
  const header = JSON.parse(atob(parts[0].replace(/-/g,"+").replace(/_/g,"/")));
  const payload = JSON.parse(atob(parts[1].replace(/-/g,"+").replace(/_/g,"/")));
  return { header, payload };
}

const { header, payload } = decodeJWT(token);
console.log("Header:", JSON.stringify(header, null, 2));
console.log("Payload:", JSON.stringify(payload, null, 2));`,

        typescript: `const token: string = "${e}";

interface JWTDecoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
}

function decodeJWT(token: string): JWTDecoded {
  const parts = token.split(".");
  const header = JSON.parse(atob(parts[0].replace(/-/g,"+").replace(/_/g,"/")));
  const payload = JSON.parse(atob(parts[1].replace(/-/g,"+").replace(/_/g,"/")));
  return { header, payload };
}

const { header, payload } = decodeJWT(token);
console.log("Header:", JSON.stringify(header, null, 2));
console.log("Payload:", JSON.stringify(payload, null, 2));`,

        java: `// Using io.jsonwebtoken (jjwt)
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import java.util.Base64;

public class JwtDecode {
    public static void main(String[] args) {
        String token = "${e}";

        // Manual decode (no verification)
        String[] parts = token.split("\\\\.");
        String header = new String(Base64.getUrlDecoder().decode(parts[0]));
        String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
        System.out.println("Header: " + header);
        System.out.println("Payload: " + payload);
    }
}`,

        csharp: `using System;
using System.Text;
using System.Text.Json;

string token = "${e}";

string[] parts = token.Split('.');
string header = Encoding.UTF8.GetString(Convert.FromBase64String(PadBase64(parts[0])));
string payload = Encoding.UTF8.GetString(Convert.FromBase64String(PadBase64(parts[1])));

Console.WriteLine($"Header: {JsonSerializer.Serialize(JsonDocument.Parse(header), new JsonSerializerOptions { WriteIndented = true })}");
Console.WriteLine($"Payload: {JsonSerializer.Serialize(JsonDocument.Parse(payload), new JsonSerializerOptions { WriteIndented = true })}");

static string PadBase64(string s) => s.Replace('-', '+').Replace('_', '/').PadRight(s.Length + (4 - s.Length % 4) % 4, '=');`,

        php: `<?php
$token = '${escSingle(token)}';

$parts = explode('.', $token);
$header = json_decode(base64_decode(strtr($parts[0], '-_', '+/')), true);
$payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);

echo "Header: " . json_encode($header, JSON_PRETTY_PRINT) . "\\n";
echo "Payload: " . json_encode($payload, JSON_PRETTY_PRINT) . "\\n";`,

        go: `package main

import (
\t"encoding/base64"
\t"encoding/json"
\t"fmt"
\t"strings"
)

func main() {
\ttoken := "${e}"
\tparts := strings.Split(token, ".")

\theader, _ := base64.RawURLEncoding.DecodeString(parts[0])
\tpayload, _ := base64.RawURLEncoding.DecodeString(parts[1])

\tvar h, p map[string]interface{}
\tjson.Unmarshal(header, &h)
\tjson.Unmarshal(payload, &p)

\thJSON, _ := json.MarshalIndent(h, "", "  ")
\tpJSON, _ := json.MarshalIndent(p, "", "  ")
\tfmt.Println("Header:", string(hJSON))
\tfmt.Println("Payload:", string(pJSON))
}`,

        ruby: `require 'base64'
require 'json'

token = '${escSingle(token)}'

parts = token.split('.')
header = JSON.parse(Base64.urlsafe_decode64(parts[0] + '=='))
payload = JSON.parse(Base64.urlsafe_decode64(parts[1] + '=='))

puts "Header: #{JSON.pretty_generate(header)}"
puts "Payload: #{JSON.pretty_generate(payload)}"`,

        rust: `use base64::{Engine, engine::general_purpose};
use serde_json::Value;

fn main() {
    let token = "${e}";
    let parts: Vec<&str> = token.split('.').collect();

    let header = general_purpose::URL_SAFE_NO_PAD.decode(parts[0]).unwrap();
    let payload = general_purpose::URL_SAFE_NO_PAD.decode(parts[1]).unwrap();

    let h: Value = serde_json::from_slice(&header).unwrap();
    let p: Value = serde_json::from_slice(&payload).unwrap();

    println!("Header: {}", serde_json::to_string_pretty(&h).unwrap());
    println!("Payload: {}", serde_json::to_string_pretty(&p).unwrap());
}`,

        swift: `import Foundation

let token = "${e}"
let parts = token.split(separator: ".").map(String.init)

func decodeJWTPart(_ part: String) -> [String: Any]? {
    var base64 = part.replacingOccurrences(of: "-", with: "+").replacingOccurrences(of: "_", with: "/")
    while base64.count % 4 != 0 { base64 += "=" }
    guard let data = Data(base64Encoded: base64) else { return nil }
    return try? JSONSerialization.jsonObject(with: data) as? [String: Any]
}

if let header = decodeJWTPart(parts[0]) { print("Header:", header) }
if let payload = decodeJWTPart(parts[1]) { print("Payload:", payload) }`,

        kotlin: `import java.util.Base64
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement

fun main() {
    val token = "${e}"
    val parts = token.split(".")

    val header = String(Base64.getUrlDecoder().decode(parts[0]))
    val payload = String(Base64.getUrlDecoder().decode(parts[1]))

    println("Header: $header")
    println("Payload: $payload")
}`,

        cpp: `#include <iostream>
#include <string>
#include <vector>
// Requires a base64 library

int main() {
    std::string token = "${e}";

    // Split by '.'
    std::vector<std::string> parts;
    size_t pos = 0;
    while ((pos = token.find('.')) != std::string::npos) {
        parts.push_back(token.substr(0, pos));
        token.erase(0, pos + 1);
    }
    parts.push_back(token);

    // Decode parts[0] (header) and parts[1] (payload) using base64url
    std::cout << "Use a base64url library to decode parts" << std::endl;
    return 0;
}`
    }[lang];
},

// ===== UUID =====
uuid: (lang) => {
    return {
        python: `import uuid

# Generate UUID v4
new_uuid = uuid.uuid4()
print(new_uuid)

# Generate multiple
for _ in range(5):
    print(uuid.uuid4())`,

        javascript: `// Generate UUID v4
const uuid = crypto.randomUUID();
console.log(uuid);

// Generate multiple
for (let i = 0; i < 5; i++) {
  console.log(crypto.randomUUID());
}`,

        typescript: `const uuid: string = crypto.randomUUID();
console.log(uuid);

const uuids: string[] = Array.from({ length: 5 }, () => crypto.randomUUID());
console.log(uuids);`,

        java: `import java.util.UUID;

public class UuidGen {
    public static void main(String[] args) {
        // Generate UUID v4
        UUID uuid = UUID.randomUUID();
        System.out.println(uuid);

        // Generate multiple
        for (int i = 0; i < 5; i++) {
            System.out.println(UUID.randomUUID());
        }
    }
}`,

        csharp: `using System;

// Generate UUID (GUID)
Guid uuid = Guid.NewGuid();
Console.WriteLine(uuid);

// Generate multiple
for (int i = 0; i < 5; i++)
    Console.WriteLine(Guid.NewGuid());`,

        php: `<?php
// Generate UUID v4
function uuid4() {
    $bytes = random_bytes(16);
    $bytes[6] = chr(ord($bytes[6]) & 0x0f | 0x40);
    $bytes[8] = chr(ord($bytes[8]) & 0x3f | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
}

echo uuid4() . "\\n";

// Generate multiple
for ($i = 0; $i < 5; $i++) {
    echo uuid4() . "\\n";
}`,

        go: `package main

import (
\t"fmt"
\t"github.com/google/uuid"
)

func main() {
\t// Generate UUID v4
\tid := uuid.New()
\tfmt.Println(id)

\t// Generate multiple
\tfor i := 0; i < 5; i++ {
\t\tfmt.Println(uuid.New())
\t}
}`,

        ruby: `require 'securerandom'

# Generate UUID v4
uuid = SecureRandom.uuid
puts uuid

# Generate multiple
5.times { puts SecureRandom.uuid }`,

        rust: `use uuid::Uuid;

fn main() {
    // Generate UUID v4
    let id = Uuid::new_v4();
    println!("{}", id);

    // Generate multiple
    for _ in 0..5 {
        println!("{}", Uuid::new_v4());
    }
}`,

        swift: `import Foundation

// Generate UUID
let uuid = UUID()
print(uuid.uuidString)

// Generate multiple
for _ in 0..<5 {
    print(UUID().uuidString)
}`,

        kotlin: `import java.util.UUID

fun main() {
    // Generate UUID v4
    val uuid = UUID.randomUUID()
    println(uuid)

    // Generate multiple
    repeat(5) { println(UUID.randomUUID()) }
}`,

        cpp: `#include <iostream>
#include <random>
#include <sstream>
#include <iomanip>

std::string generateUUID() {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(0, 255);

    unsigned char bytes[16];
    for (auto &b : bytes) b = dis(gen);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    std::stringstream ss;
    ss << std::hex << std::setfill('0');
    for (int i = 0; i < 16; i++) {
        if (i == 4 || i == 6 || i == 8 || i == 10) ss << '-';
        ss << std::setw(2) << (int)bytes[i];
    }
    return ss.str();
}

int main() {
    for (int i = 0; i < 5; i++)
        std::cout << generateUUID() << std::endl;
    return 0;
}`
    }[lang];
},

// ===== Hash =====
hash: (lang) => {
    const text = document.getElementById('hash-input').value || 'Hello World';
    const e = esc(text);
    return {
        python: `import hashlib

text = "${e}"

print("SHA-1:  ", hashlib.sha1(text.encode()).hexdigest())
print("SHA-256:", hashlib.sha256(text.encode()).hexdigest())
print("SHA-512:", hashlib.sha512(text.encode()).hexdigest())
print("MD5:    ", hashlib.md5(text.encode()).hexdigest())`,

        javascript: `async function hash(text, algo) {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const text = "${e}";
(async () => {
  console.log("SHA-1:  ", await hash(text, "SHA-1"));
  console.log("SHA-256:", await hash(text, "SHA-256"));
  console.log("SHA-512:", await hash(text, "SHA-512"));
})();`,

        typescript: `async function hash(text: string, algo: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const text: string = "${e}";
(async () => {
  console.log("SHA-256:", await hash(text, "SHA-256"));
})();`,

        java: `import java.security.MessageDigest;

public class HashGen {
    public static void main(String[] args) throws Exception {
        String text = "${e}";

        for (String algo : new String[]{"SHA-1", "SHA-256", "SHA-512", "MD5"}) {
            MessageDigest md = MessageDigest.getInstance(algo);
            byte[] hash = md.digest(text.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            System.out.println(algo + ": " + sb);
        }
    }
}`,

        csharp: `using System.Security.Cryptography;
using System.Text;

string text = "${e}";
byte[] bytes = Encoding.UTF8.GetBytes(text);

Console.WriteLine("SHA-256: " + Convert.ToHexString(SHA256.HashData(bytes)).ToLower());
Console.WriteLine("SHA-512: " + Convert.ToHexString(SHA512.HashData(bytes)).ToLower());
Console.WriteLine("MD5:     " + Convert.ToHexString(MD5.HashData(bytes)).ToLower());`,

        php: `<?php
$text = '${escSingle(text)}';

echo "SHA-1:   " . hash('sha1', $text) . "\\n";
echo "SHA-256: " . hash('sha256', $text) . "\\n";
echo "SHA-512: " . hash('sha512', $text) . "\\n";
echo "MD5:     " . md5($text) . "\\n";`,

        go: `package main

import (
\t"crypto/sha1"
\t"crypto/sha256"
\t"crypto/sha512"
\t"fmt"
)

func main() {
\ttext := "${e}"
\tfmt.Printf("SHA-1:   %x\\n", sha1.Sum([]byte(text)))
\tfmt.Printf("SHA-256: %x\\n", sha256.Sum256([]byte(text)))
\tfmt.Printf("SHA-512: %x\\n", sha512.Sum512([]byte(text)))
}`,

        ruby: `require 'digest'

text = '${escSingle(text)}'

puts "SHA-1:   #{Digest::SHA1.hexdigest(text)}"
puts "SHA-256: #{Digest::SHA256.hexdigest(text)}"
puts "SHA-512: #{Digest::SHA512.hexdigest(text)}"
puts "MD5:     #{Digest::MD5.hexdigest(text)}"`,

        rust: `use sha2::{Sha256, Sha512, Digest};

fn main() {
    let text = "${e}";

    let hash256 = Sha256::digest(text.as_bytes());
    println!("SHA-256: {:x}", hash256);

    let hash512 = Sha512::digest(text.as_bytes());
    println!("SHA-512: {:x}", hash512);
}`,

        swift: `import CryptoKit
import Foundation

let text = "${e}"
let data = Data(text.utf8)

let sha256 = SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
let sha512 = SHA512.hash(data: data).map { String(format: "%02x", $0) }.joined()

print("SHA-256: \\(sha256)")
print("SHA-512: \\(sha512)")`,

        kotlin: `import java.security.MessageDigest

fun hash(text: String, algo: String): String {
    val bytes = MessageDigest.getInstance(algo).digest(text.toByteArray())
    return bytes.joinToString("") { "%02x".format(it) }
}

fun main() {
    val text = "${e}"
    println("SHA-256: " + hash(text, "SHA-256"))
    println("SHA-512: " + hash(text, "SHA-512"))
    println("MD5:     " + hash(text, "MD5"))
}`,

        cpp: `#include <iostream>
#include <openssl/sha.h>
#include <iomanip>
#include <sstream>

std::string sha256(const std::string &input) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256((unsigned char*)input.c_str(), input.size(), hash);
    std::stringstream ss;
    for (int i = 0; i < SHA256_DIGEST_LENGTH; i++)
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
    return ss.str();
}

int main() {
    std::string text = "${e}";
    std::cout << "SHA-256: " << sha256(text) << std::endl;
    return 0;
}`
    }[lang];
},

// ===== Password =====
password: (lang) => {
    const len = document.getElementById('pw-length').value || '16';
    return {
        python: `import secrets
import string

length = ${len}
chars = string.ascii_letters + string.digits + string.punctuation
password = ''.join(secrets.choice(chars) for _ in range(length))
print(password)`,

        javascript: `const length = ${len};
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
const array = new Uint32Array(length);
crypto.getRandomValues(array);
const password = Array.from(array, x => chars[x % chars.length]).join("");
console.log(password);`,

        typescript: `const length: number = ${len};
const chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
const array = new Uint32Array(length);
crypto.getRandomValues(array);
const password: string = Array.from(array, x => chars[x % chars.length]).join("");
console.log(password);`,

        java: `import java.security.SecureRandom;

public class PasswordGen {
    public static void main(String[] args) {
        int length = ${len};
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++)
            sb.append(chars.charAt(random.nextInt(chars.length())));
        System.out.println(sb);
    }
}`,

        csharp: `using System.Security.Cryptography;

int length = ${len};
string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
string password = new string(Enumerable.Range(0, length)
    .Select(_ => chars[RandomNumberGenerator.GetInt32(chars.Length)]).ToArray());
Console.WriteLine(password);`,

        php: `<?php
$length = ${len};
$chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
$password = '';
for ($i = 0; $i < $length; $i++) {
    $password .= $chars[random_int(0, strlen($chars) - 1)];
}
echo $password;`,

        go: `package main

import (
\t"crypto/rand"
\t"fmt"
\t"math/big"
)

func main() {
\tlength := ${len}
\tchars := "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-="
\tpassword := make([]byte, length)
\tfor i := range password {
\t\tn, _ := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
\t\tpassword[i] = chars[n.Int64()]
\t}
\tfmt.Println(string(password))
}`,

        ruby: `require 'securerandom'

length = ${len}
chars = [*'a'..'z', *'A'..'Z', *'0'..'9', *'!@#$%^&*()_+-='.chars]
password = (0...length).map { chars[SecureRandom.random_number(chars.length)] }.join
puts password`,

        rust: `use rand::Rng;

fn main() {
    let length = ${len};
    let chars: Vec<char> = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=".chars().collect();
    let mut rng = rand::thread_rng();
    let password: String = (0..length).map(|_| chars[rng.gen_range(0..chars.len())]).collect();
    println!("{}", password);
}`,

        swift: `import Foundation

let length = ${len}
let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-="
let password = String((0..<length).map { _ in chars.randomElement()! })
print(password)`,

        kotlin: `import java.security.SecureRandom

fun main() {
    val length = ${len}
    val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#\$%^&*()_+-="
    val random = SecureRandom()
    val password = (1..length).map { chars[random.nextInt(chars.length)] }.joinToString("")
    println(password)
}`,

        cpp: `#include <iostream>
#include <random>
#include <string>

int main() {
    int length = ${len};
    std::string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(0, chars.size() - 1);
    std::string password(length, ' ');
    for (auto &c : password) c = chars[dis(gen)];
    std::cout << password << std::endl;
    return 0;
}`
    }[lang];
},

// ===== Regex =====
regex: (lang) => {
    const pattern = document.getElementById('regex-pattern').value || '(\\w+)@(\\w+)\\.(\\w+)';
    const flags = document.getElementById('regex-flags').value || 'g';
    const testStr = document.getElementById('regex-input').value || 'test@example.com';
    const eP = esc(pattern);
    const eT = esc(testStr);
    const hasG = flags.includes('g'), hasI = flags.includes('i'), hasM = flags.includes('m'), hasS = flags.includes('s');
    const pyF = [hasI&&'re.IGNORECASE',hasM&&'re.MULTILINE',hasS&&'re.DOTALL'].filter(Boolean).join(' | ');
    return {
        python: `import re\n\npattern = r"${pattern}"\ntext = "${eT}"\n${pyF?'flags = '+pyF+'\n':''}\n${hasG?`matches = re.findall(pattern, text${pyF?', flags':''})\nfor m in matches:\n    print(m)\n\nfor m in re.finditer(pattern, text${pyF?', flags':''}):\n    print(f"Match: {m.group()} at {m.start()}-{m.end()}")`:`match = re.search(pattern, text${pyF?', flags':''})\nif match:\n    print(f"Found: {match.group()}")`}\n\nresult = re.sub(pattern, "replacement", text${pyF?', flags':''})\nprint(result)`,
        javascript: `const pattern = /${pattern}/${flags};\nconst text = "${eT}";\n\n${hasG?'const matches = [...text.matchAll(pattern)];\nmatches.forEach(m => console.log(`Match: ${m[0]} at ${m.index}`));':'const match = text.match(pattern);\nif (match) console.log(`Found: ${match[0]}`);'}\n\nconsole.log(pattern.test(text));\nconsole.log(text.replace(pattern, "replacement"));`,
        typescript: `const pattern: RegExp = /${pattern}/${flags};\nconst text: string = "${eT}";\n\n${hasG?'const matches: RegExpMatchArray[] = [...text.matchAll(pattern)];\nmatches.forEach(m => console.log(`Match: ${m[0]}`));':'const match: RegExpMatchArray | null = text.match(pattern);\nif (match) console.log(`Found: ${match[0]}`);'}\n\nconst result: string = text.replace(pattern, "replacement");\nconsole.log(result);`,
        java: `import java.util.regex.*;\n\npublic class RegexExample {\n    public static void main(String[] args) {\n        Pattern pattern = Pattern.compile("${esc(pattern)}"${hasI?', Pattern.CASE_INSENSITIVE':''});\n        Matcher matcher = pattern.matcher("${eT}");\n        while (matcher.find())\n            System.out.println("Match: " + matcher.group() + " at " + matcher.start());\n        System.out.println(matcher.replaceAll("replacement"));\n    }\n}`,
        csharp: `using System.Text.RegularExpressions;\n\nvar regex = new Regex(@"${pattern.replace(/"/g,'""')}"${hasI?', RegexOptions.IgnoreCase':''});\nstring text = "${eT}";\n\nforeach (Match m in regex.Matches(text))\n    Console.WriteLine($"Match: {m.Value} at {m.Index}");\n\nConsole.WriteLine(regex.Replace(text, "replacement"));`,
        php: `<?php\n$pattern = '/${pattern.replace(/'/g,"\\'")}/${[hasI&&'i',hasM&&'m',hasS&&'s'].filter(Boolean).join('')}';\n$text = '${escSingle(testStr)}';\n\npreg_match_all($pattern, $text, $matches);\nforeach ($matches[0] as $m) echo "Match: $m\\n";\n\necho preg_replace($pattern, 'replacement', $text);`,
        go: `package main\n\nimport (\n\t"fmt"\n\t"regexp"\n)\n\nfunc main() {\n\tpattern := regexp.MustCompile(\`${hasI?'(?i)':''}${pattern.replace(/`/g,'`+"`"+`')}\`)\n\ttext := "${eT}"\n\n\tfor _, m := range pattern.FindAllString(text, -1) {\n\t\tfmt.Println("Match:", m)\n\t}\n\tfmt.Println(pattern.ReplaceAllString(text, "replacement"))\n}`,
        ruby: `text = "${eT}"\npattern = /${pattern}/${hasI?'i':''}\n\ntext.scan(pattern) { |m| puts "Match: #{m}" }\nputs text.gsub(pattern, "replacement")`,
        rust: `use regex::Regex;\n\nfn main() {\n    let re = Regex::new(r"${hasI?'(?i)':''}${pattern.replace(/"/g,'\\"')}").unwrap();\n    let text = "${eT}";\n\n    for m in re.find_iter(text) {\n        println!("Match: {} at {}-{}", m.as_str(), m.start(), m.end());\n    }\n    println!("{}", re.replace_all(text, "replacement"));\n}`,
        swift: `import Foundation\n\nlet text = "${eT}"\nlet regex = try NSRegularExpression(pattern: "${esc(pattern)}"${hasI?', options: [.caseInsensitive]':''})\nlet range = NSRange(text.startIndex..., in: text)\n\nfor match in regex.matches(in: text, range: range) {\n    if let r = Range(match.range, in: text) { print("Match: \\(text[r])") }\n}\nprint(regex.stringByReplacingMatches(in: text, range: range, withTemplate: "replacement"))`,
        kotlin: `fun main() {\n    val text = "${eT}"\n    val pattern = Regex("${esc(pattern)}"${hasI?', RegexOption.IGNORE_CASE':''})\n\n    pattern.findAll(text).forEach { println("Match: \${it.value} at \${it.range}") }\n    println(pattern.replace(text, "replacement"))\n}`,
        cpp: `#include <iostream>\n#include <regex>\n#include <string>\n\nint main() {\n    std::string text = "${eT}";\n    std::regex pattern("${esc(pattern)}"${hasI?', std::regex::icase':''});\n\n    for (auto it = std::sregex_iterator(text.begin(), text.end(), pattern); it != std::sregex_iterator(); ++it)\n        std::cout << "Match: " << it->str() << " at " << it->position() << std::endl;\n\n    std::cout << std::regex_replace(text, pattern, "replacement") << std::endl;\n    return 0;\n}`
    }[lang];
},

// ===== Timestamp =====
timestamp: (lang) => {
    const ts = document.getElementById('ts-unix').value || '1700000000';
    return {
        python: `from datetime import datetime

ts = ${ts}

# Timestamp to date
dt = datetime.fromtimestamp(ts)
print(dt.strftime("%Y-%m-%d %H:%M:%S"))
print(dt.isoformat())

# Current timestamp
import time
print(int(time.time()))

# Date to timestamp
from datetime import datetime
dt = datetime(2024, 1, 15, 12, 30, 0)
print(int(dt.timestamp()))`,

        javascript: `const ts = ${ts};

// Timestamp to date
const date = new Date(ts * 1000);
console.log(date.toISOString());
console.log(date.toLocaleString());

// Current timestamp
console.log(Math.floor(Date.now() / 1000));

// Date to timestamp
const d = new Date("2024-01-15T12:30:00");
console.log(Math.floor(d.getTime() / 1000));`,

        typescript: `const ts: number = ${ts};\n\nconst date: Date = new Date(ts * 1000);\nconsole.log(date.toISOString());\nconsole.log(Math.floor(Date.now() / 1000));`,

        java: `import java.time.*;\nimport java.time.format.DateTimeFormatter;\n\npublic class Timestamp {\n    public static void main(String[] args) {\n        long ts = ${ts}L;\n        Instant instant = Instant.ofEpochSecond(ts);\n        LocalDateTime dt = LocalDateTime.ofInstant(instant, ZoneId.systemDefault());\n        System.out.println(dt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));\n        System.out.println(Instant.now().getEpochSecond());\n    }\n}`,

        csharp: `using System;\n\nlong ts = ${ts};\nvar dt = DateTimeOffset.FromUnixTimeSeconds(ts).LocalDateTime;\nConsole.WriteLine(dt.ToString("yyyy-MM-dd HH:mm:ss"));\nConsole.WriteLine(DateTimeOffset.UtcNow.ToUnixTimeSeconds());`,

        php: `<?php\n$ts = ${ts};\necho date('Y-m-d H:i:s', $ts) . "\\n";\necho time() . "\\n";\necho strtotime('2024-01-15 12:30:00') . "\\n";`,

        go: `package main\n\nimport (\n\t"fmt"\n\t"time"\n)\n\nfunc main() {\n\tts := int64(${ts})\n\tt := time.Unix(ts, 0)\n\tfmt.Println(t.Format("2006-01-02 15:04:05"))\n\tfmt.Println(time.Now().Unix())\n}`,

        ruby: `ts = ${ts}\nputs Time.at(ts).strftime('%Y-%m-%d %H:%M:%S')\nputs Time.now.to_i`,

        rust: `use chrono::{DateTime, Utc, NaiveDateTime};\n\nfn main() {\n    let ts = ${ts}_i64;\n    let dt = DateTime::<Utc>::from_timestamp(ts, 0).unwrap();\n    println!("{}", dt.format("%Y-%m-%d %H:%M:%S"));\n    println!("{}", Utc::now().timestamp());\n}`,

        swift: `import Foundation\n\nlet ts = TimeInterval(${ts})\nlet date = Date(timeIntervalSince1970: ts)\nlet fmt = DateFormatter()\nfmt.dateFormat = "yyyy-MM-dd HH:mm:ss"\nprint(fmt.string(from: date))\nprint(Int(Date().timeIntervalSince1970))`,

        kotlin: `import java.time.*\n\nfun main() {\n    val ts = ${ts}L\n    val dt = LocalDateTime.ofInstant(Instant.ofEpochSecond(ts), ZoneId.systemDefault())\n    println(dt)\n    println(Instant.now().epochSecond)\n}`,

        cpp: `#include <iostream>\n#include <chrono>\n#include <ctime>\n\nint main() {\n    time_t ts = ${ts};\n    char buf[64];\n    strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", localtime(&ts));\n    std::cout << buf << std::endl;\n    std::cout << std::time(nullptr) << std::endl;\n    return 0;\n}`
    }[lang];
},

// ===== Number Base =====
number: (lang) => {
    const num = document.getElementById('num-dec').value || '255';
    return {
        python: `n = ${num}\nprint(f"Decimal: {n}")\nprint(f"Hex:     {hex(n)}")\nprint(f"Octal:   {oct(n)}")\nprint(f"Binary:  {bin(n)}")\n\n# Parse from different bases\nprint(int("FF", 16))   # from hex\nprint(int("377", 8))   # from octal\nprint(int("11111111", 2))  # from binary`,
        javascript: `const n = ${num};\nconsole.log("Decimal:", n);\nconsole.log("Hex:    ", n.toString(16).toUpperCase());\nconsole.log("Octal:  ", n.toString(8));\nconsole.log("Binary: ", n.toString(2));\n\n// Parse\nconsole.log(parseInt("FF", 16));\nconsole.log(parseInt("377", 8));\nconsole.log(parseInt("11111111", 2));`,
        typescript: `const n: number = ${num};\nconsole.log("Hex:", n.toString(16).toUpperCase());\nconsole.log("Oct:", n.toString(8));\nconsole.log("Bin:", n.toString(2));`,
        java: `public class NumberBase {\n    public static void main(String[] args) {\n        int n = ${num};\n        System.out.println("Hex:    " + Integer.toHexString(n).toUpperCase());\n        System.out.println("Octal:  " + Integer.toOctalString(n));\n        System.out.println("Binary: " + Integer.toBinaryString(n));\n        System.out.println(Integer.parseInt("FF", 16));\n    }\n}`,
        csharp: `int n = ${num};\nConsole.WriteLine($"Hex:    {n:X}");\nConsole.WriteLine($"Octal:  {Convert.ToString(n, 8)}");\nConsole.WriteLine($"Binary: {Convert.ToString(n, 2)}");\nConsole.WriteLine(Convert.ToInt32("FF", 16));`,
        php: `<?php\n$n = ${num};\necho "Hex:    " . dechex($n) . "\\n";\necho "Octal:  " . decoct($n) . "\\n";\necho "Binary: " . decbin($n) . "\\n";\necho hexdec("FF") . "\\n";`,
        go: `package main\n\nimport "fmt"\n\nfunc main() {\n\tn := ${num}\n\tfmt.Printf("Hex:    %X\\n", n)\n\tfmt.Printf("Octal:  %o\\n", n)\n\tfmt.Printf("Binary: %b\\n", n)\n}`,
        ruby: `n = ${num}\nputs "Hex:    #{n.to_s(16).upcase}"\nputs "Octal:  #{n.to_s(8)}"\nputs "Binary: #{n.to_s(2)}"`,
        rust: `fn main() {\n    let n = ${num};\n    println!("Hex:    {:X}", n);\n    println!("Octal:  {:o}", n);\n    println!("Binary: {:b}", n);\n    println!("{}", i64::from_str_radix("FF", 16).unwrap());\n}`,
        swift: `let n = ${num}\nprint("Hex:   ", String(n, radix: 16, uppercase: true))\nprint("Octal: ", String(n, radix: 8))\nprint("Binary:", String(n, radix: 2))`,
        kotlin: `fun main() {\n    val n = ${num}\n    println("Hex:    " + n.toString(16).uppercase())\n    println("Octal:  " + n.toString(8))\n    println("Binary: " + n.toString(2))\n}`,
        cpp: `#include <iostream>\n#include <bitset>\n\nint main() {\n    int n = ${num};\n    std::cout << "Hex:    " << std::hex << n << std::endl;\n    std::cout << "Octal:  " << std::oct << n << std::endl;\n    std::cout << "Binary: " << std::bitset<32>(n) << std::endl;\n    return 0;\n}`
    }[lang];
},

// ===== Case Converter =====
'case': (lang) => {
    const text = document.getElementById('case-input').value || 'hello world example';
    const e = esc(text);
    return {
        python: `text = "${e}"\n\nprint(text.upper())          # UPPER\nprint(text.lower())          # lower\nprint(text.title())          # Title Case\nprint(text.capitalize())     # Sentence case\n\n# snake_case / camelCase\nimport re\nwords = re.split(r'[\\s_-]+', text)\nprint('_'.join(w.lower() for w in words))  # snake_case\nprint(words[0].lower() + ''.join(w.capitalize() for w in words[1:]))  # camelCase`,
        javascript: `const text = "${e}";\n\nconsole.log(text.toUpperCase());\nconsole.log(text.toLowerCase());\nconsole.log(text.replace(/\\b\\w/g, c => c.toUpperCase())); // Title\n\nconst words = text.split(/[\\s_-]+/);\nconsole.log(words.map(w => w.toLowerCase()).join("_")); // snake_case\nconsole.log(words[0].toLowerCase() + words.slice(1).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join("")); // camelCase`,
        typescript: `const text: string = "${e}";\nconsole.log(text.toUpperCase());\nconsole.log(text.toLowerCase());\nconst words = text.split(/[\\s_-]+/);\nconsole.log(words.map(w => w.toLowerCase()).join("_"));`,
        java: `public class CaseConvert {\n    public static void main(String[] args) {\n        String text = "${e}";\n        System.out.println(text.toUpperCase());\n        System.out.println(text.toLowerCase());\n        // Title Case\n        String[] words = text.split("[\\\\s_-]+");\n        StringBuilder title = new StringBuilder();\n        for (String w : words)\n            title.append(w.substring(0,1).toUpperCase()).append(w.substring(1).toLowerCase()).append(" ");\n        System.out.println(title.toString().trim());\n    }\n}`,
        csharp: `using System.Globalization;\n\nstring text = "${e}";\nConsole.WriteLine(text.ToUpper());\nConsole.WriteLine(text.ToLower());\nConsole.WriteLine(CultureInfo.CurrentCulture.TextInfo.ToTitleCase(text));`,
        php: `<?php\n$text = '${escSingle(text)}';\necho strtoupper($text) . "\\n";\necho strtolower($text) . "\\n";\necho ucwords($text) . "\\n";`,
        go: `package main\n\nimport (\n\t"fmt"\n\t"strings"\n\t"golang.org/x/text/cases"\n\t"golang.org/x/text/language"\n)\n\nfunc main() {\n\ttext := "${e}"\n\tfmt.Println(strings.ToUpper(text))\n\tfmt.Println(strings.ToLower(text))\n\tfmt.Println(cases.Title(language.English).String(text))\n}`,
        ruby: `text = '${escSingle(text)}'\nputs text.upcase\nputs text.downcase\nputs text.split.map(&:capitalize).join(' ')`,
        rust: `fn main() {\n    let text = "${e}";\n    println!("{}", text.to_uppercase());\n    println!("{}", text.to_lowercase());\n}`,
        swift: `let text = "${e}"\nprint(text.uppercased())\nprint(text.lowercased())\nprint(text.capitalized)`,
        kotlin: `fun main() {\n    val text = "${e}"\n    println(text.uppercase())\n    println(text.lowercase())\n    println(text.split(" ").joinToString(" ") { it.replaceFirstChar { c -> c.uppercase() } })\n}`,
        cpp: `#include <iostream>\n#include <string>\n#include <algorithm>\n\nint main() {\n    std::string text = "${e}";\n    std::string upper = text, lower = text;\n    std::transform(upper.begin(), upper.end(), upper.begin(), ::toupper);\n    std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);\n    std::cout << upper << std::endl;\n    std::cout << lower << std::endl;\n    return 0;\n}`
    }[lang];
},

// ===== SQL =====
sql: (lang) => {
    const query = document.getElementById('sql-input').value || 'SELECT * FROM users WHERE id = 1';
    const e = esc(query);
    return {
        python: `import sqlite3\n\nconn = sqlite3.connect("database.db")\ncursor = conn.cursor()\n\nquery = "${e}"\ncursor.execute(query)\nrows = cursor.fetchall()\n\nfor row in rows:\n    print(row)\n\nconn.close()`,
        javascript: `// Node.js with better-sqlite3\nconst Database = require("better-sqlite3");\nconst db = new Database("database.db");\n\nconst query = "${e}";\nconst rows = db.prepare(query).all();\nconsole.log(rows);\n\ndb.close();`,
        typescript: `import Database from "better-sqlite3";\n\nconst db = new Database("database.db");\nconst query: string = "${e}";\nconst rows = db.prepare(query).all();\nconsole.log(rows);\ndb.close();`,
        java: `import java.sql.*;\n\npublic class SqlExample {\n    public static void main(String[] args) throws Exception {\n        Connection conn = DriverManager.getConnection("jdbc:sqlite:database.db");\n        Statement stmt = conn.createStatement();\n        ResultSet rs = stmt.executeQuery("${e}");\n        ResultSetMetaData meta = rs.getMetaData();\n        while (rs.next()) {\n            for (int i = 1; i <= meta.getColumnCount(); i++)\n                System.out.print(rs.getString(i) + "\\t");\n            System.out.println();\n        }\n        conn.close();\n    }\n}`,
        csharp: `using Microsoft.Data.Sqlite;\n\nusing var conn = new SqliteConnection("Data Source=database.db");\nconn.Open();\nvar cmd = conn.CreateCommand();\ncmd.CommandText = @"${query.replace(/"/g,'""')}";\nusing var reader = cmd.ExecuteReader();\nwhile (reader.Read())\n    Console.WriteLine(reader.GetString(0));`,
        php: `<?php\n$db = new PDO('sqlite:database.db');\n$stmt = $db->query('${escSingle(query)}');\nwhile ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {\n    print_r($row);\n}`,
        go: `package main\n\nimport (\n\t"database/sql"\n\t"fmt"\n\t_ "github.com/mattn/go-sqlite3"\n)\n\nfunc main() {\n\tdb, _ := sql.Open("sqlite3", "database.db")\n\tdefer db.Close()\n\n\trows, _ := db.Query("${e}")\n\tdefer rows.Close()\n\n\tcols, _ := rows.Columns()\n\tfor rows.Next() {\n\t\tvals := make([]interface{}, len(cols))\n\t\tptrs := make([]interface{}, len(cols))\n\t\tfor i := range vals { ptrs[i] = &vals[i] }\n\t\trows.Scan(ptrs...)\n\t\tfmt.Println(vals)\n\t}\n}`,
        ruby: `require 'sqlite3'\n\ndb = SQLite3::Database.new('database.db')\nrows = db.execute('${escSingle(query)}')\nrows.each { |row| puts row.inspect }\ndb.close`,
        rust: `use rusqlite::Connection;\n\nfn main() {\n    let conn = Connection::open("database.db").unwrap();\n    let mut stmt = conn.prepare("${e}").unwrap();\n    let rows = stmt.query_map([], |row| {\n        Ok(row.get::<_, String>(0)?)\n    }).unwrap();\n    for row in rows {\n        println!("{}", row.unwrap());\n    }\n}`,
        swift: `import SQLite3\n\nvar db: OpaquePointer?\nsqlite3_open("database.db", &db)\n\nvar stmt: OpaquePointer?\nsqlite3_prepare_v2(db, "${e}", -1, &stmt, nil)\n\nwhile sqlite3_step(stmt) == SQLITE_ROW {\n    let col = String(cString: sqlite3_column_text(stmt, 0))\n    print(col)\n}\n\nsqlite3_finalize(stmt)\nsqlite3_close(db)`,
        kotlin: `import java.sql.DriverManager\n\nfun main() {\n    val conn = DriverManager.getConnection("jdbc:sqlite:database.db")\n    val rs = conn.createStatement().executeQuery("${e}")\n    val meta = rs.metaData\n    while (rs.next()) {\n        (1..meta.columnCount).forEach { print(rs.getString(it) + "\\t") }\n        println()\n    }\n    conn.close()\n}`,
        cpp: `#include <iostream>\n#include <sqlite3.h>\n\nint main() {\n    sqlite3 *db;\n    sqlite3_open("database.db", &db);\n\n    sqlite3_stmt *stmt;\n    sqlite3_prepare_v2(db, "${e}", -1, &stmt, nullptr);\n\n    while (sqlite3_step(stmt) == SQLITE_ROW) {\n        std::cout << sqlite3_column_text(stmt, 0) << std::endl;\n    }\n\n    sqlite3_finalize(stmt);\n    sqlite3_close(db);\n    return 0;\n}`
    }[lang];
},

// ===== YAML =====
yaml: (lang) => {
    const yamlText = document.getElementById('yaml-input').value || 'name: BuildBox\nversion: 1.0';
    const e = esc(yamlText);
    return {
        python: `import yaml\nimport json\n\nyaml_str = """${yamlText.replace(/"/g,'\\"')}"""\n\n# YAML to dict\ndata = yaml.safe_load(yaml_str)\nprint(data)\n\n# YAML to JSON\nprint(json.dumps(data, indent=2))\n\n# Dict to YAML\nprint(yaml.dump(data, default_flow_style=False))`,
        javascript: `// npm install js-yaml\nconst yaml = require("js-yaml");\n\nconst yamlStr = \`${yamlText.replace(/`/g,'\\`')}\`;\n\n// YAML to JSON\nconst data = yaml.load(yamlStr);\nconsole.log(JSON.stringify(data, null, 2));\n\n// JSON to YAML\nconsole.log(yaml.dump(data));`,
        typescript: `import * as yaml from "js-yaml";\n\nconst yamlStr: string = \`${yamlText.replace(/`/g,'\\`')}\`;\nconst data = yaml.load(yamlStr) as Record<string, unknown>;\nconsole.log(JSON.stringify(data, null, 2));\nconsole.log(yaml.dump(data));`,
        java: `// Using SnakeYAML\nimport org.yaml.snakeyaml.Yaml;\nimport com.google.gson.GsonBuilder;\n\nYaml yaml = new Yaml();\nObject data = yaml.load("${e}");\nString json = new GsonBuilder().setPrettyPrinting().create().toJson(data);\nSystem.out.println(json);`,
        csharp: `// Using YamlDotNet\nusing YamlDotNet.Serialization;\n\nvar yaml = @"${yamlText.replace(/"/g,'""')}";\nvar deserializer = new DeserializerBuilder().Build();\nvar data = deserializer.Deserialize<object>(yaml);\n\nvar json = System.Text.Json.JsonSerializer.Serialize(data, new() { WriteIndented = true });\nConsole.WriteLine(json);`,
        php: `<?php\n// composer require symfony/yaml\nuse Symfony\\Component\\Yaml\\Yaml;\n\n$yamlStr = '${escSingle(yamlText)}';\n$data = Yaml::parse($yamlStr);\necho json_encode($data, JSON_PRETTY_PRINT) . "\\n";\necho Yaml::dump($data);`,
        go: `package main\n\nimport (\n\t"encoding/json"\n\t"fmt"\n\t"gopkg.in/yaml.v3"\n)\n\nfunc main() {\n\tyamlStr := \`${yamlText.replace(/`/g,'` + "`" + `')}\`\n\n\tvar data interface{}\n\tyaml.Unmarshal([]byte(yamlStr), &data)\n\n\tjsonBytes, _ := json.MarshalIndent(data, "", "  ")\n\tfmt.Println(string(jsonBytes))\n}`,
        ruby: `require 'yaml'\nrequire 'json'\n\nyaml_str = <<~YAML\n${yamlText}\nYAML\n\ndata = YAML.safe_load(yaml_str)\nputs JSON.pretty_generate(data)\nputs data.to_yaml`,
        rust: `use serde_yaml;\nuse serde_json;\n\nfn main() {\n    let yaml_str = r#"${yamlText.replace(/"/g,'\\"')}"#;\n    let data: serde_yaml::Value = serde_yaml::from_str(yaml_str).unwrap();\n    let json = serde_json::to_string_pretty(&data).unwrap();\n    println!("{}", json);\n}`,
        swift: `// Using Yams library\nimport Yams\nimport Foundation\n\nlet yamlStr = "${e}"\nlet data = try Yams.load(yaml: yamlStr)\nprint(data ?? "nil")`,
        kotlin: `// Using kaml or snakeyaml-engine\nimport org.yaml.snakeyaml.Yaml\nimport com.google.gson.GsonBuilder\n\nfun main() {\n    val yaml = Yaml()\n    val data = yaml.load<Any>("${e}")\n    println(GsonBuilder().setPrettyPrinting().create().toJson(data))\n}`,
        cpp: `// Using yaml-cpp\n#include <iostream>\n#include <yaml-cpp/yaml.h>\n\nint main() {\n    YAML::Node node = YAML::Load("${e}");\n    std::cout << node << std::endl;\n    return 0;\n}`
    }[lang];
}

,
// ========== Commit Message Code Generator ==========
commit: (lang) => {
    const type = document.getElementById('commit-type').value;
    const scope = document.getElementById('commit-scope').value;
    const desc = document.getElementById('commit-desc').value || 'add new feature';
    const msg = scope ? `${type}(${scope}): ${desc}` : `${type}: ${desc}`;
    const e = msg.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n');
    return {
        python: `import subprocess\n\nmsg = "${e}"\nsubprocess.run(["git", "commit", "-m", msg])`,
        javascript: `const { execSync } = require('child_process');\n\nconst msg = "${e}";\nexecSync(\`git commit -m "\${msg}"\`);`,
        typescript: `import { execSync } from 'child_process';\n\nconst msg: string = "${e}";\nexecSync(\`git commit -m "\${msg}"\`);`,
        java: `import java.io.*;\n\npublic class GitCommit {\n    public static void main(String[] args) throws Exception {\n        String msg = "${e}";\n        new ProcessBuilder("git", "commit", "-m", msg).inheritIO().start().waitFor();\n    }\n}`,
        csharp: `using System.Diagnostics;\n\nvar msg = "${e}";\nProcess.Start("git", $"commit -m \\"{msg}\\"").WaitForExit();`,
        php: `<?php\n$msg = "${e}";\nexec("git commit -m " . escapeshellarg($msg));`,
        go: `package main\n\nimport "os/exec"\n\nfunc main() {\n\tmsg := "${e}"\n\tcmd := exec.Command("git", "commit", "-m", msg)\n\tcmd.Run()\n}`,
        ruby: `msg = "${e}"\nsystem("git", "commit", "-m", msg)`,
        rust: `use std::process::Command;\n\nfn main() {\n    let msg = "${e}";\n    Command::new("git").args(&["commit", "-m", msg]).status().unwrap();\n}`,
        swift: `import Foundation\n\nlet msg = "${e}"\nlet process = Process()\nprocess.executableURL = URL(fileURLWithPath: "/usr/bin/git")\nprocess.arguments = ["commit", "-m", msg]\ntry process.run()`,
        kotlin: `fun main() {\n    val msg = "${e}"\n    ProcessBuilder("git", "commit", "-m", msg).inheritIO().start().waitFor()\n}`,
        cpp: `#include <cstdlib>\n#include <string>\n\nint main() {\n    std::string msg = "${e}";\n    std::string cmd = "git commit -m \\"" + msg + "\\"";\n    system(cmd.c_str());\n}`
    }[lang];
},
// ========== Mock Data Code Generator ==========
mockdata: (lang) => {
    const count = document.getElementById('mock-count')?.value || '5';
    return {
        python: `import random\nimport string\nimport json\nfrom datetime import datetime, timedelta\n\ndef fake_name():\n    first = random.choice(["Alice","Bob","Charlie","Diana","Eve","Frank"])\n    last = random.choice(["Smith","Johnson","Williams","Brown","Jones"])\n    return f"{first} {last}"\n\ndef fake_email(name):\n    domain = random.choice(["gmail.com","yahoo.com","outlook.com"])\n    return name.lower().replace(" ", ".") + "@" + domain\n\ndata = []\nfor i in range(${count}):\n    name = fake_name()\n    data.append({"id": i+1, "name": name, "email": fake_email(name)})\n\nprint(json.dumps(data, indent=2))`,
        javascript: `function generateMock(count = ${count}) {\n  const names = ["Alice","Bob","Charlie","Diana","Eve","Frank"];\n  const domains = ["gmail.com","yahoo.com","outlook.com"];\n  return Array.from({length: count}, (_, i) => {\n    const name = names[Math.floor(Math.random()*names.length)];\n    return { id: i+1, name, email: name.toLowerCase()+"@"+domains[Math.floor(Math.random()*domains.length)] };\n  });\n}\nconsole.log(JSON.stringify(generateMock(), null, 2));`,
        typescript: `interface MockUser {\n  id: number;\n  name: string;\n  email: string;\n}\n\nfunction generateMock(count: number = ${count}): MockUser[] {\n  const names = ["Alice","Bob","Charlie","Diana","Eve"];\n  return Array.from({length: count}, (_, i) => ({\n    id: i+1,\n    name: names[i % names.length],\n    email: names[i % names.length].toLowerCase() + "@test.com"\n  }));\n}\nconsole.log(JSON.stringify(generateMock(), null, 2));`,
        java: `import java.util.*;\nimport java.util.stream.*;\n\npublic class MockData {\n    static String[] names = {"Alice","Bob","Charlie","Diana","Eve"};\n    public static void main(String[] args) {\n        for (int i = 0; i < ${count}; i++) {\n            String name = names[i % names.length];\n            System.out.printf("{\\"id\\": %d, \\"name\\": \\"%s\\", \\"email\\": \\"%s@test.com\\"}%n", i+1, name, name.toLowerCase());\n        }\n    }\n}`,
        csharp: `using System;\nusing System.Collections.Generic;\n\nvar names = new[] {"Alice","Bob","Charlie","Diana","Eve"};\nvar data = Enumerable.Range(1, ${count}).Select(i => new {\n    id = i, name = names[(i-1) % names.Length],\n    email = names[(i-1) % names.Length].ToLower() + "@test.com"\n});\nConsole.WriteLine(System.Text.Json.JsonSerializer.Serialize(data, new() { WriteIndented = true }));`,
        php: `<?php\n$names = ["Alice","Bob","Charlie","Diana","Eve"];\n$data = [];\nfor ($i = 0; $i < ${count}; $i++) {\n    $name = $names[$i % count($names)];\n    $data[] = ["id" => $i+1, "name" => $name, "email" => strtolower($name)."@test.com"];\n}\necho json_encode($data, JSON_PRETTY_PRINT);`,
        go: `package main\n\nimport (\n\t"encoding/json"\n\t"fmt"\n)\n\ntype User struct {\n\tID    int    \`json:"id"\`\n\tName  string \`json:"name"\`\n\tEmail string \`json:"email"\`\n}\n\nfunc main() {\n\tnames := []string{"Alice","Bob","Charlie","Diana","Eve"}\n\tusers := make([]User, ${count})\n\tfor i := range users {\n\t\tn := names[i%len(names)]\n\t\tusers[i] = User{i+1, n, n + "@test.com"}\n\t}\n\tb, _ := json.MarshalIndent(users, "", "  ")\n\tfmt.Println(string(b))\n}`,
        ruby: `names = %w[Alice Bob Charlie Diana Eve]\ndata = (1..${count}).map { |i| { id: i, name: names[(i-1) % names.size], email: "\#{names[(i-1) % names.size].downcase}@test.com" } }\nrequire 'json'\nputs JSON.pretty_generate(data)`,
        rust: `use serde::Serialize;\n\n#[derive(Serialize)]\nstruct User { id: u32, name: String, email: String }\n\nfn main() {\n    let names = vec!["Alice","Bob","Charlie","Diana","Eve"];\n    let users: Vec<User> = (0..${count}).map(|i| User {\n        id: i+1, name: names[i as usize % names.len()].into(),\n        email: format!("{}@test.com", names[i as usize % names.len()].to_lowercase())\n    }).collect();\n    println!("{}", serde_json::to_string_pretty(&users).unwrap());\n}`,
        swift: `struct User: Codable { let id: Int; let name: String; let email: String }\nlet names = ["Alice","Bob","Charlie","Diana","Eve"]\nlet users = (0..<${count}).map { i in User(id: i+1, name: names[i % names.count], email: "\\(names[i % names.count].lowercased())@test.com") }\nlet data = try JSONEncoder().encode(users)\nprint(String(data: data, encoding: .utf8)!)`,
        kotlin: `data class User(val id: Int, val name: String, val email: String)\nfun main() {\n    val names = listOf("Alice","Bob","Charlie","Diana","Eve")\n    val users = (1..${count}).map { User(it, names[(it-1) % names.size], "\${names[(it-1) % names.size].lowercase()}@test.com") }\n    println(users)\n}`,
        cpp: `#include <iostream>\n#include <vector>\n#include <string>\n\nint main() {\n    std::vector<std::string> names = {"Alice","Bob","Charlie","Diana","Eve"};\n    std::cout << "[\\n";\n    for (int i = 0; i < ${count}; i++) {\n        auto& n = names[i % names.size()];\n        std::cout << "  {\\"id\\": " << i+1 << ", \\"name\\": \\"" << n << "\\"}\\n";\n    }\n    std::cout << "]\\n";\n}`
    }[lang];
},
// ========== GitHub Actions Code Generator ==========
ghactions: (lang) => {
    const name = document.getElementById('gha-name')?.value || 'CI';
    return {
        python: `# Python script to generate GitHub Actions YAML\nimport yaml\n\nworkflow = {\n    'name': '${name}',\n    'on': {'push': {'branches': ['main']}, 'pull_request': {'branches': ['main']}},\n    'jobs': {'build': {\n        'runs-on': 'ubuntu-latest',\n        'steps': [\n            {'uses': 'actions/checkout@v4'},\n            {'name': 'Set up Python', 'uses': 'actions/setup-python@v5', 'with': {'python-version': '3.x'}},\n            {'run': 'pip install -r requirements.txt'},\n            {'run': 'pytest'}\n        ]\n    }}\n}\nprint(yaml.dump(workflow, default_flow_style=False))`,
        javascript: `// Node.js script to generate GitHub Actions YAML\nconst yaml = require('js-yaml');\n\nconst workflow = {\n  name: '${name}',\n  on: { push: { branches: ['main'] }, pull_request: { branches: ['main'] } },\n  jobs: { build: {\n    'runs-on': 'ubuntu-latest',\n    steps: [\n      { uses: 'actions/checkout@v4' },\n      { uses: 'actions/setup-node@v4', with: { 'node-version': '20' } },\n      { run: 'npm ci' },\n      { run: 'npm test' }\n    ]\n  }}\n};\nconsole.log(yaml.dump(workflow));`,
        typescript: `import * as yaml from 'js-yaml';\n\ninterface Workflow { name: string; on: Record<string,any>; jobs: Record<string,any>; }\nconst workflow: Workflow = {\n  name: '${name}',\n  on: { push: { branches: ['main'] } },\n  jobs: { build: { 'runs-on': 'ubuntu-latest', steps: [{ uses: 'actions/checkout@v4' }, { run: 'npm test' }] } }\n};\nconsole.log(yaml.dump(workflow));`,
        java: `// Use snakeyaml to generate YAML\nimport org.yaml.snakeyaml.Yaml;\nimport java.util.*;\n\npublic class GenWorkflow {\n    public static void main(String[] args) {\n        Map<String,Object> wf = new LinkedHashMap<>();\n        wf.put("name", "${name}");\n        wf.put("on", Map.of("push", Map.of("branches", List.of("main"))));\n        System.out.println(new Yaml().dump(wf));\n    }\n}`,
        csharp: `// Use YamlDotNet\nvar workflow = new { name = "${name}", on = new { push = new { branches = new[]{"main"} } } };\nvar serializer = new YamlDotNet.Serialization.SerializerBuilder().Build();\nConsole.WriteLine(serializer.Serialize(workflow));`,
        php: `<?php\n$workflow = ['name' => '${name}', 'on' => ['push' => ['branches' => ['main']]],\n  'jobs' => ['build' => ['runs-on' => 'ubuntu-latest', 'steps' => [['uses' => 'actions/checkout@v4']]]]];\necho yaml_emit($workflow);`,
        go: `package main\n\nimport (\n\t"fmt"\n\t"gopkg.in/yaml.v3"\n)\n\nfunc main() {\n\twf := map[string]interface{}{"name": "${name}", "on": map[string]interface{}{"push": map[string]interface{}{"branches": []string{"main"}}}}\n\tb, _ := yaml.Marshal(wf)\n\tfmt.Println(string(b))\n}`,
        ruby: `require 'yaml'\nworkflow = { 'name' => '${name}', 'on' => { 'push' => { 'branches' => ['main'] } },\n  'jobs' => { 'build' => { 'runs-on' => 'ubuntu-latest', 'steps' => [{ 'uses' => 'actions/checkout@v4' }] } } }\nputs workflow.to_yaml`,
        rust: `use serde_yaml;\nuse std::collections::BTreeMap;\n\nfn main() {\n    let mut wf = BTreeMap::new();\n    wf.insert("name", serde_yaml::Value::String("${name}".into()));\n    println!("{}", serde_yaml::to_string(&wf).unwrap());\n}`,
        swift: `import Foundation\nlet wf: [String: Any] = ["name": "${name}", "on": ["push": ["branches": ["main"]]]]\nprint(wf)`,
        kotlin: `fun main() {\n    val yaml = \"\"\"\n    name: ${name}\n    on:\n      push:\n        branches: [main]\n    jobs:\n      build:\n        runs-on: ubuntu-latest\n        steps:\n          - uses: actions/checkout@v4\n    \"\"\".trimIndent()\n    println(yaml)\n}`,
        cpp: `#include <iostream>\n\nint main() {\n    std::cout << "name: ${name}\\n"\n              << "on:\\n  push:\\n    branches: [main]\\n"\n              << "jobs:\\n  build:\\n    runs-on: ubuntu-latest\\n";\n}`
    }[lang];
},
// ========== Rate Limit Code Generator ==========
ratelimit: (lang) => {
    const rps = document.getElementById('rl-rps')?.value || '100';
    const burst = document.getElementById('rl-burst')?.value || '50';
    const algo = document.getElementById('rl-algo')?.value || 'token-bucket';
    return {
        python: `import time\nimport threading\n\nclass TokenBucket:\n    def __init__(self, rate=${rps}, capacity=${burst}):\n        self.rate = rate\n        self.capacity = capacity\n        self.tokens = capacity\n        self.last = time.monotonic()\n        self.lock = threading.Lock()\n\n    def allow(self):\n        with self.lock:\n            now = time.monotonic()\n            self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)\n            self.last = now\n            if self.tokens >= 1:\n                self.tokens -= 1\n                return True\n            return False\n\nlimiter = TokenBucket()\nfor i in range(10):\n    print(f"Request {i+1}: {'allowed' if limiter.allow() else 'denied'}")`,
        javascript: `class TokenBucket {\n  constructor(rate = ${rps}, capacity = ${burst}) {\n    this.rate = rate;\n    this.capacity = capacity;\n    this.tokens = capacity;\n    this.last = Date.now();\n  }\n  allow() {\n    const now = Date.now();\n    this.tokens = Math.min(this.capacity, this.tokens + ((now - this.last) / 1000) * this.rate);\n    this.last = now;\n    if (this.tokens >= 1) { this.tokens--; return true; }\n    return false;\n  }\n}\n\nconst limiter = new TokenBucket();\nconsole.log(limiter.allow()); // true`,
        typescript: `class TokenBucket {\n  private tokens: number;\n  private last: number;\n  constructor(private rate: number = ${rps}, private capacity: number = ${burst}) {\n    this.tokens = capacity;\n    this.last = Date.now();\n  }\n  allow(): boolean {\n    const now = Date.now();\n    this.tokens = Math.min(this.capacity, this.tokens + ((now - this.last) / 1000) * this.rate);\n    this.last = now;\n    if (this.tokens >= 1) { this.tokens--; return true; }\n    return false;\n  }\n}`,
        java: `import java.util.concurrent.atomic.*;\n\npublic class TokenBucket {\n    private final double rate = ${rps};\n    private final double capacity = ${burst};\n    private double tokens;\n    private long lastTime;\n\n    public TokenBucket() { tokens = capacity; lastTime = System.nanoTime(); }\n\n    public synchronized boolean allow() {\n        long now = System.nanoTime();\n        tokens = Math.min(capacity, tokens + (now - lastTime) / 1e9 * rate);\n        lastTime = now;\n        if (tokens >= 1) { tokens--; return true; }\n        return false;\n    }\n}`,
        csharp: `public class TokenBucket {\n    private double _rate = ${rps}, _capacity = ${burst}, _tokens;\n    private DateTime _last = DateTime.UtcNow;\n    private readonly object _lock = new();\n\n    public TokenBucket() => _tokens = _capacity;\n\n    public bool Allow() {\n        lock (_lock) {\n            var now = DateTime.UtcNow;\n            _tokens = Math.Min(_capacity, _tokens + (now - _last).TotalSeconds * _rate);\n            _last = now;\n            if (_tokens >= 1) { _tokens--; return true; }\n            return false;\n        }\n    }\n}`,
        php: `<?php\nclass TokenBucket {\n    private float $rate = ${rps}, $capacity = ${burst}, $tokens, $last;\n    public function __construct() { $this->tokens = $this->capacity; $this->last = microtime(true); }\n    public function allow(): bool {\n        $now = microtime(true);\n        $this->tokens = min($this->capacity, $this->tokens + ($now - $this->last) * $this->rate);\n        $this->last = $now;\n        if ($this->tokens >= 1) { $this->tokens--; return true; }\n        return false;\n    }\n}`,
        go: `package main\n\nimport (\n\t"fmt"\n\t"sync"\n\t"time"\n)\n\ntype TokenBucket struct {\n\trate, capacity, tokens float64\n\tlast time.Time\n\tmu   sync.Mutex\n}\n\nfunc NewBucket() *TokenBucket {\n\treturn &TokenBucket{rate: ${rps}, capacity: ${burst}, tokens: ${burst}, last: time.Now()}\n}\n\nfunc (b *TokenBucket) Allow() bool {\n\tb.mu.Lock()\n\tdefer b.mu.Unlock()\n\tnow := time.Now()\n\tb.tokens = min(b.capacity, b.tokens+now.Sub(b.last).Seconds()*b.rate)\n\tb.last = now\n\tif b.tokens >= 1 { b.tokens--; return true }\n\treturn false\n}\n\nfunc main() {\n\tb := NewBucket()\n\tfmt.Println(b.Allow())\n}`,
        ruby: `class TokenBucket\n  def initialize(rate: ${rps}, capacity: ${burst})\n    @rate, @capacity = rate, capacity\n    @tokens = capacity.to_f\n    @last = Process.clock_gettime(Process::CLOCK_MONOTONIC)\n  end\n\n  def allow?\n    now = Process.clock_gettime(Process::CLOCK_MONOTONIC)\n    @tokens = [@capacity, @tokens + (now - @last) * @rate].min\n    @last = now\n    if @tokens >= 1\n      @tokens -= 1\n      true\n    else\n      false\n    end\n  end\nend`,
        rust: `use std::time::Instant;\n\nstruct TokenBucket {\n    rate: f64, capacity: f64, tokens: f64, last: Instant,\n}\n\nimpl TokenBucket {\n    fn new() -> Self {\n        Self { rate: ${rps}.0, capacity: ${burst}.0, tokens: ${burst}.0, last: Instant::now() }\n    }\n    fn allow(&mut self) -> bool {\n        let now = Instant::now();\n        self.tokens = (self.tokens + now.duration_since(self.last).as_secs_f64() * self.rate).min(self.capacity);\n        self.last = now;\n        if self.tokens >= 1.0 { self.tokens -= 1.0; true } else { false }\n    }\n}`,
        swift: `import Foundation\n\nclass TokenBucket {\n    let rate: Double = ${rps}, capacity: Double = ${burst}\n    var tokens: Double\n    var last: CFAbsoluteTime\n    init() { tokens = capacity; last = CFAbsoluteTimeGetCurrent() }\n    func allow() -> Bool {\n        let now = CFAbsoluteTimeGetCurrent()\n        tokens = min(capacity, tokens + (now - last) * rate)\n        last = now\n        if tokens >= 1 { tokens -= 1; return true }\n        return false\n    }\n}`,
        kotlin: `class TokenBucket(private val rate: Double = ${rps}.0, private val capacity: Double = ${burst}.0) {\n    private var tokens = capacity\n    private var last = System.nanoTime()\n\n    @Synchronized fun allow(): Boolean {\n        val now = System.nanoTime()\n        tokens = minOf(capacity, tokens + (now - last) / 1e9 * rate)\n        last = now\n        return if (tokens >= 1) { tokens--; true } else false\n    }\n}`,
        cpp: `#include <chrono>\n#include <mutex>\n\nclass TokenBucket {\n    double rate_{${rps}}, cap_{${burst}}, tokens_{${burst}};\n    std::chrono::steady_clock::time_point last_{std::chrono::steady_clock::now()};\n    std::mutex mtx_;\npublic:\n    bool allow() {\n        std::lock_guard<std::mutex> lk(mtx_);\n        auto now = std::chrono::steady_clock::now();\n        double elapsed = std::chrono::duration<double>(now - last_).count();\n        tokens_ = std::min(cap_, tokens_ + elapsed * rate_);\n        last_ = now;\n        if (tokens_ >= 1) { tokens_--; return true; }\n        return false;\n    }\n};`
    }[lang];
},
// ========== DB Schema Code Generator ==========
dbschema: (lang) => {
    const sql = (document.getElementById('db-output')?.value || 'CREATE TABLE users (id SERIAL PRIMARY KEY);').replace(/\n/g,'\\n').replace(/"/g,'\\"');
    return {
        python: `import sqlite3\n\nconn = sqlite3.connect(':memory:')\ncursor = conn.cursor()\n\nsql = """${sql.replace(/\\n/g,'\n')}"""\nfor stmt in sql.strip().split(';'):\n    if stmt.strip():\n        cursor.execute(stmt)\nconn.commit()\nprint("Tables created successfully")`,
        javascript: `// Using better-sqlite3\nconst Database = require('better-sqlite3');\nconst db = new Database(':memory:');\n\nconst sql = \`${sql.replace(/\\n/g,'\n')}\`;\ndb.exec(sql);\nconsole.log('Tables created');`,
        typescript: `import Database from 'better-sqlite3';\n\nconst db = new Database(':memory:');\nconst sql = \`${sql.replace(/\\n/g,'\n')}\`;\ndb.exec(sql);\nconsole.log('Tables created');`,
        java: `import java.sql.*;\n\npublic class Schema {\n    public static void main(String[] args) throws Exception {\n        Connection conn = DriverManager.getConnection("jdbc:sqlite::memory:");\n        Statement stmt = conn.createStatement();\n        stmt.executeUpdate("${sql}");\n        System.out.println("Tables created");\n    }\n}`,
        csharp: `using Microsoft.Data.Sqlite;\n\nusing var conn = new SqliteConnection("Data Source=:memory:");\nconn.Open();\nvar cmd = conn.CreateCommand();\ncmd.CommandText = @"${sql}";\ncmd.ExecuteNonQuery();`,
        php: `<?php\n$db = new SQLite3(':memory:');\n$sql = "${sql}";\n$db->exec($sql);\necho "Tables created\\n";`,
        go: `package main\n\nimport (\n\t"database/sql"\n\t"fmt"\n\t_ "github.com/mattn/go-sqlite3"\n)\n\nfunc main() {\n\tdb, _ := sql.Open("sqlite3", ":memory:")\n\tdefer db.Close()\n\tdb.Exec("${sql}")\n\tfmt.Println("Tables created")\n}`,
        ruby: `require 'sqlite3'\ndb = SQLite3::Database.new(':memory:')\ndb.execute_batch("${sql}")\nputs "Tables created"`,
        rust: `use rusqlite::Connection;\n\nfn main() {\n    let conn = Connection::open_in_memory().unwrap();\n    conn.execute_batch("${sql}").unwrap();\n    println!("Tables created");\n}`,
        swift: `import SQLite\n\nlet db = try Connection(":memory:")\ntry db.execute("${sql}")\nprint("Tables created")`,
        kotlin: `import java.sql.DriverManager\n\nfun main() {\n    val conn = DriverManager.getConnection("jdbc:sqlite::memory:")\n    conn.createStatement().executeUpdate("${sql}")\n    println("Tables created")\n}`,
        cpp: `#include <sqlite3.h>\n#include <iostream>\n\nint main() {\n    sqlite3* db;\n    sqlite3_open(":memory:", &db);\n    sqlite3_exec(db, "${sql}", nullptr, nullptr, nullptr);\n    std::cout << "Tables created\\n";\n    sqlite3_close(db);\n}`
    }[lang];
},
// ========== API Timing Code Generator ==========
apitiming: (lang) => {
    return {
        python: `import time\nimport statistics\nimport requests\n\ndef measure(url, n=10):\n    times = []\n    for _ in range(n):\n        start = time.perf_counter()\n        requests.get(url)\n        times.append((time.perf_counter() - start) * 1000)\n    times.sort()\n    return {\n        'avg': statistics.mean(times),\n        'p50': times[len(times)//2],\n        'p95': times[int(len(times)*0.95)],\n        'p99': times[int(len(times)*0.99)],\n        'min': min(times), 'max': max(times)\n    }\n\nresult = measure('https://api.example.com/health')\nfor k, v in result.items():\n    print(f"{k}: {v:.1f}ms")`,
        javascript: `async function measure(url, n = 10) {\n  const times = [];\n  for (let i = 0; i < n; i++) {\n    const start = performance.now();\n    await fetch(url);\n    times.push(performance.now() - start);\n  }\n  times.sort((a, b) => a - b);\n  return {\n    avg: times.reduce((a,b) => a+b) / times.length,\n    p50: times[Math.floor(times.length * 0.5)],\n    p95: times[Math.floor(times.length * 0.95)],\n    p99: times[Math.floor(times.length * 0.99)],\n    min: times[0], max: times[times.length-1]\n  };\n}\nmeasure('/api/health').then(r => console.table(r));`,
        typescript: `interface TimingResult {\n  avg: number; p50: number; p95: number; p99: number; min: number; max: number;\n}\n\nasync function measure(url: string, n = 10): Promise<TimingResult> {\n  const times: number[] = [];\n  for (let i = 0; i < n; i++) {\n    const start = performance.now();\n    await fetch(url);\n    times.push(performance.now() - start);\n  }\n  times.sort((a, b) => a - b);\n  return { avg: times.reduce((a,b) => a+b) / n, p50: times[Math.floor(n*0.5)],\n    p95: times[Math.floor(n*0.95)], p99: times[Math.floor(n*0.99)],\n    min: times[0], max: times[n-1] };\n}`,
        java: `import java.net.http.*;\nimport java.time.*;\nimport java.util.*;\n\npublic class ApiTimer {\n    public static void main(String[] args) throws Exception {\n        var client = HttpClient.newHttpClient();\n        var req = HttpRequest.newBuilder().uri(java.net.URI.create("https://api.example.com")).build();\n        var times = new ArrayList<Long>();\n        for (int i = 0; i < 10; i++) {\n            long start = System.nanoTime();\n            client.send(req, HttpResponse.BodyHandlers.ofString());\n            times.add((System.nanoTime() - start) / 1_000_000);\n        }\n        Collections.sort(times);\n        System.out.println("P50: " + times.get(4) + "ms");\n    }\n}`,
        csharp: `using var client = new HttpClient();\nvar times = new List<double>();\nfor (int i = 0; i < 10; i++) {\n    var sw = System.Diagnostics.Stopwatch.StartNew();\n    await client.GetAsync("https://api.example.com");\n    sw.Stop();\n    times.Add(sw.Elapsed.TotalMilliseconds);\n}\ntimes.Sort();\nConsole.WriteLine($"P50: {times[4]:F1}ms P99: {times[8]:F1}ms");`,
        php: `<?php\nfunction measure($url, $n = 10) {\n    $times = [];\n    for ($i = 0; $i < $n; $i++) {\n        $start = microtime(true);\n        file_get_contents($url);\n        $times[] = (microtime(true) - $start) * 1000;\n    }\n    sort($times);\n    return ['p50' => $times[floor($n*0.5)], 'p99' => $times[floor($n*0.99)]];\n}\nprint_r(measure('https://api.example.com'));`,
        go: `package main\n\nimport (\n\t"fmt"\n\t"net/http"\n\t"sort"\n\t"time"\n)\n\nfunc main() {\n\ttimes := make([]float64, 10)\n\tfor i := range times {\n\t\tstart := time.Now()\n\t\thttp.Get("https://api.example.com")\n\t\ttimes[i] = float64(time.Since(start).Milliseconds())\n\t}\n\tsort.Float64s(times)\n\tfmt.Printf("P50: %.0fms P99: %.0fms\\n", times[4], times[8])\n}`,
        ruby: `require 'net/http'\ntimes = 10.times.map do\n  start = Process.clock_gettime(Process::CLOCK_MONOTONIC)\n  Net::HTTP.get(URI('https://api.example.com'))\n  (Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000\nend.sort\nputs "P50: #{times[4].round(1)}ms P99: #{times[8].round(1)}ms"`,
        rust: `use std::time::Instant;\n\n#[tokio::main]\nasync fn main() {\n    let client = reqwest::Client::new();\n    let mut times: Vec<f64> = Vec::new();\n    for _ in 0..10 {\n        let start = Instant::now();\n        client.get("https://api.example.com").send().await.unwrap();\n        times.push(start.elapsed().as_secs_f64() * 1000.0);\n    }\n    times.sort_by(|a, b| a.partial_cmp(b).unwrap());\n    println!("P50: {:.1}ms P99: {:.1}ms", times[4], times[8]);\n}`,
        swift: `import Foundation\n\nfunc measure(url: String, n: Int = 10) -> [Double] {\n    var times: [Double] = []\n    for _ in 0..<n {\n        let start = CFAbsoluteTimeGetCurrent()\n        _ = try? Data(contentsOf: URL(string: url)!)\n        times.append((CFAbsoluteTimeGetCurrent() - start) * 1000)\n    }\n    return times.sorted()\n}`,
        kotlin: `import java.net.http.*\n\nfun main() {\n    val client = HttpClient.newHttpClient()\n    val times = (1..10).map {\n        val start = System.nanoTime()\n        client.send(HttpRequest.newBuilder().uri(java.net.URI("https://api.example.com")).build(), HttpResponse.BodyHandlers.ofString())\n        (System.nanoTime() - start) / 1_000_000\n    }.sorted()\n    println("P50: \${times[4]}ms P99: \${times[8]}ms")\n}`,
        cpp: `#include <chrono>\n#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <curl/curl.h>\n\nint main() {\n    std::vector<double> times;\n    for (int i = 0; i < 10; i++) {\n        auto start = std::chrono::steady_clock::now();\n        CURL* curl = curl_easy_init();\n        curl_easy_setopt(curl, CURLOPT_URL, "https://api.example.com");\n        curl_easy_perform(curl);\n        curl_easy_cleanup(curl);\n        auto ms = std::chrono::duration<double, std::milli>(std::chrono::steady_clock::now()-start).count();\n        times.push_back(ms);\n    }\n    std::sort(times.begin(), times.end());\n    std::cout << "P50: " << times[4] << "ms\\n";\n}`
    }[lang];
},
// ========== JSON Diff Code Generator ==========
jsondiff: (lang) => {
    return {
        python: `import json\n\ndef deep_diff(a, b, path=""):\n    diffs = []\n    if isinstance(a, dict) and isinstance(b, dict):\n        for key in set(list(a.keys()) + list(b.keys())):\n            p = f"{path}.{key}" if path else key\n            if key not in a: diffs.append(("added", p, b[key]))\n            elif key not in b: diffs.append(("removed", p, a[key]))\n            else: diffs.extend(deep_diff(a[key], b[key], p))\n    elif a != b:\n        diffs.append(("changed", path or "(root)", a, b))\n    return diffs\n\nold = {"name": "Alice", "age": 30}\nnew = {"name": "Alice", "age": 31, "city": "NYC"}\nfor d in deep_diff(old, new):\n    print(d)`,
        javascript: `function deepDiff(a, b, path = '') {\n  const diffs = [];\n  if (typeof a === 'object' && typeof b === 'object' && a && b) {\n    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);\n    for (const key of keys) {\n      const p = path ? path + '.' + key : key;\n      if (!(key in a)) diffs.push({ type: 'added', path: p, value: b[key] });\n      else if (!(key in b)) diffs.push({ type: 'removed', path: p, value: a[key] });\n      else diffs.push(...deepDiff(a[key], b[key], p));\n    }\n  } else if (a !== b) diffs.push({ type: 'changed', path: path || '(root)', from: a, to: b });\n  return diffs;\n}\nconsole.log(deepDiff({a: 1}, {a: 2, b: 3}));`,
        typescript: `interface DiffResult {\n  type: 'added' | 'removed' | 'changed';\n  path: string;\n  value?: unknown;\n  from?: unknown;\n  to?: unknown;\n}\n\nfunction deepDiff(a: any, b: any, path = ''): DiffResult[] {\n  const diffs: DiffResult[] = [];\n  if (typeof a === 'object' && typeof b === 'object' && a && b) {\n    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);\n    for (const key of keys) {\n      const p = path ? \`\${path}.\${key}\` : key;\n      if (!(key in a)) diffs.push({ type: 'added', path: p, value: b[key] });\n      else if (!(key in b)) diffs.push({ type: 'removed', path: p, value: a[key] });\n      else diffs.push(...deepDiff(a[key], b[key], p));\n    }\n  } else if (a !== b) diffs.push({ type: 'changed', path: path || '(root)', from: a, to: b });\n  return diffs;\n}`,
        java: `import com.google.gson.*;\nimport java.util.*;\n\npublic class JsonDiff {\n    public static List<String> diff(JsonObject a, JsonObject b, String path) {\n        List<String> diffs = new ArrayList<>();\n        Set<String> keys = new HashSet<>();\n        a.keySet().forEach(keys::add);\n        b.keySet().forEach(keys::add);\n        for (String key : keys) {\n            String p = path.isEmpty() ? key : path + "." + key;\n            if (!a.has(key)) diffs.add("+ " + p + ": " + b.get(key));\n            else if (!b.has(key)) diffs.add("- " + p + ": " + a.get(key));\n            else if (!a.get(key).equals(b.get(key))) diffs.add("~ " + p + ": " + a.get(key) + " -> " + b.get(key));\n        }\n        return diffs;\n    }\n}`,
        csharp: `using System.Text.Json;\n\nstatic IEnumerable<string> Diff(JsonElement a, JsonElement b, string path = "") {\n    var keys = new HashSet<string>();\n    foreach (var p in a.EnumerateObject()) keys.Add(p.Name);\n    foreach (var p in b.EnumerateObject()) keys.Add(p.Name);\n    foreach (var key in keys) {\n        var k = string.IsNullOrEmpty(path) ? key : $"{path}.{key}";\n        var hasA = a.TryGetProperty(key, out var va);\n        var hasB = b.TryGetProperty(key, out var vb);\n        if (!hasA) yield return $"+ {k}: {vb}";\n        else if (!hasB) yield return $"- {k}: {va}";\n        else if (va.ToString() != vb.ToString()) yield return $"~ {k}: {va} -> {vb}";\n    }\n}`,
        php: `<?php\nfunction deepDiff($a, $b, $path = '') {\n    $diffs = [];\n    $keys = array_unique(array_merge(array_keys($a), array_keys($b)));\n    foreach ($keys as $key) {\n        $p = $path ? "$path.$key" : $key;\n        if (!array_key_exists($key, $a)) $diffs[] = "+ $p: " . json_encode($b[$key]);\n        elseif (!array_key_exists($key, $b)) $diffs[] = "- $p: " . json_encode($a[$key]);\n        elseif ($a[$key] !== $b[$key]) $diffs[] = "~ $p: {$a[$key]} -> {$b[$key]}";\n    }\n    return $diffs;\n}`,
        go: `package main\n\nimport (\n\t"encoding/json"\n\t"fmt"\n)\n\nfunc diff(a, b map[string]interface{}, path string) {\n\tfor k, va := range a {\n\t\tp := k\n\t\tif path != "" { p = path + "." + k }\n\t\tvb, ok := b[k]\n\t\tif !ok { fmt.Printf("- %s: %v\\n", p, va) } else if fmt.Sprint(va) != fmt.Sprint(vb) { fmt.Printf("~ %s: %v -> %v\\n", p, va, vb) }\n\t}\n\tfor k, vb := range b {\n\t\tif _, ok := a[k]; !ok { fmt.Printf("+ %s: %v\\n", k, vb) }\n\t}\n}`,
        ruby: `require 'json'\n\ndef deep_diff(a, b, path = '')\n  diffs = []\n  keys = (a.keys + b.keys).uniq\n  keys.each do |k|\n    p = path.empty? ? k : "#{path}.#{k}"\n    if !a.key?(k) then diffs << "+ #{p}: #{b[k]}"\n    elsif !b.key?(k) then diffs << "- #{p}: #{a[k]}"\n    elsif a[k] != b[k] then diffs << "~ #{p}: #{a[k]} -> #{b[k]}"\n    end\n  end\n  diffs\nend`,
        rust: `use serde_json::{Value, Map};\n\nfn diff(a: &Map<String, Value>, b: &Map<String, Value>, path: &str) {\n    for (k, va) in a {\n        let p = if path.is_empty() { k.clone() } else { format!("{}.{}", path, k) };\n        match b.get(k) {\n            None => println!("- {}: {}", p, va),\n            Some(vb) if va != vb => println!("~ {}: {} -> {}", p, va, vb),\n            _ => {}\n        }\n    }\n    for (k, vb) in b {\n        if !a.contains_key(k) { println!("+ {}: {}", k, vb); }\n    }\n}`,
        swift: `func diff(_ a: [String: Any], _ b: [String: Any], path: String = "") {\n    let keys = Set(Array(a.keys) + Array(b.keys))\n    for key in keys {\n        let p = path.isEmpty ? key : "\\(path).\\(key)"\n        if a[key] == nil { print("+ \\(p): \\(b[key]!)") }\n        else if b[key] == nil { print("- \\(p): \\(a[key]!)") }\n        else if "\\(a[key]!)" != "\\(b[key]!)" { print("~ \\(p): \\(a[key]!) -> \\(b[key]!)") }\n    }\n}`,
        kotlin: `fun diff(a: Map<String, Any?>, b: Map<String, Any?>, path: String = "") {\n    val keys = (a.keys + b.keys).toSet()\n    for (key in keys) {\n        val p = if (path.isEmpty()) key else "$path.$key"\n        when {\n            key !in a -> println("+ $p: \${b[key]}")\n            key !in b -> println("- $p: \${a[key]}")\n            a[key] != b[key] -> println("~ $p: \${a[key]} -> \${b[key]}")\n        }\n    }\n}`,
        cpp: `#include <iostream>\n#include <nlohmann/json.hpp>\nusing json = nlohmann::json;\n\nvoid diff(const json& a, const json& b, const std::string& path = "") {\n    for (auto& [k, v] : a.items()) {\n        auto p = path.empty() ? k : path + "." + k;\n        if (!b.contains(k)) std::cout << "- " << p << ": " << v << "\\n";\n        else if (v != b[k]) std::cout << "~ " << p << ": " << v << " -> " << b[k] << "\\n";\n    }\n    for (auto& [k, v] : b.items())\n        if (!a.contains(k)) std::cout << "+ " << k << ": " << v << "\\n";\n}`
    }[lang];
}

}; // end codeGenerators

// ========== Keyboard Shortcuts ==========
function closeShortcutsModal(e) {
    if (e.target === e.currentTarget) {
        document.getElementById('shortcuts-modal').classList.remove('open');
    }
}

document.addEventListener('keydown', (e) => {
    const inInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

    if (e.key === 'Escape') {
        document.getElementById('shortcuts-modal').classList.remove('open');
        closeSidebar();
        return;
    }

    if (e.key === '?' && !inInput) {
        e.preventDefault();
        document.getElementById('shortcuts-modal').classList.toggle('open');
        return;
    }

    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1': e.preventDefault(); switchTool('json'); break;
            case '2': e.preventDefault(); switchTool('base64'); break;
            case '3': e.preventDefault(); switchTool('jwt'); break;
            case '4': e.preventDefault(); switchTool('regex'); break;
            case '5': e.preventDefault(); switchTool('timestamp'); break;
            case '6': e.preventDefault(); switchTool('color'); break;
            case 'k': case 'K':
                e.preventDefault();
                const searchInput = document.getElementById('sidebar-search-input');
                searchInput.focus();
                document.getElementById('sidebar').classList.add('open');
                document.getElementById('overlay').classList.add('open');
                break;
        }
    }
});

// ========== Password Strength Checker ==========
function checkPasswordStrength() {
    const pw = document.getElementById('pw-check-input').value;
    const result = document.getElementById('pw-check-result');
    if (!pw) { result.style.display = 'none'; return; }
    result.style.display = 'block';

    let score = 0;
    const checks = { length: pw.length >= 8, upper: /[A-Z]/.test(pw), lower: /[a-z]/.test(pw),
        digit: /[0-9]/.test(pw), special: /[^A-Za-z0-9]/.test(pw), length12: pw.length >= 12,
        length16: pw.length >= 16, noRepeat: !/(.)\1{2,}/.test(pw), noSequence: !/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(pw) };

    if (checks.length) score += 1;
    if (checks.upper) score += 1;
    if (checks.lower) score += 1;
    if (checks.digit) score += 1;
    if (checks.special) score += 1;
    if (checks.length12) score += 1;
    if (checks.length16) score += 1;
    if (checks.noRepeat) score += 0.5;
    if (checks.noSequence) score += 0.5;

    // Entropy calculation
    let charsetSize = 0;
    if (/[a-z]/.test(pw)) charsetSize += 26;
    if (/[A-Z]/.test(pw)) charsetSize += 26;
    if (/[0-9]/.test(pw)) charsetSize += 10;
    if (/[^A-Za-z0-9]/.test(pw)) charsetSize += 33;
    const entropy = Math.floor(pw.length * Math.log2(charsetSize || 1));

    // Crack time estimation
    const guessesPerSec = 1e10; // 10 billion (modern GPU)
    const combinations = Math.pow(charsetSize || 1, pw.length);
    const seconds = combinations / guessesPerSec / 2;
    let crackTime;
    if (seconds < 1) crackTime = 'Instant';
    else if (seconds < 60) crackTime = Math.ceil(seconds) + ' seconds';
    else if (seconds < 3600) crackTime = Math.ceil(seconds / 60) + ' minutes';
    else if (seconds < 86400) crackTime = Math.ceil(seconds / 3600) + ' hours';
    else if (seconds < 31536000) crackTime = Math.ceil(seconds / 86400) + ' days';
    else if (seconds < 31536000 * 1000) crackTime = Math.ceil(seconds / 31536000) + ' years';
    else if (seconds < 31536000 * 1e6) crackTime = Math.ceil(seconds / 31536000 / 1000) + 'K years';
    else if (seconds < 31536000 * 1e9) crackTime = Math.ceil(seconds / 31536000 / 1e6) + 'M years';
    else crackTime = 'Centuries+';

    const maxScore = 8;
    const pct = Math.min(100, (score / maxScore) * 100);
    let label, color;
    if (pct < 25) { label = 'Very Weak'; color = '#ef4444'; }
    else if (pct < 50) { label = 'Weak'; color = '#f97316'; }
    else if (pct < 70) { label = 'Fair'; color = '#eab308'; }
    else if (pct < 90) { label = 'Strong'; color = '#22c55e'; }
    else { label = 'Very Strong'; color = '#10b981'; }

    document.getElementById('pw-check-fill').style.width = pct + '%';
    document.getElementById('pw-check-fill').style.background = color;
    document.getElementById('pw-check-label').textContent = label;
    document.getElementById('pw-check-label').style.color = color;

    document.getElementById('pw-check-details').innerHTML =
        `<div class="color-row"><span class="color-label">Length</span><span>${pw.length} characters</span></div>` +
        `<div class="color-row"><span class="color-label">Entropy</span><span>${entropy} bits</span></div>` +
        `<div class="color-row"><span class="color-label">Charset Size</span><span>${charsetSize} characters</span></div>` +
        `<div class="color-row"><span class="color-label">Crack Time (10B/s)</span><span>${crackTime}</span></div>` +
        `<div class="color-row"><span class="color-label">Uppercase</span><span>${checks.upper ? '&#10003;' : '&#10007;'}</span></div>` +
        `<div class="color-row"><span class="color-label">Lowercase</span><span>${checks.lower ? '&#10003;' : '&#10007;'}</span></div>` +
        `<div class="color-row"><span class="color-label">Digits</span><span>${checks.digit ? '&#10003;' : '&#10007;'}</span></div>` +
        `<div class="color-row"><span class="color-label">Special Chars</span><span>${checks.special ? '&#10003;' : '&#10007;'}</span></div>`;

    let warnings = [];
    if (!checks.noRepeat) warnings.push('Contains repeated characters (e.g. aaa)');
    if (!checks.noSequence) warnings.push('Contains sequential patterns (e.g. abc, 123)');
    if (pw.length < 8) warnings.push('Password is too short (min 8 characters)');
    if (/^[a-zA-Z]+$/.test(pw)) warnings.push('Only letters - add digits and symbols');
    if (/^[0-9]+$/.test(pw)) warnings.push('Only numbers - add letters and symbols');

    const warnEl = document.getElementById('pw-check-warnings');
    warnEl.innerHTML = warnings.length ? warnings.map(w => `<div style="color:#f97316;font-size:0.8rem;margin-bottom:0.25rem">&#9888; ${w}</div>`).join('') : '';

    let suggestions = [];
    if (!checks.upper) suggestions.push('Add uppercase letters');
    if (!checks.special) suggestions.push('Add special characters (!@#$%)');
    if (!checks.length12) suggestions.push('Use at least 12 characters');
    if (!checks.digit) suggestions.push('Add numbers');

    const sugEl = document.getElementById('pw-check-suggestions');
    sugEl.innerHTML = suggestions.length ? '<div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem"><strong>Suggestions:</strong></div>' + suggestions.map(s => `<div style="color:var(--accent);font-size:0.8rem;margin-bottom:0.25rem">&#10148; ${s}</div>`).join('') : '';
}

// ========== Commit Message Generator ==========
const GITMOJI = { feat: '✨', fix: '🐛', docs: '📝', style: '💄', refactor: '♻️', perf: '⚡', test: '✅', build: '📦', ci: '👷', chore: '🔧', revert: '⏪' };

function generateCommitMsg() {
    const type = document.getElementById('commit-type').value;
    const scope = document.getElementById('commit-scope').value.trim();
    const desc = document.getElementById('commit-desc').value.trim() || 'add new feature';
    const body = document.getElementById('commit-body').value.trim();
    const breaking = document.getElementById('commit-breaking').checked;
    const emoji = document.getElementById('commit-emoji').checked;
    const issue = document.getElementById('commit-issue').value.trim();

    let header = '';
    if (emoji && GITMOJI[type]) header += GITMOJI[type] + ' ';
    header += type;
    if (scope) header += `(${scope})`;
    if (breaking) header += '!';
    header += `: ${desc}`;

    let msg = header;
    if (body) msg += '\n\n' + body;
    if (breaking) msg += '\n\nBREAKING CHANGE: ' + (body || desc);
    if (issue) msg += '\n\nCloses ' + issue;

    const outputEl = document.getElementById('commit-output');
    outputEl.childNodes.forEach(n => { if (n.nodeType === 3) n.remove(); });
    outputEl.insertBefore(document.createTextNode(msg), outputEl.firstChild);

    const cmdEl = document.getElementById('commit-cmd');
    const escaped = msg.replace(/'/g, "'\\''");
    const cmd = `git commit -m '${escaped}'`;
    cmdEl.childNodes.forEach(n => { if (n.nodeType === 3) n.remove(); });
    cmdEl.insertBefore(document.createTextNode(cmd), cmdEl.firstChild);
}

// ========== Mock Data Generator ==========
const MOCK_TYPES = {
    id: () => Math.floor(Math.random() * 99999) + 1,
    uuid: () => crypto.randomUUID(),
    name: () => { const f = ['Alice','Bob','Charlie','Diana','Eve','Frank','Grace','Henry','Ivy','Jack']; const l = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez']; return f[Math.floor(Math.random()*f.length)] + ' ' + l[Math.floor(Math.random()*l.length)]; },
    email: () => { const u = ['alice','bob','charlie','diana','eve','frank'][Math.floor(Math.random()*6)]; const d = ['gmail.com','yahoo.com','outlook.com','proton.me'][Math.floor(Math.random()*4)]; return u + Math.floor(Math.random()*999) + '@' + d; },
    phone: () => `+1-${String(Math.floor(Math.random()*900)+100)}-${String(Math.floor(Math.random()*900)+100)}-${String(Math.floor(Math.random()*9000)+1000)}`,
    date: () => { const d = new Date(Date.now() - Math.random()*365*24*60*60*1000*3); return d.toISOString().split('T')[0]; },
    datetime: () => new Date(Date.now() - Math.random()*365*24*60*60*1000*3).toISOString(),
    boolean: () => Math.random() > 0.5,
    integer: () => Math.floor(Math.random() * 10000),
    float: () => +(Math.random() * 1000).toFixed(2),
    price: () => '$' + (Math.random() * 500 + 0.99).toFixed(2),
    url: () => 'https://' + ['example','test','demo','app'][Math.floor(Math.random()*4)] + '.com/' + Math.random().toString(36).slice(2,8),
    ip: () => Array.from({length:4}, ()=>Math.floor(Math.random()*256)).join('.'),
    color: () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'),
    country: () => ['USA','UK','Canada','Germany','France','Japan','Australia','Brazil','India','Mexico'][Math.floor(Math.random()*10)],
    city: () => ['New York','London','Tokyo','Paris','Berlin','Sydney','Toronto','Mumbai','Mexico City','Sao Paulo'][Math.floor(Math.random()*10)],
    company: () => ['Acme Corp','TechFlow','DataBridge','CloudNine','NetStar','InfoPulse','CyberEdge','NovaTech'][Math.floor(Math.random()*8)],
    paragraph: () => ['Lorem ipsum dolor sit amet.','Sed do eiusmod tempor incididunt.','Ut enim ad minim veniam.','Duis aute irure dolor in reprehenderit.'][Math.floor(Math.random()*4)],
    status: () => ['active','inactive','pending','suspended','archived'][Math.floor(Math.random()*5)],
    avatar: () => `https://i.pravatar.cc/150?u=${Math.random().toString(36).slice(2,8)}`
};

function addMockField(name = '', type = 'name') {
    const container = document.getElementById('mock-fields');
    const row = document.createElement('div');
    row.className = 'mock-field-row';
    const typeOptions = Object.keys(MOCK_TYPES).map(t => `<option value="${t}" ${t===type?'selected':''}>${t}</option>`).join('');
    row.innerHTML = `<input type="text" placeholder="Field name" value="${name}" style="flex:1"><select style="flex:1">${typeOptions}</select><button class="btn" onclick="this.parentElement.remove()" style="padding:0.3rem 0.6rem">&times;</button>`;
    container.appendChild(row);
}

const MOCK_PRESETS = {
    user: [['id','id'],['name','name'],['email','email'],['phone','phone'],['city','city'],['status','status']],
    product: [['id','id'],['name','company'],['price','price'],['category','status'],['in_stock','boolean'],['created_at','date']],
    order: [['order_id','uuid'],['customer','name'],['total','price'],['status','status'],['date','datetime'],['items','integer']],
    post: [['id','id'],['title','company'],['author','name'],['content','paragraph'],['published','boolean'],['created','datetime']],
    event: [['id','uuid'],['title','company'],['location','city'],['date','date'],['attendees','integer'],['url','url']]
};

function loadMockPreset(preset) {
    const container = document.getElementById('mock-fields');
    container.innerHTML = '';
    (MOCK_PRESETS[preset] || []).forEach(([n, t]) => addMockField(n, t));
    // Update active btn
    const btns = container.closest('.tool-panel').querySelectorAll('.btn-row .btn');
    btns.forEach(b => b.classList.remove('btn-active'));
    const clicked = [...btns].find(b => b.textContent.toLowerCase().includes(preset));
    if (clicked) clicked.classList.add('btn-active');
}

function generateMockData() {
    const count = parseInt(document.getElementById('mock-count').value) || 5;
    const format = document.getElementById('mock-format').value;
    const table = document.getElementById('mock-table').value || 'data';
    const fieldRows = document.querySelectorAll('#mock-fields .mock-field-row');

    const fields = [];
    fieldRows.forEach(row => {
        const name = row.querySelector('input').value.trim();
        const type = row.querySelector('select').value;
        if (name) fields.push({ name, type });
    });

    if (!fields.length) { document.getElementById('mock-output').value = 'Add at least one field'; return; }

    const data = Array.from({ length: count }, () => {
        const obj = {};
        fields.forEach(f => { obj[f.name] = MOCK_TYPES[f.type](); });
        return obj;
    });

    let output;
    if (format === 'json') {
        output = JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
        const headers = fields.map(f => f.name).join(',');
        const rows = data.map(d => fields.map(f => { const v = d[f.name]; return typeof v === 'string' && v.includes(',') ? `"${v}"` : v; }).join(','));
        output = [headers, ...rows].join('\n');
    } else if (format === 'sql') {
        output = data.map(d => {
            const cols = fields.map(f => f.name).join(', ');
            const vals = fields.map(f => { const v = d[f.name]; return typeof v === 'string' ? `'${v.replace(/'/g,"''")}'` : v; }).join(', ');
            return `INSERT INTO ${table} (${cols}) VALUES (${vals});`;
        }).join('\n');
    } else if (format === 'typescript') {
        const typeMap = { id: 'number', uuid: 'string', name: 'string', email: 'string', phone: 'string', date: 'string', datetime: 'string', boolean: 'boolean', integer: 'number', float: 'number', price: 'string', url: 'string', ip: 'string', color: 'string', country: 'string', city: 'string', company: 'string', paragraph: 'string', status: 'string', avatar: 'string' };
        const iface = `interface ${table.charAt(0).toUpperCase()+table.slice(1)} {\n${fields.map(f => `  ${f.name}: ${typeMap[f.type]||'string'};`).join('\n')}\n}\n\n`;
        output = iface + `const data: ${table.charAt(0).toUpperCase()+table.slice(1)}[] = ${JSON.stringify(data, null, 2)};`;
    }

    document.getElementById('mock-output').value = output;
}

// ========== GitHub Actions Builder ==========
let ghaJobCount = 0;

function addGHAStep(jobEl) {
    const stepsContainer = jobEl.querySelector('.gha-steps');
    const row = document.createElement('div');
    row.className = 'gha-step-row';
    row.innerHTML = `<input type="text" placeholder="Step name" value="" oninput="generateGHAction()"><input type="text" placeholder="uses: or run:" value="" oninput="generateGHAction()"><button class="btn" onclick="this.parentElement.remove();generateGHAction()" style="padding:0.3rem 0.6rem">&times;</button>`;
    stepsContainer.appendChild(row);
}

function addGHAJob() {
    ghaJobCount++;
    const container = document.getElementById('gha-jobs');
    const card = document.createElement('div');
    card.className = 'gha-job-card';
    card.innerHTML = `<div class="input-group"><label>Job Name</label><input type="text" value="build" oninput="generateGHAction()"></div><div class="input-group"><label>Runs On</label><select onchange="generateGHAction()"><option value="ubuntu-latest">ubuntu-latest</option><option value="ubuntu-22.04">ubuntu-22.04</option><option value="macos-latest">macos-latest</option><option value="windows-latest">windows-latest</option></select></div><div class="input-group"><label>Steps</label><div class="gha-steps"></div><button class="btn" onclick="addGHAStep(this.closest('.gha-job-card'));generateGHAction()" style="margin-top:0.3rem">+ Add Step</button></div>${ghaJobCount > 1 ? '<button class="btn" onclick="this.closest(\'.gha-job-card\').remove();generateGHAction()" style="margin-top:0.5rem;color:#ef4444">Remove Job</button>' : ''}`;
    container.appendChild(card);

    // Add default checkout step
    const step1 = document.createElement('div');
    step1.className = 'gha-step-row';
    step1.innerHTML = `<input type="text" placeholder="Step name" value="Checkout" oninput="generateGHAction()"><input type="text" placeholder="uses: or run:" value="actions/checkout@v4" oninput="generateGHAction()"><button class="btn" onclick="this.parentElement.remove();generateGHAction()" style="padding:0.3rem 0.6rem">&times;</button>`;
    card.querySelector('.gha-steps').appendChild(step1);
    generateGHAction();
}

const GHA_TEMPLATES = {
    node: { name: 'Node.js CI', jobs: [{ name: 'build', runsOn: 'ubuntu-latest', steps: [['Checkout','actions/checkout@v4'],['Setup Node','actions/setup-node@v4'],['Install','npm ci'],['Test','npm test'],['Build','npm run build']] }] },
    python: { name: 'Python CI', jobs: [{ name: 'test', runsOn: 'ubuntu-latest', steps: [['Checkout','actions/checkout@v4'],['Setup Python','actions/setup-python@v5'],['Install','pip install -r requirements.txt'],['Test','pytest']] }] },
    docker: { name: 'Docker Build', jobs: [{ name: 'build', runsOn: 'ubuntu-latest', steps: [['Checkout','actions/checkout@v4'],['Login to GHCR','docker login ghcr.io -u ${{ github.actor }} -p ${{ secrets.GITHUB_TOKEN }}'],['Build','docker build -t ghcr.io/${{ github.repository }}:latest .'],['Push','docker push ghcr.io/${{ github.repository }}:latest']] }] },
    rust: { name: 'Rust CI', jobs: [{ name: 'build', runsOn: 'ubuntu-latest', steps: [['Checkout','actions/checkout@v4'],['Setup Rust','actions-rust-lang/setup-rust-toolchain@v1'],['Build','cargo build --verbose'],['Test','cargo test --verbose']] }] },
    go: { name: 'Go CI', jobs: [{ name: 'build', runsOn: 'ubuntu-latest', steps: [['Checkout','actions/checkout@v4'],['Setup Go','actions/setup-go@v5'],['Build','go build -v ./...'],['Test','go test -v ./...']] }] },
    dotnet: { name: '.NET CI', jobs: [{ name: 'build', runsOn: 'ubuntu-latest', steps: [['Checkout','actions/checkout@v4'],['Setup .NET','actions/setup-dotnet@v4'],['Restore','dotnet restore'],['Build','dotnet build --no-restore'],['Test','dotnet test --no-build']] }] },
    java: { name: 'Java CI', jobs: [{ name: 'build', runsOn: 'ubuntu-latest', steps: [['Checkout','actions/checkout@v4'],['Setup JDK','actions/setup-java@v4'],['Build','mvn -B package']] }] },
    pages: { name: 'Deploy Pages', jobs: [{ name: 'deploy', runsOn: 'ubuntu-latest', steps: [['Checkout','actions/checkout@v4'],['Setup Pages','actions/configure-pages@v4'],['Upload','actions/upload-pages-artifact@v3'],['Deploy','actions/deploy-pages@v4']] }] }
};

function loadGHATemplate(tpl) {
    const t = GHA_TEMPLATES[tpl];
    if (!t) return;
    document.getElementById('gha-name').value = t.name;
    const container = document.getElementById('gha-jobs');
    container.innerHTML = '';
    ghaJobCount = 0;
    t.jobs.forEach(job => {
        ghaJobCount++;
        const card = document.createElement('div');
        card.className = 'gha-job-card';
        card.innerHTML = `<div class="input-group"><label>Job Name</label><input type="text" value="${job.name}" oninput="generateGHAction()"></div><div class="input-group"><label>Runs On</label><select onchange="generateGHAction()"><option value="ubuntu-latest" ${job.runsOn==='ubuntu-latest'?'selected':''}>ubuntu-latest</option><option value="ubuntu-22.04" ${job.runsOn==='ubuntu-22.04'?'selected':''}>ubuntu-22.04</option><option value="macos-latest" ${job.runsOn==='macos-latest'?'selected':''}>macos-latest</option><option value="windows-latest" ${job.runsOn==='windows-latest'?'selected':''}>windows-latest</option></select></div><div class="input-group"><label>Steps</label><div class="gha-steps"></div><button class="btn" onclick="addGHAStep(this.closest('.gha-job-card'));generateGHAction()" style="margin-top:0.3rem">+ Add Step</button></div>`;
        container.appendChild(card);
        const stepsContainer = card.querySelector('.gha-steps');
        job.steps.forEach(([name, val]) => {
            const row = document.createElement('div');
            row.className = 'gha-step-row';
            row.innerHTML = `<input type="text" placeholder="Step name" value="${name}" oninput="generateGHAction()"><input type="text" placeholder="uses: or run:" value="${val}" oninput="generateGHAction()"><button class="btn" onclick="this.parentElement.remove();generateGHAction()" style="padding:0.3rem 0.6rem">&times;</button>`;
            stepsContainer.appendChild(row);
        });
    });
    // Update active btn
    const btns = document.querySelector('#panel-ghactions .btn-row');
    if (btns) btns.querySelectorAll('.btn').forEach(b => { b.classList.remove('btn-active'); if (b.textContent.toLowerCase().includes(tpl.replace('dotnet','.net'))) b.classList.add('btn-active'); });
    generateGHAction();
}

function generateGHAction() {
    const name = document.getElementById('gha-name').value || 'CI';
    const push = document.getElementById('gha-push').checked;
    const pr = document.getElementById('gha-pr').checked;
    const schedule = document.getElementById('gha-schedule').checked;
    const dispatch = document.getElementById('gha-dispatch').checked;
    const branches = document.getElementById('gha-branches').value.split(',').map(b => b.trim()).filter(Boolean);

    let yaml = `name: ${name}\n\non:\n`;
    if (push) yaml += `  push:\n    branches: [${branches.join(', ')}]\n`;
    if (pr) yaml += `  pull_request:\n    branches: [${branches.join(', ')}]\n`;
    if (schedule) yaml += `  schedule:\n    - cron: '0 0 * * *'\n`;
    if (dispatch) yaml += `  workflow_dispatch:\n`;
    if (!push && !pr && !schedule && !dispatch) yaml += `  push:\n    branches: [main]\n`;

    yaml += '\njobs:\n';

    const jobCards = document.querySelectorAll('#gha-jobs .gha-job-card');
    jobCards.forEach(card => {
        const jobName = card.querySelector('input').value || 'build';
        const runsOn = card.querySelector('select').value;
        yaml += `  ${jobName.replace(/\s+/g, '-')}:\n    runs-on: ${runsOn}\n    steps:\n`;

        const stepRows = card.querySelectorAll('.gha-step-row');
        stepRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            const stepName = inputs[0].value;
            const stepVal = inputs[1].value;
            if (!stepVal) return;

            if (stepName) yaml += `      - name: ${stepName}\n`;
            else yaml += `      -\n`;

            if (stepVal.includes('/') && !stepVal.includes(' ')) {
                yaml += `        uses: ${stepVal}\n`;
            } else {
                yaml += `        run: ${stepVal}\n`;
            }
        });
    });

    document.getElementById('gha-output').value = yaml;
}

// ========== Rate Limit Calculator ==========
function formatNumber(n) {
    if (n >= 1e12) return (n/1e12).toFixed(1) + 'T';
    if (n >= 1e9) return (n/1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
    return Math.round(n).toString();
}

function calcRateLimit() {
    const rps = parseInt(document.getElementById('rl-rps').value) || 100;
    const burst = parseInt(document.getElementById('rl-burst').value) || 50;
    const clients = parseInt(document.getElementById('rl-clients').value) || 1000;
    const algo = document.getElementById('rl-algo').value;
    const responseMs = parseInt(document.getElementById('rl-response').value) || 50;
    const window = parseInt(document.getElementById('rl-window').value) || 60;

    const totalRps = rps * clients;
    const reqPerWindow = rps * window;
    const totalReqPerWindow = totalRps * window;
    const maxConcurrent = Math.floor(1000 / responseMs * clients);
    const throughput = Math.min(totalRps, maxConcurrent);
    const memPerClient = algo === 'sliding-window' ? 80 : 16;
    const totalMem = clients * memPerClient;

    let algoDesc;
    switch (algo) {
        case 'token-bucket':
            algoDesc = `Token Bucket\n` +
                `  Refill rate: ${rps} tokens/sec per client\n` +
                `  Bucket capacity: ${burst} tokens\n` +
                `  Allows bursts up to ${burst} requests instantly\n` +
                `  Smooths out to ${rps} req/s sustained\n` +
                `  Pros: Handles bursts gracefully, simple\n` +
                `  Cons: Can temporarily exceed rate during bursts`;
            break;
        case 'fixed-window':
            algoDesc = `Fixed Window\n` +
                `  Window size: ${window}s\n` +
                `  Max requests per window: ${reqPerWindow}\n` +
                `  Resets at window boundary\n` +
                `  Worst case: ${reqPerWindow * 2} req in ${window}s span\n` +
                `  Pros: Simple, low memory\n` +
                `  Cons: Boundary spike problem (2x burst at edges)`;
            break;
        case 'sliding-window':
            algoDesc = `Sliding Window Log\n` +
                `  Window size: ${window}s\n` +
                `  Max requests per window: ${reqPerWindow}\n` +
                `  Smooth sliding, no boundary spikes\n` +
                `  Memory: stores timestamp per request\n` +
                `  Pros: Most accurate rate limiting\n` +
                `  Cons: Higher memory usage (${formatNumber(totalMem)} bytes)`;
            break;
        case 'leaky-bucket':
            algoDesc = `Leaky Bucket\n` +
                `  Processing rate: ${rps} req/s (fixed)\n` +
                `  Queue capacity: ${burst} requests\n` +
                `  Requests queued when rate exceeded\n` +
                `  Dropped when queue full\n` +
                `  Pros: Perfectly smooth output rate\n` +
                `  Cons: Adds latency, no burst handling`;
            break;
    }

    const output =
        `===== Rate Limit Summary =====\n\n` +
        `Per Client:\n` +
        `  Rate: ${rps} req/s\n` +
        `  Burst: ${burst} requests\n` +
        `  Per ${window}s window: ${formatNumber(reqPerWindow)} requests\n\n` +
        `Global (${formatNumber(clients)} clients):\n` +
        `  Total rate: ${formatNumber(totalRps)} req/s\n` +
        `  Total per ${window}s: ${formatNumber(totalReqPerWindow)} requests\n` +
        `  Max concurrent: ${formatNumber(maxConcurrent)}\n` +
        `  Effective throughput: ${formatNumber(throughput)} req/s\n` +
        `  Memory estimate: ${formatNumber(totalMem)} bytes\n\n` +
        `Timing:\n` +
        `  Avg response: ${responseMs}ms\n` +
        `  Min interval: ${(1000/rps).toFixed(2)}ms between requests\n` +
        `  Burst drain time: ${(burst/rps).toFixed(2)}s\n` +
        `  Requests/hour: ${formatNumber(rps * 3600)}\n` +
        `  Requests/day: ${formatNumber(rps * 86400)}\n\n` +
        `===== Algorithm Details =====\n\n` +
        algoDesc + '\n\n' +
        `===== HTTP Headers =====\n\n` +
        `X-RateLimit-Limit: ${reqPerWindow}\n` +
        `X-RateLimit-Remaining: <dynamic>\n` +
        `X-RateLimit-Reset: <window_end_epoch>\n` +
        `Retry-After: ${Math.ceil(1/rps)}`;

    document.getElementById('rl-output').textContent = output;
}

// ========== Database Schema Designer ==========
const DB_TYPES = ['INT','BIGINT','VARCHAR(255)','TEXT','BOOLEAN','DATE','DATETIME','TIMESTAMP','DECIMAL(10,2)','FLOAT','DOUBLE','JSON','UUID','SERIAL','SMALLINT','CHAR(36)','BLOB','ENUM'];

let dbTableCount = 0;

function addDBTable(name = '', columns = []) {
    dbTableCount++;
    const container = document.getElementById('db-tables');
    const card = document.createElement('div');
    card.className = 'db-table-card';
    card.dataset.tableid = dbTableCount;
    const typeOpts = DB_TYPES.map(t => `<option value="${t}">${t}</option>`).join('');
    card.innerHTML = `<div class="input-group"><label style="font-weight:600">Table Name</label><input type="text" class="db-table-name" value="${name || 'table_' + dbTableCount}" oninput="generateDBSQL()"></div><div class="input-group"><label>Columns</label><div class="db-columns"></div><button class="btn" onclick="addDBColumn(this.closest('.db-table-card'))" style="margin-top:0.3rem">+ Add Column</button></div><button class="btn" onclick="this.closest('.db-table-card').remove();generateDBSQL()" style="margin-top:0.5rem;color:#ef4444">Remove Table</button>`;
    container.appendChild(card);

    if (columns.length) {
        columns.forEach(c => addDBColumn(card, c.name, c.type, c.pk, c.nn, c.fk));
    } else {
        addDBColumn(card, 'id', 'SERIAL', true, true, '');
        addDBColumn(card, 'created_at', 'TIMESTAMP', false, true, '');
    }
    generateDBSQL();
}

function addDBColumn(tableCard, name = '', type = 'VARCHAR(255)', pk = false, nn = false, fk = '') {
    const container = tableCard.querySelector('.db-columns');
    const row = document.createElement('div');
    row.className = 'db-col-row';
    const typeOpts = DB_TYPES.map(t => `<option value="${t}" ${t===type?'selected':''}>${t}</option>`).join('');
    row.innerHTML = `<input type="text" placeholder="column_name" value="${name}" oninput="generateDBSQL()" style="min-width:100px"><select onchange="generateDBSQL()">${typeOpts}</select><label style="font-size:.7rem;color:var(--text-muted);display:flex;align-items:center;gap:2px;flex-shrink:0"><input type="checkbox" ${pk?'checked':''} onchange="generateDBSQL()">PK</label><label style="font-size:.7rem;color:var(--text-muted);display:flex;align-items:center;gap:2px;flex-shrink:0"><input type="checkbox" ${nn?'checked':''} onchange="generateDBSQL()">NN</label><input type="text" placeholder="FK: table.col" value="${fk||''}" style="min-width:90px;max-width:120px" oninput="generateDBSQL()"><button class="btn" onclick="this.parentElement.remove();generateDBSQL()" style="padding:0.2rem 0.5rem;flex-shrink:0">&times;</button>`;
    container.appendChild(row);
}

const DB_PRESETS = {
    blog: [
        { name: 'users', columns: [{ name:'id',type:'SERIAL',pk:true,nn:true },{ name:'username',type:'VARCHAR(255)',nn:true },{ name:'email',type:'VARCHAR(255)',nn:true },{ name:'password_hash',type:'VARCHAR(255)',nn:true },{ name:'created_at',type:'TIMESTAMP',nn:true }] },
        { name: 'posts', columns: [{ name:'id',type:'SERIAL',pk:true,nn:true },{ name:'title',type:'VARCHAR(255)',nn:true },{ name:'slug',type:'VARCHAR(255)',nn:true },{ name:'content',type:'TEXT' },{ name:'author_id',type:'INT',nn:true,fk:'users.id' },{ name:'published',type:'BOOLEAN' },{ name:'created_at',type:'TIMESTAMP',nn:true }] },
        { name: 'comments', columns: [{ name:'id',type:'SERIAL',pk:true,nn:true },{ name:'post_id',type:'INT',nn:true,fk:'posts.id' },{ name:'user_id',type:'INT',nn:true,fk:'users.id' },{ name:'body',type:'TEXT',nn:true },{ name:'created_at',type:'TIMESTAMP',nn:true }] },
        { name: 'tags', columns: [{ name:'id',type:'SERIAL',pk:true,nn:true },{ name:'name',type:'VARCHAR(255)',nn:true }] },
        { name: 'post_tags', columns: [{ name:'post_id',type:'INT',pk:true,nn:true,fk:'posts.id' },{ name:'tag_id',type:'INT',pk:true,nn:true,fk:'tags.id' }] }
    ],
    ecommerce: [
        { name: 'customers', columns: [{ name:'id',type:'SERIAL',pk:true,nn:true },{ name:'name',type:'VARCHAR(255)',nn:true },{ name:'email',type:'VARCHAR(255)',nn:true },{ name:'phone',type:'VARCHAR(255)' },{ name:'created_at',type:'TIMESTAMP',nn:true }] },
        { name: 'products', columns: [{ name:'id',type:'SERIAL',pk:true,nn:true },{ name:'name',type:'VARCHAR(255)',nn:true },{ name:'description',type:'TEXT' },{ name:'price',type:'DECIMAL(10,2)',nn:true },{ name:'stock',type:'INT',nn:true },{ name:'category_id',type:'INT',fk:'categories.id' }] },
        { name: 'categories', columns: [{ name:'id',type:'SERIAL',pk:true,nn:true },{ name:'name',type:'VARCHAR(255)',nn:true },{ name:'parent_id',type:'INT',fk:'categories.id' }] },
        { name: 'orders', columns: [{ name:'id',type:'SERIAL',pk:true,nn:true },{ name:'customer_id',type:'INT',nn:true,fk:'customers.id' },{ name:'total',type:'DECIMAL(10,2)',nn:true },{ name:'status',type:'VARCHAR(255)',nn:true },{ name:'created_at',type:'TIMESTAMP',nn:true }] },
        { name: 'order_items', columns: [{ name:'id',type:'SERIAL',pk:true,nn:true },{ name:'order_id',type:'INT',nn:true,fk:'orders.id' },{ name:'product_id',type:'INT',nn:true,fk:'products.id' },{ name:'quantity',type:'INT',nn:true },{ name:'price',type:'DECIMAL(10,2)',nn:true }] }
    ],
    saas: [
        { name: 'organizations', columns: [{ name:'id',type:'UUID',pk:true,nn:true },{ name:'name',type:'VARCHAR(255)',nn:true },{ name:'slug',type:'VARCHAR(255)',nn:true },{ name:'plan',type:'VARCHAR(255)',nn:true },{ name:'created_at',type:'TIMESTAMP',nn:true }] },
        { name: 'users', columns: [{ name:'id',type:'UUID',pk:true,nn:true },{ name:'org_id',type:'UUID',nn:true,fk:'organizations.id' },{ name:'email',type:'VARCHAR(255)',nn:true },{ name:'role',type:'VARCHAR(255)',nn:true },{ name:'last_login',type:'TIMESTAMP' }] },
        { name: 'api_keys', columns: [{ name:'id',type:'UUID',pk:true,nn:true },{ name:'org_id',type:'UUID',nn:true,fk:'organizations.id' },{ name:'key_hash',type:'VARCHAR(255)',nn:true },{ name:'name',type:'VARCHAR(255)' },{ name:'expires_at',type:'TIMESTAMP' }] },
        { name: 'audit_logs', columns: [{ name:'id',type:'BIGINT',pk:true,nn:true },{ name:'user_id',type:'UUID',nn:true,fk:'users.id' },{ name:'action',type:'VARCHAR(255)',nn:true },{ name:'resource',type:'VARCHAR(255)' },{ name:'created_at',type:'TIMESTAMP',nn:true }] }
    ]
};

function loadDBPreset(preset) {
    const container = document.getElementById('db-tables');
    container.innerHTML = '';
    dbTableCount = 0;
    (DB_PRESETS[preset] || []).forEach(t => addDBTable(t.name, t.columns));
}

function generateDBSQL() {
    const tableCards = document.querySelectorAll('#db-tables .db-table-card');
    let sql = '';
    const relationships = [];

    tableCards.forEach(card => {
        const tableName = card.querySelector('.db-table-name').value.trim() || 'untitled';
        const colRows = card.querySelectorAll('.db-col-row');
        const pks = [];
        const fks = [];
        let cols = [];

        colRows.forEach(row => {
            const inputs = row.querySelectorAll('input[type="text"]');
            const selects = row.querySelectorAll('select');
            const checks = row.querySelectorAll('input[type="checkbox"]');
            const colName = inputs[0]?.value.trim();
            const colType = selects[0]?.value;
            const isPK = checks[0]?.checked;
            const isNN = checks[1]?.checked;
            const fkRef = inputs[1]?.value.trim();

            if (!colName) return;

            let def = `    ${colName} ${colType}`;
            if (isNN) def += ' NOT NULL';
            if (isPK && pks.length === 0) def += ' PRIMARY KEY';
            cols.push(def);
            if (isPK) pks.push(colName);
            if (fkRef) {
                fks.push({ col: colName, ref: fkRef });
                relationships.push({ from: tableName + '.' + colName, to: fkRef });
            }
        });

        if (!cols.length) return;

        sql += `CREATE TABLE ${tableName} (\n`;
        const allParts = [...cols];
        if (pks.length > 1) allParts.push(`    PRIMARY KEY (${pks.join(', ')})`);
        fks.forEach(fk => {
            const [refTable, refCol] = fk.ref.split('.');
            if (refTable && refCol) allParts.push(`    FOREIGN KEY (${fk.col}) REFERENCES ${refTable}(${refCol})`);
        });
        sql += allParts.join(',\n') + '\n);\n\n';
    });

    document.getElementById('db-output').value = sql;

    // Generate simple ERD text
    let erd = '';
    tableCards.forEach(card => {
        const tableName = card.querySelector('.db-table-name').value.trim() || 'untitled';
        const colRows = card.querySelectorAll('.db-col-row');
        erd += `+${'─'.repeat(30)}+\n`;
        erd += `│ ${tableName.toUpperCase().padEnd(29)}│\n`;
        erd += `+${'─'.repeat(30)}+\n`;
        colRows.forEach(row => {
            const name = row.querySelectorAll('input[type="text"]')[0]?.value.trim();
            const type = row.querySelector('select')?.value;
            const isPK = row.querySelectorAll('input[type="checkbox"]')[0]?.checked;
            if (name) erd += `│ ${isPK ? '🔑 ' : '   '}${(name + ' ' + type).padEnd(27)}│\n`;
        });
        erd += `+${'─'.repeat(30)}+\n\n`;
    });
    if (relationships.length) {
        erd += 'Relationships:\n';
        relationships.forEach(r => erd += `  ${r.from} ──▶ ${r.to}\n`);
    }
    document.getElementById('db-erd').textContent = erd;
}

// ========== API Response Time Visualizer ==========
function loadAPITimingSample() {
    document.getElementById('api-timing-input').value =
        'GET /api/users 45,52,48,120,55,49,51,200,47,53\n' +
        'POST /api/orders 80,95,88,150,92,300,85,90,87,110\n' +
        'GET /api/products 30,35,32,28,40,38,33,31,29,35\n' +
        'GET /api/search 100,120,95,250,110,105,400,115,98,108\n' +
        'PUT /api/users/:id 60,65,70,55,180,62,58,63,59,61\n' +
        'DELETE /api/cache 15,12,18,14,25,13,16,11,20,17';
    renderAPITiming();
}

function percentile(arr, p) {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.ceil(p / 100 * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
}

function renderAPITiming() {
    const input = document.getElementById('api-timing-input').value.trim();
    if (!input) {
        document.getElementById('api-waterfall').innerHTML = '<span style="color:var(--text-muted)">Enter endpoint data above</span>';
        document.getElementById('api-percentiles').innerHTML = '';
        return;
    }

    const endpoints = [];
    input.split('\n').forEach(line => {
        line = line.trim();
        if (!line) return;
        const lastSpace = line.lastIndexOf(' ');
        if (lastSpace === -1) return;
        const name = line.substring(0, lastSpace).trim();
        const values = line.substring(lastSpace + 1).split(',').map(Number).filter(n => !isNaN(n));
        if (values.length) endpoints.push({ name, values });
    });

    if (!endpoints.length) return;

    const globalMax = Math.max(...endpoints.flatMap(e => e.values));
    const colors = ['#6366f1','#22c55e','#f97316','#ef4444','#eab308','#06b6d4','#ec4899','#8b5cf6'];

    // Waterfall
    let waterfall = '';
    endpoints.forEach((ep, i) => {
        const avg = ep.values.reduce((a, b) => a + b, 0) / ep.values.length;
        const p50 = percentile(ep.values, 50);
        const p99 = percentile(ep.values, 99);
        const maxVal = Math.max(...ep.values);
        const pct = (maxVal / globalMax) * 100;
        const avgPct = (avg / globalMax) * 100;
        const color = colors[i % colors.length];

        waterfall += `<div class="waterfall-row">`;
        waterfall += `<div class="waterfall-label" title="${ep.name}">${ep.name}</div>`;
        waterfall += `<div style="flex:1;position:relative;height:28px;background:var(--bg-input);border-radius:4px">`;
        // P50 bar
        waterfall += `<div style="position:absolute;left:0;top:0;height:100%;width:${(p50/globalMax)*100}%;background:${color};opacity:0.8;border-radius:4px 0 0 4px"></div>`;
        // P99 bar (lighter)
        waterfall += `<div style="position:absolute;left:0;top:0;height:100%;width:${(p99/globalMax)*100}%;background:${color};opacity:0.3;border-radius:4px"></div>`;
        // Max marker
        waterfall += `<div style="position:absolute;left:${pct}%;top:0;height:100%;width:2px;background:${color}"></div>`;
        // Label
        waterfall += `<span style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:.7rem;color:var(--text-secondary)">avg ${Math.round(avg)}ms | p99 ${p99}ms</span>`;
        waterfall += `</div></div>`;
    });

    // Legend
    waterfall += `<div style="display:flex;gap:1rem;margin-top:.75rem;font-size:.7rem;color:var(--text-muted)">`;
    waterfall += `<span>&#9632; Solid = P50</span><span>&#9633; Light = P99</span><span>| Line = Max</span>`;
    waterfall += `</div>`;

    document.getElementById('api-waterfall').innerHTML = waterfall;

    // Percentile cards
    let cards = '<div class="percentile-grid">';
    endpoints.forEach((ep, i) => {
        const avg = ep.values.reduce((a, b) => a + b, 0) / ep.values.length;
        const min = Math.min(...ep.values);
        const max = Math.max(...ep.values);
        const p50 = percentile(ep.values, 50);
        const p95 = percentile(ep.values, 95);
        const p99 = percentile(ep.values, 99);
        const color = colors[i % colors.length];
        const stddev = Math.sqrt(ep.values.reduce((s, v) => s + (v - avg) ** 2, 0) / ep.values.length);

        cards += `<div class="percentile-card"><h4 style="color:${color}">${ep.name}</h4>`;
        cards += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:.3rem;font-size:.8rem">`;
        cards += `<div><span style="color:var(--text-muted)">Min:</span> ${min}ms</div>`;
        cards += `<div><span style="color:var(--text-muted)">Max:</span> ${max}ms</div>`;
        cards += `<div><span style="color:var(--text-muted)">Avg:</span> ${Math.round(avg)}ms</div>`;
        cards += `<div><span style="color:var(--text-muted)">StdDev:</span> ${stddev.toFixed(1)}ms</div>`;
        cards += `<div><span style="color:var(--text-muted)">P50:</span> <strong>${p50}ms</strong></div>`;
        cards += `<div><span style="color:var(--text-muted)">P95:</span> <strong style="color:${p95 > avg * 2 ? '#f97316' : 'inherit'}">${p95}ms</strong></div>`;
        cards += `<div><span style="color:var(--text-muted)">P99:</span> <strong style="color:${p99 > avg * 3 ? '#ef4444' : 'inherit'}">${p99}ms</strong></div>`;
        cards += `<div><span style="color:var(--text-muted)">Samples:</span> ${ep.values.length}</div>`;
        cards += `</div></div>`;
    });
    cards += '</div>';
    document.getElementById('api-percentiles').innerHTML = cards;
}

// ========== JSON Diff Visualizer ==========
function loadJsonDiffSample() {
    document.getElementById('jdiff-left').value = JSON.stringify({
        name: "BuildBox",
        version: "1.0.0",
        description: "Developer tools",
        author: "Alice",
        dependencies: { fastapi: "0.104.0", uvicorn: "0.24.0" },
        scripts: { start: "uvicorn main:app", test: "pytest" },
        license: "MIT"
    }, null, 2);
    document.getElementById('jdiff-right').value = JSON.stringify({
        name: "BuildBox",
        version: "2.0.0",
        description: "Developer tools suite",
        maintainer: "Bob",
        dependencies: { fastapi: "0.110.0", uvicorn: "0.27.0", gunicorn: "21.2.0" },
        scripts: { start: "uvicorn main:app", test: "pytest", lint: "ruff check ." },
        private: true
    }, null, 2);
    computeJsonDiff();
}

function swapJsonDiff() {
    const l = document.getElementById('jdiff-left');
    const r = document.getElementById('jdiff-right');
    [l.value, r.value] = [r.value, l.value];
    computeJsonDiff();
}

function deepDiff(a, b, path = '') {
    const diffs = [];

    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) {
        if (a !== b) diffs.push({ type: 'changed', path: path || '(root)', from: a, to: b });
        return diffs;
    }

    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of allKeys) {
        const newPath = path ? `${path}.${key}` : key;
        if (!(key in a)) {
            diffs.push({ type: 'added', path: newPath, value: b[key] });
        } else if (!(key in b)) {
            diffs.push({ type: 'removed', path: newPath, value: a[key] });
        } else if (typeof a[key] === 'object' && a[key] !== null && typeof b[key] === 'object' && b[key] !== null) {
            diffs.push(...deepDiff(a[key], b[key], newPath));
        } else if (a[key] !== b[key]) {
            diffs.push({ type: 'changed', path: newPath, from: a[key], to: b[key] });
        }
    }
    return diffs;
}

function computeJsonDiff() {
    const leftStr = document.getElementById('jdiff-left').value.trim();
    const rightStr = document.getElementById('jdiff-right').value.trim();
    const output = document.getElementById('jdiff-output');
    const summary = document.getElementById('jdiff-summary');

    if (!leftStr || !rightStr) {
        output.innerHTML = '<span style="color:var(--text-muted)">Paste JSON in both fields and click Compare</span>';
        summary.innerHTML = '';
        return;
    }

    let left, right;
    try { left = JSON.parse(leftStr); } catch(e) { output.innerHTML = `<span style="color:#ef4444">Left JSON error: ${e.message}</span>`; return; }
    try { right = JSON.parse(rightStr); } catch(e) { output.innerHTML = `<span style="color:#ef4444">Right JSON error: ${e.message}</span>`; return; }

    const diffs = deepDiff(left, right);

    if (!diffs.length) {
        output.innerHTML = '<span style="color:#22c55e">&#10003; Objects are identical</span>';
        summary.innerHTML = '<span style="color:#22c55e">No differences found</span>';
        return;
    }

    const fmt = (v) => typeof v === 'string' ? `"${v}"` : JSON.stringify(v);

    let html = '';
    diffs.forEach(d => {
        switch (d.type) {
            case 'added':
                html += `<div class="jdiff-added">+ ${d.path}: ${fmt(d.value)}</div>`;
                break;
            case 'removed':
                html += `<div class="jdiff-removed">- ${d.path}: ${fmt(d.value)}</div>`;
                break;
            case 'changed':
                html += `<div class="jdiff-changed">~ ${d.path}: ${fmt(d.from)} → ${fmt(d.to)}</div>`;
                break;
        }
    });

    output.innerHTML = html;

    const added = diffs.filter(d => d.type === 'added').length;
    const removed = diffs.filter(d => d.type === 'removed').length;
    const changed = diffs.filter(d => d.type === 'changed').length;

    summary.innerHTML =
        `<div style="display:flex;gap:1.5rem;font-size:0.9rem;padding:0.5rem">` +
        `<span style="color:#22c55e"><strong>${added}</strong> added</span>` +
        `<span style="color:#ef4444"><strong>${removed}</strong> removed</span>` +
        `<span style="color:#eab308"><strong>${changed}</strong> changed</span>` +
        `<span style="color:var(--text-muted)"><strong>${diffs.length}</strong> total differences</span>` +
        `</div>`;
}

// ========== API Tester ==========
function addAPIHeader(key = '', value = '') {
    const container = document.getElementById('api-headers');
    const row = document.createElement('div');
    row.className = 'api-header-row';
    row.style.cssText = 'display:flex;gap:0.4rem;align-items:center;margin-bottom:0.4rem';
    row.innerHTML = `<input type="text" placeholder="Key" value="${key}" style="flex:1"><input type="text" placeholder="Value" value="${value}" style="flex:1"><button class="btn" onclick="this.parentElement.remove()" style="padding:0.2rem 0.5rem">&times;</button>`;
    container.appendChild(row);
}

function addAPIParam(key = '', value = '') {
    const container = document.getElementById('api-params');
    const row = document.createElement('div');
    row.className = 'api-header-row';
    row.style.cssText = 'display:flex;gap:0.4rem;align-items:center;margin-bottom:0.4rem';
    row.innerHTML = `<input type="text" placeholder="Key" value="${key}" style="flex:1"><input type="text" placeholder="Value" value="${value}" style="flex:1"><button class="btn" onclick="this.parentElement.remove()" style="padding:0.2rem 0.5rem">&times;</button>`;
    container.appendChild(row);
}

function showAPITab(tab) {
    document.querySelectorAll('.api-res-tab').forEach(el => el.style.display = 'none');
    document.getElementById('api-res-' + tab).style.display = 'block';
    const btns = document.querySelector('#panel-apiclient .btn-row');
    if (btns) btns.querySelectorAll('.btn').forEach(b => {
        b.classList.toggle('btn-active', b.textContent.toLowerCase() === tab || (tab === 'body' && b.textContent === 'Body'));
    });
}

const apiHistory = [];

async function sendAPIRequest() {
    const method = document.getElementById('api-method').value;
    let url = document.getElementById('api-url').value.trim();
    if (!url) { alert('Please enter a URL'); return; }

    // Build query params
    const paramRows = document.querySelectorAll('#api-params .api-header-row');
    const params = new URLSearchParams();
    paramRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const k = inputs[0].value.trim();
        const v = inputs[1].value.trim();
        if (k) params.append(k, v);
    });
    const paramStr = params.toString();
    if (paramStr) url += (url.includes('?') ? '&' : '?') + paramStr;

    // Build headers
    const headerRows = document.querySelectorAll('#api-headers .api-header-row');
    const headers = {};
    headerRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const k = inputs[0].value.trim();
        const v = inputs[1].value.trim();
        if (k) headers[k] = v;
    });

    const body = document.getElementById('api-body').value.trim() || null;

    // UI: show loading
    const sendBtn = document.getElementById('api-send-btn');
    const origText = sendBtn.textContent;
    sendBtn.innerHTML = '<span class="api-loading"></span>';
    sendBtn.disabled = true;

    const bar = document.getElementById('api-response-bar');
    bar.style.display = 'none';

    try {
        const startTime = performance.now();
        const res = await fetch('/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, method, headers, body })
        });
        const clientTime = performance.now() - startTime;
        const data = await res.json();

        if (data.error) {
            document.getElementById('api-res-body-text').value = 'Error: ' + data.error;
            document.getElementById('api-res-headers-text').textContent = '';
            document.getElementById('api-res-raw-text').value = JSON.stringify(data, null, 2);
            bar.style.display = 'block';
            const statusEl = document.getElementById('api-res-status');
            statusEl.textContent = res.status + ' Error';
            statusEl.style.background = 'rgba(239,68,68,0.15)';
            statusEl.style.color = '#ef4444';
            document.getElementById('api-res-time').textContent = Math.round(clientTime) + 'ms';
            document.getElementById('api-res-size').textContent = '';
            addToAPIHistory(method, url, res.status);
            return;
        }

        // Status bar
        bar.style.display = 'block';
        const statusEl = document.getElementById('api-res-status');
        statusEl.textContent = data.status + ' ' + (data.status_text || '');
        if (data.status >= 200 && data.status < 300) {
            statusEl.style.background = 'rgba(34,197,94,0.15)'; statusEl.style.color = '#22c55e';
        } else if (data.status >= 400) {
            statusEl.style.background = 'rgba(239,68,68,0.15)'; statusEl.style.color = '#ef4444';
        } else {
            statusEl.style.background = 'rgba(234,179,8,0.15)'; statusEl.style.color = '#eab308';
        }
        document.getElementById('api-res-time').textContent = data.time_ms + 'ms (server) / ' + Math.round(clientTime) + 'ms (total)';

        const sizeKB = (data.size_bytes / 1024).toFixed(1);
        document.getElementById('api-res-size').textContent = data.size_bytes > 1024 ? sizeKB + ' KB' : data.size_bytes + ' B';

        // Body tab
        let bodyText;
        if (typeof data.body === 'object') {
            bodyText = JSON.stringify(data.body, null, 2);
        } else {
            bodyText = data.body;
            try { bodyText = JSON.stringify(JSON.parse(data.body), null, 2); } catch(e) {}
        }
        document.getElementById('api-res-body-text').value = bodyText;

        // Headers tab
        let headersText = '';
        if (data.headers) {
            Object.entries(data.headers).forEach(([k, v]) => {
                headersText += k + ': ' + v + '\n';
            });
        }
        document.getElementById('api-res-headers-text').textContent = headersText;

        // Raw tab
        document.getElementById('api-res-raw-text').value = JSON.stringify(data, null, 2);

        showAPITab('body');
        addToAPIHistory(method, url, data.status);

    } catch (e) {
        document.getElementById('api-res-body-text').value = 'Network Error: ' + e.message;
        bar.style.display = 'block';
        const statusEl = document.getElementById('api-res-status');
        statusEl.textContent = 'Error';
        statusEl.style.background = 'rgba(239,68,68,0.15)';
        statusEl.style.color = '#ef4444';
        addToAPIHistory(method, url, 0);
    } finally {
        sendBtn.textContent = origText;
        sendBtn.disabled = false;
    }
}

function addToAPIHistory(method, url, status) {
    apiHistory.unshift({ method, url, status, time: new Date() });
    if (apiHistory.length > 20) apiHistory.pop();
    renderAPIHistory();
}

function renderAPIHistory() {
    const container = document.getElementById('api-history');
    container.innerHTML = apiHistory.map((h, i) => {
        const methodColor = { GET: '#22c55e', POST: '#6366f1', PUT: '#f97316', PATCH: '#eab308', DELETE: '#ef4444' }[h.method] || 'var(--text)';
        const statusColor = h.status >= 200 && h.status < 300 ? '#22c55e' : h.status >= 400 ? '#ef4444' : '#eab308';
        return `<div class="history-item" onclick="loadAPIHistoryItem(${i})"><span class="history-method" style="color:${methodColor}">${h.method}</span><span class="history-url">${h.url}</span><span class="history-status" style="color:${statusColor}">${h.status || 'ERR'}</span></div>`;
    }).join('');
}

function loadAPIHistoryItem(idx) {
    const item = apiHistory[idx];
    if (!item) return;
    document.getElementById('api-method').value = item.method;
    document.getElementById('api-url').value = item.url;
}

// ========== Hash Routing ==========
function loadFromHash() {
    const hash = location.hash.slice(1);
    if (hash && document.getElementById('panel-' + hash)) {
        switchTool(hash);
        return true;
    }
    return false;
}

window.addEventListener('hashchange', loadFromHash);

// ========== Init ==========
document.addEventListener('DOMContentLoaded', () => {
    injectCodeGenerators();

    if (!loadFromHash()) {
        try {
            const last = localStorage.getItem('buildbox-last-tool');
            if (last && document.getElementById('panel-' + last)) {
                switchTool(last);
            }
        } catch(e) {}
    }

    generateUUIDs();
    colorFromPicker();
    loadMockPreset('user');
    addGHAJob();
    calcRateLimit();
    generateCommitMsg();
    addDBTable();
});
