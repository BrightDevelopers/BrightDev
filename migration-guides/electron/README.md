# Electron to HTML/JavaScript/Node.js Migration Guide

This guide provides a comprehensive roadmap for migrating your Electron desktop application to native HTML/JavaScript/Node.js that runs directly on BrightSign players. The migration process involves refactoring your application's architecture, replacing Electron-specific APIs with BrightSign-compatible alternatives, and optimizing for performance and compatibility on the BrightSign platform.

**🤖 AI-First Migration**: This guide is designed for AI-assisted migration. Instead of manually executing steps, you'll work with AI agents (like Claude via the BrightDeveloper MCP) to automate the entire migration process. For machine-readable patterns and automation schemas, see [CLAUDE.md](CLAUDE.md).

If you have not set up the BrightDeveloper MCP Server yet, follow the instructions in the [Installing the MCP server](https://github.com/BrightDevelopers/BrightDev/blob/main/README.md#install-the-brightsign-mcp-server) section of the main BrightDev README file.

> Note that not everything generated using AI agents and the BrightDeveloper MCP may be perfect on the first try. You may need to iterate with the AI, provide additional context, or make manual adjustments as needed.

> **Before you begin:** This guide defaults to the Chromium media player on Series 5 devices, which supports modern web APIs (service workers, Cache API, IndexedDB, etc.). If your app needs HDMI input, RTSP/UDP streams, frame-accurate sync, chroma key, or Series 4 support, read [Media Player Selection](../media-player-selection.md) first.

---

## ⚠️ Important: Why Not Use roElectron on BrightSign?

While BrightSign Series 5 players offer a `roElectron` object, **we strongly recommend migrating your Electron application to native HTML/JavaScript/Node.js v18.18.2** instead of using `roElectron`. Here's why:

### roElectron Limitations

BrightSign's `roElectron` implementation has significant limitations that will impact your application:

- ❌ **Cannot use BrightSign asset pool** - No efficient media caching
- ❌ **Legacy BrightSign JavaScript objects won't work** - Limited platform integration
- ⚠️ **Uses Chromium media player only** - Full modern web API support (service workers, Cache API, IndexedDB), but no BrightSign-native media playback features
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

## Getting Started with AI-Assisted Migration

Follow the detailed AI prompt in the migration method guide:
- **[Method 1: Refactor & Replace →](method1-refactor.md)**

## Tips for Best Results

1. **Provide Complete Information**: Fill in all placeholders accurately - helps AI make correct decisions
2. **Check All Applicable Items**: The more accurate your checklist, the better the migration plan
3. **Describe Your App's Purpose**: Context helps AI understand priorities and make smart choices
4. **Mention Critical Features**: Highlight features that absolutely must work
5. **Specify Target Hardware**: Knowing the BrightSign model helps optimize for that platform
6. **Review Generated Code**: Check that refactored code maintains your app's logic
7. **Test Incrementally**: Validate each phase before moving to the next
8. **Use Local Browser First**: Test with mocked BrightSign APIs in Chrome/Edge before deploying
9. **Leverage Remote Debugging**: Use Chrome DevTools with `inspector_server` for BrightSign debugging
10. **Ask Questions**: If AI's approach seems unclear, request explanations or alternatives

---

## Troubleshooting

See [troubleshooting.md](troubleshooting.md) for common migration issues and solutions.

---

## Resources

- [BrightSign JavaScript API Documentation](https://docs.brightsign.biz/developers/javascript-apis/)
- [BrightSign Node.js Support](https://docs.brightsign.biz/developers/nodejs)
- [BrightSign Developer Cookbook](https://github.com/brightsign/dev-cookbook)
