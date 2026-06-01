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

    try { localStorage.setItem('devforge-last-tool', tool); } catch(e) {}
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
    if (!loadFromHash()) {
        try {
            const last = localStorage.getItem('devforge-last-tool');
            if (last && document.getElementById('panel-' + last)) {
                switchTool(last);
            }
        } catch(e) {}
    }

    generateUUIDs();
    colorFromPicker();
});
