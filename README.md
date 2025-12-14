# ⚡ Auto Accept Agent

**Tired of babysitting your AI?**

Auto Accept Agent automatically handles those repetitive "Accept", "Run", and "Confirm" actions so you can focus on the code, not the UI.

---

## 🎯 Supported Platforms

| Platform | Method | Setup |
|----------|--------|-------|
| **VS Code / Antigravity** | Extension (automatic) | ⭐ Easy |
| **Cursor IDE** | Console Script | ⭐ Easy |

---

## 📦 Installation

### For VS Code / Antigravity

1. Install from VS Code Marketplace: Search for `Auto Accept Agent`
2. Or install `.vsix` manually: Extensions → `...` → `Install from VSIX`
3. Click the status bar item to toggle ON/OFF

**That's it!** The extension automatically detects and accepts AI suggestions.

---

### For Cursor IDE

When you toggle the extension ON in Cursor, it will:
1. **Copy the auto-accept script** to your clipboard
2. **Open DevTools** automatically

Then just:
1. Type `allow pasting` in the Console and press Enter
2. Paste the script (Ctrl+V) and press Enter
3. Done! ✅

**Controls** (in Console):
```javascript
autoAccept.start()   // Start auto-accepting
autoAccept.stop()    // Stop
autoAccept.toggle()  // Toggle on/off
autoAccept.status()  // Show click count
```

---

## ⚙️ How It Works

### VS Code Extension
- Polls for available accept commands every second
- Executes registered VS Code commands
- Works with Antigravity, Copilot, and VS Code Chat

### Cursor Script
- Scans DOM for buttons with text like "Accept", "Run", "Apply"
- Simulates mouse events to click them
- Excludes dangerous buttons (Skip, Cancel, Reject, etc.)

---

## ⚠️ Disclaimer

**Use at your own risk.** Auto-accepting AI-generated code without review can introduce bugs. Best suited for:
- Small projects and prototypes
- Trusted AI models
- Development environments

Always review critical code changes manually.

---

## 📁 Files

| File | Purpose |
|------|---------|
| `extension.js` | Main VS Code extension |
| `cursor-console-script.js` | Script for Cursor (copied to clipboard) |

---

## 🙏 Credits

Cursor script inspired by [TRUE YOLO MODE](https://github.com/ivalsaraj/true-yolo-cursor-auto-accept-full-agentic-mode) by @ivalsaraj.

---

## License

MIT
