const vscode = require('vscode');

class SettingsPanel {
    static currentPanel = undefined;
    static viewType = 'autoAllSettings';

    static createOrShow(extensionUri, context, mode = 'settings') {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (SettingsPanel.currentPanel) {

            SettingsPanel.currentPanel.panel.reveal(column);
            SettingsPanel.currentPanel.updateMode(mode);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            SettingsPanel.viewType,
            mode === 'prompt' ? 'auto-all-Antigravity' : 'auto-all-Antigravity Settings',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
                retainContextWhenHidden: true
            }
        );

        SettingsPanel.currentPanel = new SettingsPanel(panel, extensionUri, context, mode);
    }

    static showUpgradePrompt(context) {
        SettingsPanel.createOrShow(context.extensionUri, context, 'prompt');
    }

    constructor(panel, extensionUri, context, mode) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.context = context;
        this.mode = mode;
        this.disposables = [];

        this.update();

        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

        this.panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'setFrequency':
                        if (this.isPro()) {
                            await this.context.globalState.update('auto-all-frequency', message.value);
                            vscode.commands.executeCommand('auto-all.updateFrequency', message.value);
                        }
                        break;
                    case 'getStats':
                        this.sendStats();
                        break;
                    case 'getROIStats':
                        this.sendROIStats();
                        break;
                    case 'updateBannedCommands':
                        if (this.isPro()) {
                            await this.context.globalState.update('auto-all-banned-commands', message.commands);
                            vscode.commands.executeCommand('auto-all.updateBannedCommands', message.commands);
                        }
                        break;
                    case 'getBannedCommands':
                        this.sendBannedCommands();
                        break;
                    case 'upgrade':

                        this.openUpgrade(message.promoCode);
                        this.startPolling(this.getUserId());
                        break;
                    case 'checkPro':
                        this.handleCheckPro();
                        break;
                    case 'dismissPrompt':
                        await this.handleDismiss();
                        break;
                }
            },
            null,
            this.disposables
        );
    }

    async handleDismiss() {

        const now = Date.now();
        await this.context.globalState.update('auto-all-lastDismissedAt', now);
        this.dispose();
    }

    async handleCheckPro() {

        vscode.window.showInformationMessage('All Pro features are already unlocked!');
    }

    isPro() {
        return true;
    }

    getUserId() {
        let userId = this.context.globalState.get('auto-all-userId');
        if (!userId) {

            userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            this.context.globalState.update('auto-all-userId', userId);
        }
        return userId;
    }

    openUpgrade(promoCode) {

    }

    updateMode(mode) {
        this.mode = mode;
        this.panel.title = mode === 'prompt' ? 'auto-all-Antigravity Agent' : 'auto-all-Antigravity Settings';
        this.update();
    }

    sendStats() {
        const stats = this.context.globalState.get('auto-all-stats', {
            clicks: 0,
            sessions: 0,
            lastSession: null
        });
        const isPro = this.isPro();

        const frequency = isPro ? this.context.globalState.get('auto-all-frequency', 1000) : 300;

        this.panel.webview.postMessage({
            command: 'updateStats',
            stats,
            frequency,
            isPro
        });
    }

    async sendROIStats() {
        try {
            const roiStats = await vscode.commands.executeCommand('auto-all.getROIStats');
            this.panel.webview.postMessage({
                command: 'updateROIStats',
                roiStats
            });
        } catch (e) {

        }
    }

    sendBannedCommands() {
        const defaultBannedCommands = [
            'rm -rf /',
            'rm -rf ~',
            'rm -rf *',
            'format c:',
            'del /f /s /q',
            'rmdir /s /q',
            ':(){:|:&};:',
            'dd if=',
            'mkfs.',
            '> /dev/sda',
            'chmod -R 777 /'
        ];
        const bannedCommands = this.context.globalState.get('auto-all-banned-commands', defaultBannedCommands);
        this.panel.webview.postMessage({
            command: 'updateBannedCommands',
            bannedCommands
        });
    }

    update() {
        this.panel.webview.html = this.getHtmlContent();
        setTimeout(() => {
            this.sendStats();
            this.sendROIStats();
        }, 100);
    }

    getHtmlContent() {
        const isPro = this.isPro();
        const isPrompt = this.mode === 'prompt';

        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap');
            
            :root {
                --bg: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
                --card-bg: rgba(255, 255, 255, 0.95);
                --card-glass: rgba(255, 255, 255, 0.85);
                --card-shadow: 0 8px 32px rgba(102, 126, 234, 0.25), 0 4px 16px rgba(0,0,0,0.1);
                --card-shadow-hover: 0 20px 60px rgba(102, 126, 234, 0.35), 0 8px 24px rgba(0,0,0,0.15);
                --border: rgba(255, 255, 255, 0.6);
                --border-hover: rgba(102, 126, 234, 0.8);
                --accent: #667eea;
                --accent-secondary: #764ba2;
                --accent-light: #818cf8;
                --accent-glow: rgba(102, 126, 234, 0.4);
                --accent-soft: rgba(102, 126, 234, 0.15);
                --green: #10b981;
                --green-light: #34d399;
                --green-soft: rgba(16, 185, 129, 0.15);
                --cyan: #06b6d4;
                --pink: #ec4899;
                --orange: #f97316;
                --fg: #1e1b4b;
                --fg-dim: rgba(30, 27, 75, 0.7);
                --fg-muted: rgba(30, 27, 75, 0.5);
                --font: 'Inter', system-ui, -apple-system, sans-serif;
            }

            * { box-sizing: border-box; margin: 0; padding: 0; }

            body {
                font-family: var(--font);
                background: var(--bg);
                background-attachment: fixed;
                color: var(--fg);
                margin: 0;
                padding: 40px 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 100vh;
                position: relative;
                overflow-x: hidden;
            }

            body::before {
                content: '';
                position: fixed;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: 
                    radial-gradient(circle at 20% 80%, rgba(240, 147, 251, 0.3) 0%, transparent 40%),
                    radial-gradient(circle at 80% 20%, rgba(102, 126, 234, 0.3) 0%, transparent 40%),
                    radial-gradient(circle at 50% 50%, rgba(118, 75, 162, 0.2) 0%, transparent 50%);
                animation: float 20s ease-in-out infinite;
                pointer-events: none;
            }
            
            @keyframes float {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                33% { transform: translate(30px, -30px) rotate(3deg); }
                66% { transform: translate(-20px, 20px) rotate(-3deg); }
            }
            
            @keyframes shimmer {
                0% { background-position: -200% center; }
                100% { background-position: 200% center; }
            }
            
            @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
                50% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.5), 0 0 60px rgba(240, 147, 251, 0.3); }
            }
            
            @keyframes gradient-shift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }

            .container {
                max-width: ${isPrompt ? '500px' : '720px'};
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 24px;
                position: relative;
                z-index: 1;
            }

            .header {
                text-align: center;
                margin-bottom: 16px;
                padding: 24px;
                background: var(--card-glass);
                backdrop-filter: blur(20px);
                border-radius: 24px;
                border: 1px solid var(--border);
                box-shadow: var(--card-shadow);
            }
            .header h1 {
                font-size: 36px;
                font-weight: 800;
                margin: 0;
                letter-spacing: -1px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
                background-size: 200% 200%;
                animation: gradient-shift 5s ease infinite;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .subtitle {
                color: var(--fg-dim);
                font-size: 14px;
                margin-top: 10px;
                font-weight: 500;
            }

            .pro-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: linear-gradient(135deg, var(--green) 0%, var(--cyan) 100%);
                color: white;
                font-size: 11px;
                font-weight: 700;
                padding: 6px 14px;
                border-radius: 20px;
                margin-top: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            }

            .section {
                background: var(--card-glass);
                backdrop-filter: blur(20px);
                border: 1px solid var(--border);
                border-radius: 20px;
                padding: 28px;
                box-shadow: var(--card-shadow);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .section:hover {
                border-color: var(--border-hover);
                box-shadow: var(--card-shadow-hover);
                transform: translateY(-4px);
            }
            .section-label {
                color: var(--accent);
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                margin-bottom: 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .section-label span:last-child {
                color: var(--fg-muted);
                font-weight: 500;
                font-size: 11px;
            }

            .impact-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            .impact-card {
                background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
                border: 1px solid rgba(102, 126, 234, 0.2);
                border-radius: 16px;
                padding: 24px 20px;
                text-align: center;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }
            .impact-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                transition: left 0.5s;
            }
            .impact-card:hover::before {
                left: 100%;
            }
            .impact-card:hover {
                border-color: var(--accent);
                box-shadow: 0 8px 30px rgba(102, 126, 234, 0.25);
                transform: translateY(-4px) scale(1.02);
            }
            .impact-card.green { border-bottom: 3px solid var(--green); }
            .impact-card.purple { border-bottom: 3px solid var(--accent); }
            .impact-card.pink { border-bottom: 3px solid var(--pink); }
            .impact-card.orange { border-bottom: 3px solid var(--orange); }
            
            .stat-val {
                font-size: 40px;
                font-weight: 800;
                line-height: 1;
                margin-bottom: 10px;
                font-variant-numeric: tabular-nums;
            }
            .stat-val.green { color: var(--green); }
            .stat-val.purple { color: var(--accent); }
            .stat-val.pink { color: var(--pink); }
            .stat-val.orange { color: var(--orange); }
            
            .stat-label {
                font-size: 11px;
                color: var(--fg-dim);
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1.2px;
            }

            input[type="range"] {
                width: 100%;
                height: 8px;
                border-radius: 4px;
                background: linear-gradient(90deg, var(--accent) 0%, var(--accent-secondary) 100%);
                -webkit-appearance: none;
                appearance: none;
                opacity: 0.3;
            }
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%);
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.5);
                border: 3px solid white;
                transition: all 0.2s ease;
            }
            input[type="range"]::-webkit-slider-thumb:hover {
                transform: scale(1.15);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            }
            
            textarea {
                width: 100%;
                min-height: 130px;
                background: rgba(255,255,255,0.8);
                border: 2px solid rgba(102, 126, 234, 0.2);
                border-radius: 14px;
                color: var(--fg);
                font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
                font-size: 13px;
                padding: 16px;
                resize: vertical;
                outline: none;
                transition: all 0.3s ease;
            }
            textarea:focus { 
                border-color: var(--accent);
                background: rgba(255,255,255,0.95);
                box-shadow: 0 0 0 4px var(--accent-glow), 0 8px 30px rgba(102, 126, 234, 0.2);
            }

            .btn-primary {
                background: linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 50%, var(--pink) 100%);
                background-size: 200% 200%;
                animation: gradient-shift 3s ease infinite;
                color: white;
                border: none;
                padding: 16px 28px;
                border-radius: 14px;
                font-weight: 700;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                text-decoration: none;
                box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .btn-primary:hover {
                transform: translateY(-3px) scale(1.02);
                box-shadow: 0 15px 45px rgba(102, 126, 234, 0.5);
            }
            .btn-primary:active {
                transform: translateY(-1px) scale(0.98);
            }
            
            .btn-outline {
                background: rgba(255,255,255,0.8);
                border: 2px solid rgba(102, 126, 234, 0.3);
                color: var(--accent);
                padding: 14px 24px;
                border-radius: 14px;
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .btn-outline:hover {
                background: var(--accent-soft);
                border-color: var(--accent);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.25);
                transform: translateY(-2px);
            }

            .link-secondary {
                color: white;
                cursor: pointer;
                text-decoration: none;
                font-size: 13px;
                display: block;
                text-align: center;
                margin-top: 16px;
                font-weight: 500;
                transition: all 0.2s ease;
                opacity: 0.9;
            }
            .link-secondary:hover { 
                opacity: 1;
                text-shadow: 0 0 20px rgba(255,255,255,0.5);
            }

            .prompt-card {
                background: var(--card-glass);
                backdrop-filter: blur(30px);
                border: 1px solid var(--border);
                border-radius: 28px;
                padding: 48px;
                text-align: center;
                box-shadow: 0 30px 60px rgba(0,0,0,0.15);
                animation: pulse-glow 3s ease-in-out infinite;
            }
            .prompt-title { 
                font-size: 28px; 
                font-weight: 800; 
                margin-bottom: 16px; 
                letter-spacing: -0.5px;
                background: linear-gradient(135deg, var(--green) 0%, var(--cyan) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .prompt-text { 
                font-size: 15px; 
                color: var(--fg-dim); 
                line-height: 1.8; 
                margin-bottom: 32px; 
            }

            .footer {
                background: var(--card-glass);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                border: 1px solid var(--border);
                padding: 24px;
                text-align: center;
            }
            .footer a {
                transition: all 0.3s ease;
                text-decoration: none;
                font-weight: 600;
            }
            .footer a:hover {
                transform: scale(1.05);
            }
            .footer-brand {
                opacity: 0.5;
                font-size: 11px;
                letter-spacing: 1px;
                margin-top: 12px;
            }
        `;

        if (isPrompt) {

            return `<!DOCTYPE html>
            <html>
            <head><style>${css}</style></head>
            <body>
                <div class="container">
                    <div class="prompt-card">
                        <div style="font-size: 32px; margin-bottom: 20px;">✅</div>
                        <div class="prompt-title">All Features Unlocked!</div>
                        <div class="prompt-text">
                            All Pro features are enabled for free.<br/><br/>
                            <strong style="color: var(--green); opacity: 1;">Enjoy unlimited auto-all functionality!</strong>
                        </div>
                        <a class="btn-primary" onclick="dismiss()" style="cursor: pointer;">
                            Continue
                        </a>
                    </div>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    function dismiss() {
                        vscode.postMessage({ command: 'dismissPrompt' });
                    }
                </script>
            </body>
            </html>`;
        }

        return `<!DOCTYPE html>
        <html>
        <head><style>${css}</style></head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>auto-all-Antigravity</h1>
                    <div class="subtitle">Multi-agent automation for AntiGravity</div>
                    <div class="pro-badge">✨ All Features Unlocked</div>
                </div>

                <!-- All Pro features enabled -->

                <div class="section">
                    <div class="section-label">
                        <span>📊 IMPACT DASHBOARD</span>
                        <span>Resets Sunday</span>
                    </div>
                    <div class="impact-grid">
                        <div class="impact-card green">
                            <div class="stat-val green" id="roiClickCount">0</div>
                            <div class="stat-label">Clicks Saved</div>
                        </div>
                        <div class="impact-card purple">
                            <div class="stat-val purple" id="roiTimeSaved">0m</div>
                            <div class="stat-label">Time Saved</div>
                        </div>
                        <div class="impact-card pink">
                            <div class="stat-val pink" id="roiSessionCount">0</div>
                            <div class="stat-label">Sessions</div>
                        </div>
                        <div class="impact-card orange">
                            <div class="stat-val orange" id="roiBlockedCount">0</div>
                            <div class="stat-label">Blocked</div>
                        </div>
                    </div>
                </div>

                <div class="section" id="performanceSection">
                    <div class="section-label">
                        <span>⚡ PERFORMANCE MODE</span>
                        <span class="val-display" id="freqVal" style="color: var(--accent); font-weight: 700;">...</span>
                    </div>
                    <div>
                        <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 12px; font-weight: 600; color: var(--fg-dim);">⚡ Instant</span>
                            <div style="flex: 1;"><input type="range" id="freqSlider" min="200" max="3000" step="100" value="1000"></div>
                            <span style="font-size: 12px; font-weight: 600; color: var(--fg-dim);">🔋 Battery</span>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-label">🛡️ SAFETY RULES</div>
                    <div style="font-size: 13px; color: var(--fg-dim); margin-bottom: 18px; line-height: 1.6;">
                        Patterns that will <strong>NEVER</strong> be auto-alled.
                    </div>
                    <textarea id="bannedCommandsInput" 
                        placeholder="rm -rf /&#10;format c:&#10;del /f /s /q"></textarea>
                    
                    <div style="display: flex; gap: 14px; margin-top: 22px;">
                        <button id="saveBannedBtn" class="btn-primary" style="flex: 2;">
                            💾 Update Rules
                        </button>
                        <button id="resetBannedBtn" class="btn-outline" style="flex: 1;">
                            ↺ Reset
                        </button>
                    </div>
                    <div id="bannedStatus" style="font-size: 12px; margin-top: 14px; text-align: center; height: 18px; font-weight: 600;"></div>
                </div>

                <div class="footer">
                    <div style="display: flex; justify-content: center; gap: 32px; margin-bottom: 14px;">
                        <a href="https://ko-fi.com/ai_dev_2024" class="footer-link">☕ Support Development</a>
                        <a href="https://github.com/ai-dev-2024/AUTO-ALL-AntiGravity" class="footer-link">GitHub</a>
                    </div>
                    <div class="footer-brand">
                        Open Source • All Features Free • Made with ❤️
                    </div>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                function refreshStats() {
                    vscode.postMessage({ command: 'getStats' });
                    vscode.postMessage({ command: 'getROIStats' });
                }

                const refreshInterval = setInterval(refreshStats, 5000);

                const slider = document.getElementById('freqSlider');
                const valDisplay = document.getElementById('freqVal');
                
                if (slider) {
                    slider.addEventListener('input', (e) => {
                         const s = (e.target.value/1000).toFixed(1) + 's';
                         valDisplay.innerText = s;
                         vscode.postMessage({ command: 'setFrequency', value: e.target.value });
                    });
                }

                const bannedInput = document.getElementById('bannedCommandsInput');
                const saveBannedBtn = document.getElementById('saveBannedBtn');
                const resetBannedBtn = document.getElementById('resetBannedBtn');
                const bannedStatus = document.getElementById('bannedStatus');

                const defaultBannedCommands = ["rm -rf /", "rm -rf ~", "rm -rf *", "format c:", "del /f /s /q", "rmdir /s /q", ":(){:|:&};:", "dd if=", "mkfs.", "> /dev/sda", "chmod -R 777 /"];

                if (saveBannedBtn) {
                    saveBannedBtn.addEventListener('click', () => {
                        const lines = bannedInput.value.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
                        vscode.postMessage({ command: 'updateBannedCommands', commands: lines });
                        bannedStatus.innerText = '✓ Safety Rules Updated';
                        bannedStatus.style.color = 'var(--green)';
                        setTimeout(() => { bannedStatus.innerText = ''; }, 3000);
                    });
                }

                if (resetBannedBtn) {
                    resetBannedBtn.addEventListener('click', () => {
                        bannedInput.value = defaultBannedCommands.join('\\n');
                        vscode.postMessage({ command: 'updateBannedCommands', commands: defaultBannedCommands });
                        bannedStatus.innerText = '✓ Defaults Restored';
                        bannedStatus.style.color = 'var(--accent)';
                        setTimeout(() => { bannedStatus.innerText = ''; }, 3000);
                    });
                }

                function animateCountUp(element, target, duration = 1200, suffix = '') {
                    const currentVal = parseInt(element.innerText.replace(/[^0-9]/g, '')) || 0;
                    if (currentVal === target && !suffix) return;
                    
                    const startTime = performance.now();
                    function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
                    
                    function update(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const current = Math.round(currentVal + (target - currentVal) * easeOutExpo(progress));
                        element.innerText = current + suffix;
                        if (progress < 1) requestAnimationFrame(update);
                    }
                    requestAnimationFrame(update);
                }
                
                window.addEventListener('message', e => {
                    const msg = e.data;
                    if (msg.command === 'updateStats') {
                        if (slider && !${!isPro}) {
                            slider.value = msg.frequency;
                            valDisplay.innerText = (msg.frequency/1000).toFixed(1) + 's';
                        }
                    }
                    if (msg.command === 'updateROIStats') {
                        const roi = msg.roiStats;
                        if (roi) {
                            animateCountUp(document.getElementById('roiClickCount'), roi.clicksThisWeek || 0);
                            animateCountUp(document.getElementById('roiSessionCount'), roi.sessionsThisWeek || 0);
                            animateCountUp(document.getElementById('roiBlockedCount'), roi.blockedThisWeek || 0);
                            document.getElementById('roiTimeSaved').innerText = roi.timeSavedFormatted || '0m';
                        }
                    }
                    if (msg.command === 'updateBannedCommands') {
                        if (bannedInput && msg.bannedCommands) {
                            bannedInput.value = msg.bannedCommands.join('\\n');
                        }
                    }
                });

                refreshStats();
                vscode.postMessage({ command: 'getBannedCommands' });
            </script>
        </body>
        </html>`;
    }

    dispose() {
        SettingsPanel.currentPanel = undefined;
        if (this.pollTimer) clearInterval(this.pollTimer);
        this.panel.dispose();
        while (this.disposables.length) {
            const d = this.disposables.pop();
            if (d) d.dispose();
        }
    }

    async checkProStatus() {
        return true;
    }

    startPolling() {

    }
}

module.exports = { SettingsPanel };
