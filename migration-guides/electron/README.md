# Electron to HTML/JavaScript/Node.js Migration Guide

**🤖 AI-First Migration**: This guide is designed for AI-assisted migration. Instead of manually executing steps, you'll work with AI agents (like Claude via the BrightDeveloper MCP) to automate the entire migration process. For machine-readable patterns and automation schemas, see [CLAUDE.md](CLAUDE.md).

If you have not set up the BrightDeveloper MCP Server yet, follow the instructions in the [Installing the MCP server](https://github.com/BrightDevelopers/BrightDev/blob/main/README.md#install-the-brightsign-mcp-server) section of the main BrightDev README file.

> Note that not everything generated using AI agents and the BrightDeveloper MCP may be perfect on the first try. You may need to iterate with the AI, provide additional context, or make manual adjustments as needed.

---

## ⚠️ Important: Why Not Use roElectron on BrightSign?

While BrightSign Series 5 players offer a `roElectron` object, **we strongly recommend migrating your Electron application to native HTML/JavaScript/Node.js v18.18.2** instead of using `roElectron`. Here's why:

### roElectron Limitations

BrightSign's `roElectron` implementation has significant limitations that will impact your application:

- ❌ **Cannot use BrightSign asset pool** - No efficient media caching
- ❌ **Legacy BrightSign JavaScript objects won't work** - Limited platform integration
- ❌ **Cannot use BrightSign Media Player** - Stuck with basic Chromium media player only
- ❌ **Virtual Keyboard won't work** - No on-screen keyboard support
- ❌ **Proxy configuration ignored** - Network proxy settings don't apply
- ❌ **No BrightSign-specific user agent keywords** - Harder to detect device type
- ❌ **BSMessagePort unavailable** - Limited inter-process communication
- ⚠️ **Only available on Series 5 players** - No support for Series 4 and earlier

### Native HTML/JS/Node.js Benefits

Migrating to native HTML/JavaScript/Node.js v18.18.2 provides:

- ✅ **Full BrightSign API access** - Use all `@brightsign/*` device APIs
- ✅ **Better performance** - Optimized for BrightSign's Chromium engine
- ✅ **Comprehensive support** - Regularly tested and updated by BrightSign
- ✅ **Works on all modern BrightSign players** - Series 4 and Series 5 compatible
- ✅ **Simpler architecture** - Single process instead of Electron's main + renderer
- ✅ **Easier debugging** - Standard Chrome DevTools support
- ✅ **Better documentation** - Extensive BrightSign developer resources
- ✅ **Smaller deployment size** - No Electron framework overhead

---

## Overview

This guide helps you migrate your **Electron desktop application** to **native HTML/JavaScript/Node.js v18.18.2** that runs directly on BrightSign players with full platform support.

**Migration Approach:**
- **[Method 1: Refactor & Replace](method1-refactor.md)** - Systematic replacement of Electron APIs

**Timeline**: 2-4 weeks (depending on application complexity)  
**Target Platform**: BrightSign OS with Node.js v18.18.2 and Chromium engine

---

## Key Differences: Electron vs. BrightSign HTML/JS/Node.js

### Architecture Transformation

**Before (Electron):**
```
┌────────────────────────────────────────────┐
│       Electron Application (Desktop)       │
│                                            │
│  ┌──────────────┐       ┌──────────────┐   │
│  │   Renderer   │       │     Main     │   │
│  │   Process    │◄─IPC─►│   Process    │   │
│  │ (Chromium)   │       │  (Node.js)   │   │
│  └──────────────┘       └──────────────┘   │
└────────────────────────────────────────────┘
```

**After (BrightSign):**
```
┌────────────────────────────────────────────┐
│     BrightSign Chromium + Node.js v18      │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │   Single Process Application         │  │
│  │                                      │  │
│  │   HTML/CSS/JS + Node.js APIs +       │  │
│  │   BrightSign Device APIs             │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

### What Changes

| Electron Feature | BrightSign Replacement |
|-----------------|------------------------|
| **Multi-process architecture** (Main + Renderer) | **Single-process** HTML/JS with Node.js |
| IPC communication (`ipcRenderer`, `ipcMain`) | Direct function calls or event system |
| `BrowserWindow` | HTML page loaded via `autorun.brs` with `roHtmlWidget` or `nodejs_enabled` |
| `electron.app` | Node.js process management |
| `electron.dialog` | Custom HTML modals or web APIs (`alert`, `confirm`, `prompt`) |
| `electron.Menu` | Custom HTML menus |
| `electron.Notification` | Web Notifications API or custom UI |
| `electron.remote` | Not needed (single process) |
| Preload scripts | Not needed (single process) |
| Context isolation | Not applicable (single process) |
| Native file dialogs | HTML `<input type="file">` or custom UI |
| System tray | Not available on BrightSign |
| Auto-updater | Custom update mechanism via HTTP |
| Native keyboard shortcuts | Browser keyboard event handlers |

---

## Common API Replacements

### Process & Application Management

| Electron API | BrightSign/Node.js Equivalent |
|-------------|------------------------------|
| `app.quit()` | `process.exit(0)` |
| `app.getPath('userData')` | `process.env.HOME` or `/storage/sd/` paths |
| `app.getVersion()` | Read from `package.json` or environment variable |
| `app.getName()` | Read from `package.json` |
| `app.whenReady()` | `DOMContentLoaded` event or Node.js initialization |

### Window Management

| Electron API | BrightSign Equivalent |
|-------------|----------------------|
| `new BrowserWindow({ width, height })` | CSS styling, `window.resizeTo()` (limited), or BrightSign video mode configuration |
| `win.loadURL()` / `win.loadFile()` | Direct HTML file loading via `autorun.brs` |
| `win.show()` / `win.hide()` | CSS `display: none` or `visibility: hidden` |
| `win.maximize()` / `win.fullscreen()` | BrightSign always fullscreen; CSS can simulate |
| `win.close()` | `window.close()` or `process.exit()` |
| `win.on('close', callback)` | `window.addEventListener('beforeunload', callback)` |

### Inter-Process Communication (IPC)

| Electron API | BrightSign Equivalent |
|-------------|----------------------|
| `ipcRenderer.send()` | Not needed - direct function calls |
| `ipcRenderer.invoke()` | Not needed - direct async function calls |
| `ipcMain.on()` | Not needed - single process |
| `ipcMain.handle()` | Not needed - single process |
| Preload script APIs | Not needed - single process with full Node.js access |

### Native Dialogs

| Electron API | BrightSign Equivalent |
|-------------|----------------------|
| `dialog.showOpenDialog()` | HTML `<input type="file">` |
| `dialog.showSaveDialog()` | Node.js `fs.writeFile()` with custom UI |
| `dialog.showMessageBox()` | Custom HTML modal or `window.alert()` / `window.confirm()` |
| `dialog.showErrorBox()` | Custom HTML error modal or `console.error()` |

### Native Menus & Context Menus

| Electron API | BrightSign Equivalent |
|-------------|----------------------|
| `Menu.buildFromTemplate()` | Custom HTML/CSS menu component |
| `Menu.setApplicationMenu()` | Not applicable (no native menu bar) |
| Context menu | Custom HTML context menu with `contextmenu` event |

### Notifications

| Electron API | BrightSign Equivalent |
|-------------|----------------------|
| `new Notification()` (Electron's) | Web Notifications API `new Notification()` or custom HTML overlay |
| `notification.show()` | `notification.show()` or custom UI display |

### File System

| Electron API | BrightSign/Node.js Equivalent |
|-------------|------------------------------|
| `fs` module (Node.js) | ✅ Same - Node.js `fs` module works directly |
| `path` module (Node.js) | ✅ Same - Node.js `path` module works directly |
| `app.getPath('userData')` | `/storage/sd/` or custom directory |
| File drag & drop (renderer) | HTML5 Drag and Drop API |

### Device & System Information

| Electron API | BrightSign Equivalent |
|-------------|----------------------|
| `process.platform` | `process.platform` (Node.js) or BrightSign DeviceInfo API |
| `os.platform()` | `const DeviceInfo = require('@brightsign/deviceinfo'); new DeviceInfo().model` |
| `app.getSystemLocale()` | `navigator.language` or BrightSign LocaleInfo API |
| `screen.getPrimaryDisplay()` | BrightSign VideoOutput API or `window.screen` |

### Networking

| Electron API | BrightSign Equivalent |
|-------------|----------------------|
| `net.request()` (Electron) | Standard `fetch()` API or Node.js `https` module |
| `session.defaultSession` | Not needed - use standard HTTP client |

---

## Quick Decision Guide

| Your Situation | Recommendation |
|---------------|----------------|
| **Simple Electron app** (< 10 files, basic UI) | Direct refactor - 1-2 weeks |
| **Medium complexity** (Multiple windows, IPC, some native features) | Systematic refactor - 2-3 weeks |
| **Complex app** (Heavy IPC, native integrations, background processes) | Phased refactor - 3-4 weeks |

**All paths lead to the same goal**: Native HTML/JS/Node.js v18.18.2 application optimized for BrightSign.

---

## Prerequisites

Before starting the migration:

- ✅ **Your Electron application source code** - Full access to all files
- ✅ **BrightDeveloper MCP Server connected** - For AI-assisted migration
- ✅ **Understanding of your app's architecture** - Document main features and workflows (use Step 1 AI prompt below if needed)
- ✅ **List of Electron APIs used** - Run a search for `require('electron')` in your codebase
- ✅ **Node.js v18.18.2 compatibility** - Check if your current Node.js code works on v18.18.2

---

## Getting Started with AI-Assisted Migration

### Step 1: Analyze Your Electron Application

**Use this AI prompt to inventory your app:**

```
Analyze my Electron application and provide a comprehensive inventory:

1. Count and list all Electron API usage (grep for 'electron', 'ipcRenderer', 'ipcMain', 'BrowserWindow', 'remote')
2. Extract all dependencies from package.json
3. Identify the main process entry point and all renderer processes
4. Map out IPC communication patterns (what messages are sent between processes)
5. List all native features used (dialogs, menus, notifications, system tray, auto-updater)
6. Identify all preload scripts and their purposes
7. Document the window management strategy (single window, multiple windows)
8. Flag any platform-specific code (Windows/Mac/Linux differences)
9. Assess Node.js version compatibility with v18.18.2
10. Estimate migration complexity (LOW/MEDIUM/HIGH)

Provide results in a structured format with specific file paths and line numbers.
```

### Step 2: Start AI-Driven Migration

Follow the detailed AI prompt in the migration method guide:
- **[Method 1: Refactor & Replace →](method1-refactor.md)**

---

## Resources

- [BrightSign JavaScript API Documentation](https://docs.brightsign.biz/developers/javascript-apis/)
- [BrightSign Node.js Support](https://docs.brightsign.biz/developers/nodejs)
- [BrightSign Developer Cookbook](https://github.com/brightsign/dev-cookbook)

---

## Troubleshooting

See [troubleshooting.md](troubleshooting.md) for common migration issues and solutions.

---

## Need Help?

- Report issues: [GitHub Issues](https://github.com/BrightDevelopers/BrightDev/issues)
- Submit questions: [BrightSign Support Community](https://support.brightsign.biz/hc/en-us/community/topics)
- Send an email to `integrations@brightsign.biz` with any questions

---

**Ready to migrate?** → [Start with Method 1: Refactor & Replace](method1-refactor.md)
