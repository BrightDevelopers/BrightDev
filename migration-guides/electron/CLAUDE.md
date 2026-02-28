# AI Migration Instructions for Electron to HTML/JavaScript/Node.js (BrightSign)

> **Purpose**: This file contains machine-readable instructions, automation rules, and transformation patterns for AI systems performing automated migration of Electron desktop applications to HTML/JavaScript/Node.js v18.18.2 for BrightSign platforms.
>
> **Human-Readable Guide**: See [README.md](README.md) for the main documentation.

---

## Document Metadata

```json
{
  "document_type": "ai_migration_instructions",
  "version": "1.0",
  "target_platform": "brightsign",
  "source_platform": "electron",
  "automation_level": "full_auto_with_placeholders",
  "primary_method": "refactor_and_replace",
  "recommended_method": "refactor_and_replace",
  "target_nodejs_version": "18.18.2",
  "target_runtime": "chromium_brightsign",
  "note": "Electron's roElectron has severe limitations on BrightSign. Native HTML/JS/Node.js is strongly recommended."
}
```

---

## Migration Strategy

```json
{
  "migration_approach": {
    "strategy": "refactor_and_replace",
    "difficulty": "medium",
    "time_to_first_run": "2-4 weeks",
    "maintenance_complexity": "low",
    "debugging_ease": "high",
    "brightsign_recommendation": "strongly_recommended",
    "production_ready": true,
    "key_transformations": [
      "merge_main_and_renderer_processes",
      "remove_electron_ipc",
      "replace_browserwindow_with_html",
      "replace_native_dialogs_with_web_apis",
      "remove_electron_imports",
      "add_brightsign_device_apis",
      "update_webpack_for_single_process"
    ]
  }
}
```

---

## Architecture Transformation Rules

### Rule 1: Merge Multi-Process to Single Process

```json
{
  "rule_id": "merge_electron_processes",
  "description": "Electron uses separate main (Node.js) and renderer (Chromium) processes. BrightSign uses a single process combining both.",
  "transformation_steps": [
    {
      "step": "identify_main_process_file",
      "pattern": "main.js / index.js referenced in package.json 'main' field",
      "action": "Extract all business logic from main process"
    },
    {
      "step": "identify_renderer_process_files",
      "pattern": "Files loaded via BrowserWindow.loadFile() or loadURL()",
      "action": "Keep HTML/CSS/JS, integrate with main process logic"
    },
    {
      "step": "eliminate_ipc",
      "pattern": "ipcRenderer.invoke() / ipcMain.handle() pairs",
      "action": "Replace with direct function calls or event emitters"
    },
    {
      "step": "merge_code",
      "action": "Move main process logic into renderer context or create shared modules"
    }
  ]
}
```

### Rule 2: Remove Electron Imports

```json
{
  "rule_id": "remove_electron_imports",
  "patterns_to_detect": [
    "const { app, BrowserWindow, ipcMain } = require('electron')",
    "const electron = require('electron')",
    "import { app, BrowserWindow } from 'electron'",
    "require('electron').remote",
    "@electron/remote"
  ],
  "transformation": {
    "action": "remove_import_and_replace_usages",
    "replacement_strategy": "see_api_mapping_table"
  }
}
```

---

## Electron to BrightSign API Mapping Table

```json
{
  "api_mappings": [
    {
      "category": "application_lifecycle",
      "electron_api": "app.whenReady()",
      "brightsign_replacement": "DOMContentLoaded event",
      "code_pattern": {
        "electron": "app.whenReady().then(() => { createWindow(); });",
        "brightsign": "document.addEventListener('DOMContentLoaded', () => { initializeApp(); });"
      },
      "notes": "In single-process model, use DOM ready event for initialization"
    },
    {
      "category": "application_lifecycle",
      "electron_api": "app.quit()",
      "brightsign_replacement": "process.exit()",
      "code_pattern": {
        "electron": "app.quit();",
        "brightsign": "process.exit(0);"
      }
    },
    {
      "category": "application_lifecycle",
      "electron_api": "app.getName() / app.getVersion()",
      "brightsign_replacement": "package.json parsing",
      "code_pattern": {
        "electron": "const name = app.getName(); const version = app.getVersion();",
        "brightsign": "const pkg = require('./package.json'); const name = pkg.name; const version = pkg.version;"
      }
    },
    {
      "category": "application_lifecycle",
      "electron_api": "app.getPath('userData')",
      "brightsign_replacement": "BrightSign storage paths",
      "code_pattern": {
        "electron": "const userDataPath = app.getPath('userData');",
        "brightsign": "const userDataPath = '/storage/sd/appdata';"
      },
      "notes": "BrightSign uses specific storage paths: /storage/sd/ for SD card"
    },
    {
      "category": "window_management",
      "electron_api": "BrowserWindow",
      "brightsign_replacement": "HTML page via autorun.brs",
      "code_pattern": {
        "electron": "const win = new BrowserWindow({ width: 800, height: 600 }); win.loadFile('index.html');",
        "brightsign": "Configure in autorun.brs to load index.html directly. Window is fullscreen by default."
      },
      "notes": "BrightSign loads HTML directly; no programmatic window creation needed"
    },
    {
      "category": "window_management",
      "electron_api": "win.show() / win.hide()",
      "brightsign_replacement": "CSS display property",
      "code_pattern": {
        "electron": "win.hide();",
        "brightsign": "document.body.style.display = 'none'; // or use visibility: hidden"
      }
    },
    {
      "category": "window_management",
      "electron_api": "win.close()",
      "brightsign_replacement": "process.exit() or window.close()",
      "code_pattern": {
        "electron": "win.close();",
        "brightsign": "window.close(); // or process.exit(0);"
      }
    },
    {
      "category": "window_management",
      "electron_api": "win.webContents.send()",
      "brightsign_replacement": "Direct function call or EventTarget",
      "code_pattern": {
        "electron": "mainWindow.webContents.send('update-data', data);",
        "brightsign": "// Direct call: updateData(data); // Or custom event: window.dispatchEvent(new CustomEvent('update-data', { detail: data }));"
      },
      "notes": "No IPC needed in single-process architecture"
    },
    {
      "category": "ipc_communication",
      "electron_api": "ipcRenderer.send() / ipcRenderer.on()",
      "brightsign_replacement": "Direct function calls or custom events",
      "code_pattern": {
        "electron": "// Renderer: ipcRenderer.send('save-file', data); // Main: ipcMain.on('save-file', (event, data) => { fs.writeFileSync('file.txt', data); });",
        "brightsign": "// Direct call: function saveFile(data) { fs.writeFileSync('file.txt', data); } saveFile(data);"
      },
      "notes": "Single process eliminates need for IPC"
    },
    {
      "category": "ipc_communication",
      "electron_api": "ipcRenderer.invoke() / ipcMain.handle()",
      "brightsign_replacement": "Direct async function calls",
      "code_pattern": {
        "electron": "// Renderer: const result = await ipcRenderer.invoke('fetch-data'); // Main: ipcMain.handle('fetch-data', async () => { return await fetchFromAPI(); });",
        "brightsign": "// Direct call: async function fetchData() { return await fetchFromAPI(); } const result = await fetchData();"
      },
      "notes": "Replace IPC invoke pattern with direct async calls"
    },
    {
      "category": "ipc_communication",
      "electron_api": "electron.remote",
      "brightsign_replacement": "Not needed (single process)",
      "code_pattern": {
        "electron": "const { dialog } = require('electron').remote;",
        "brightsign": "// Direct access to all APIs without remote"
      },
      "notes": "remote module is deprecated in Electron and not needed in single process"
    },
    {
      "category": "dialogs",
      "electron_api": "dialog.showOpenDialog()",
      "brightsign_replacement": "HTML file input",
      "code_pattern": {
        "electron": "const result = await dialog.showOpenDialog({ properties: ['openFile'] });",
        "brightsign": "// HTML: <input type='file' id='fileInput'> // JS: document.getElementById('fileInput').addEventListener('change', (e) => { const file = e.target.files[0]; });"
      },
      "notes": "Use HTML5 file input for file selection"
    },
    {
      "category": "dialogs",
      "electron_api": "dialog.showSaveDialog()",
      "brightsign_replacement": "Custom UI + fs.writeFile()",
      "code_pattern": {
        "electron": "const result = await dialog.showSaveDialog({ defaultPath: 'file.txt' });",
        "brightsign": "// Custom UI to get filename, then: const fs = require('fs'); fs.writeFileSync('/storage/sd/file.txt', content);"
      },
      "notes": "Implement custom save dialog UI"
    },
    {
      "category": "dialogs",
      "electron_api": "dialog.showMessageBox()",
      "brightsign_replacement": "Custom HTML modal or window.confirm()",
      "code_pattern": {
        "electron": "await dialog.showMessageBox({ type: 'info', message: 'Hello!' });",
        "brightsign": "// Simple: window.alert('Hello!'); // Or custom modal: showCustomModal('Hello!');"
      },
      "notes": "Use web APIs or create custom modal components"
    },
    {
      "category": "menus",
      "electron_api": "Menu.buildFromTemplate()",
      "brightsign_replacement": "Custom HTML/CSS menu",
      "code_pattern": {
        "electron": "const menu = Menu.buildFromTemplate([{ label: 'File', submenu: [...] }]); Menu.setApplicationMenu(menu);",
        "brightsign": "// Create custom HTML menu: <nav><ul><li>File</li></ul></nav> // With CSS and JavaScript for interactivity"
      },
      "notes": "BrightSign has no native menu bar; implement custom HTML menus"
    },
    {
      "category": "menus",
      "electron_api": "Menu context menu",
      "brightsign_replacement": "Custom context menu with contextmenu event",
      "code_pattern": {
        "electron": "const contextMenu = Menu.buildFromTemplate([...]); win.webContents.on('context-menu', (e) => { contextMenu.popup(); });",
        "brightsign": "window.addEventListener('contextmenu', (e) => { e.preventDefault(); showCustomContextMenu(e.pageX, e.pageY); });"
      }
    },
    {
      "category": "notifications",
      "electron_api": "new Notification()",
      "brightsign_replacement": "Web Notifications API or custom UI",
      "code_pattern": {
        "electron": "new Notification('Title', { body: 'Message' });",
        "brightsign": "// Web API: new Notification('Title', { body: 'Message' }); // Or custom: showToast('Message');"
      },
      "notes": "Web Notifications API available, or create custom notification UI"
    },
    {
      "category": "file_system",
      "electron_api": "fs module (Node.js)",
      "brightsign_replacement": "Same - Node.js fs module",
      "code_pattern": {
        "electron": "const fs = require('fs'); fs.readFileSync('file.txt', 'utf8');",
        "brightsign": "const fs = require('fs'); fs.readFileSync('/storage/sd/file.txt', 'utf8');"
      },
      "notes": "fs module works the same; adjust paths for BrightSign storage locations"
    },
    {
      "category": "file_system",
      "electron_api": "path module (Node.js)",
      "brightsign_replacement": "Same - Node.js path module",
      "code_pattern": {
        "electron": "const path = require('path'); path.join(__dirname, 'file.txt');",
        "brightsign": "const path = require('path'); path.join(__dirname, 'file.txt');"
      },
      "notes": "path module works the same"
    },
    {
      "category": "device_info",
      "electron_api": "process.platform / os.platform()",
      "brightsign_replacement": "BrightSign DeviceInfo API",
      "code_pattern": {
        "electron": "const platform = process.platform; // 'win32', 'darwin', 'linux'",
        "brightsign": "const DeviceInfo = require('@brightsign/deviceinfo'); const deviceInfo = new DeviceInfo(); const model = deviceInfo.model; // 'XT1144', etc."
      },
      "notes": "Use BrightSign device APIs for platform-specific information"
    },
    {
      "category": "device_info",
      "electron_api": "app.getSystemLocale()",
      "brightsign_replacement": "navigator.language or BrightSign LocaleInfo",
      "code_pattern": {
        "electron": "const locale = app.getSystemLocale();",
        "brightsign": "const locale = navigator.language; // or BrightSign LocaleInfo API"
      }
    },
    {
      "category": "device_info",
      "electron_api": "screen.getPrimaryDisplay()",
      "brightsign_replacement": "window.screen or BrightSign VideoOutput",
      "code_pattern": {
        "electron": "const { width, height } = screen.getPrimaryDisplay().size;",
        "brightsign": "const width = window.screen.width; const height = window.screen.height; // Or use BrightSign VideoOutput API for detailed video mode info"
      }
    },
    {
      "category": "networking",
      "electron_api": "net.request() (Electron specific)",
      "brightsign_replacement": "fetch() API or Node.js https module",
      "code_pattern": {
        "electron": "const request = net.request('https://api.example.com'); request.on('response', (response) => { ... });",
        "brightsign": "// fetch API: const response = await fetch('https://api.example.com'); const data = await response.json(); // Or Node.js: const https = require('https');"
      },
      "notes": "Use standard web fetch() or Node.js networking modules"
    },
    {
      "category": "power_management",
      "electron_api": "powerSaveBlocker",
      "brightsign_replacement": "BrightSign power management",
      "code_pattern": {
        "electron": "const id = powerSaveBlocker.start('prevent-display-sleep');",
        "brightsign": "// BrightSign players are designed for 24/7 operation; typically no sleep mode"
      },
      "notes": "BrightSign handles power management at system level"
    },
    {
      "category": "auto_update",
      "electron_api": "electron-updater",
      "brightsign_replacement": "Custom HTTP update mechanism",
      "code_pattern": {
        "electron": "autoUpdater.checkForUpdatesAndNotify();",
        "brightsign": "// Implement custom update check: async function checkForUpdates() { const response = await fetch('https://update-server.com/version'); const latestVersion = await response.json(); // Compare versions and download if needed }"
      },
      "notes": "Implement custom update mechanism using HTTP and file replacement"
    },
    {
      "category": "system_tray",
      "electron_api": "Tray",
      "brightsign_replacement": "Not available",
      "code_pattern": {
        "electron": "const tray = new Tray('icon.png');",
        "brightsign": "// System tray not applicable to BrightSign players; remove or replace with in-app UI"
      },
      "notes": "BrightSign players run fullscreen applications; no system tray"
    },
    {
      "category": "keyboard_shortcuts",
      "electron_api": "globalShortcut",
      "brightsign_replacement": "window keyboard event listeners",
      "code_pattern": {
        "electron": "globalShortcut.register('CommandOrControl+Q', () => { app.quit(); });",
        "brightsign": "window.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'q') { process.exit(0); } });"
      },
      "notes": "Use browser keyboard event handlers instead of global shortcuts"
    },
    {
      "category": "native_image",
      "electron_api": "nativeImage",
      "brightsign_replacement": "HTML Image or Canvas API",
      "code_pattern": {
        "electron": "const icon = nativeImage.createFromPath('icon.png');",
        "brightsign": "// HTML: <img src='icon.png'> // Or Canvas API for manipulation"
      }
    },
    {
      "category": "clipboard",
      "electron_api": "clipboard (Electron)",
      "brightsign_replacement": "Clipboard API (Web)",
      "code_pattern": {
        "electron": "const { clipboard } = require('electron'); clipboard.writeText('text');",
        "brightsign": "// Modern web API: navigator.clipboard.writeText('text'); // Legacy: document.execCommand('copy');"
      },
      "notes": "Use Web Clipboard API"
    },
    {
      "category": "shell",
      "electron_api": "shell.openExternal()",
      "brightsign_replacement": "window.open() or child_process",
      "code_pattern": {
        "electron": "shell.openExternal('https://example.com');",
        "brightsign": "window.open('https://example.com'); // Or for system commands: const { exec } = require('child_process');"
      }
    },
    {
      "category": "brightsign_specific",
      "electron_api": "N/A",
      "brightsign_api": "@brightsign/deviceinfo",
      "code_pattern": {
        "brightsign": "const DeviceInfo = require('@brightsign/deviceinfo'); const deviceInfo = new DeviceInfo(); console.log('Model:', deviceInfo.model, 'Serial:', deviceInfo.serialNumber);"
      },
      "notes": "BrightSign-specific device information"
    },
    {
      "category": "brightsign_specific",
      "electron_api": "N/A",
      "brightsign_api": "@brightsign/videooutput",
      "code_pattern": {
        "brightsign": "const VideoOutput = require('@brightsign/videooutput'); const video = new VideoOutput(); // Advanced video control"
      },
      "notes": "BrightSign video output control for advanced playback"
    },
    {
      "category": "brightsign_specific",
      "electron_api": "N/A",
      "brightsign_api": "@brightsign/networkinterface",
      "code_pattern": {
        "brightsign": "const NetworkInterface = require('@brightsign/networkinterface'); const netConfig = new NetworkInterface(); // Network configuration"
      },
      "notes": "BrightSign network configuration APIs"
    }
  ]
}
```

---

## Code Transformation Patterns

### Pattern 1: Remove Electron Main Process

```json
{
  "rule": "merge_main_process_into_renderer",
  "steps": [
    {
      "detect": "Main process file (typically main.js or electron.js)",
      "pattern": "File with app.whenReady(), BrowserWindow creation",
      "extract": [
        "Application initialization logic",
        "IPC handlers (ipcMain.handle, ipcMain.on)",
        "File system operations",
        "Business logic functions"
      ]
    },
    {
      "action": "Move business logic to shared modules",
      "note": "Create separate modules for reusable logic"
    },
    {
      "action": "Convert IPC handlers to direct functions",
      "example": {
        "before": "ipcMain.handle('read-file', async (event, path) => { return fs.readFileSync(path, 'utf8'); });",
        "after": "function readFile(path) { return fs.readFileSync(path, 'utf8'); }"
      }
    },
    {
      "action": "Remove window creation code",
      "note": "BrightSign loads HTML directly via autorun.brs"
    }
  ]
}
```

### Pattern 2: Convert Renderer Process IPC Calls

```json
{
  "rule": "convert_ipc_calls_to_direct_calls",
  "detect": {
    "patterns": [
      "ipcRenderer.send(",
      "ipcRenderer.invoke(",
      "ipcRenderer.on("
    ]
  },
  "transformation": {
    "ipcRenderer.invoke": {
      "before": "const result = await ipcRenderer.invoke('fetch-data', arg1, arg2);",
      "after": "const result = await fetchData(arg1, arg2); // Direct function call",
      "steps": [
        "Find corresponding ipcMain.handle() in main process",
        "Extract the handler function",
        "Make it available in renderer context (import or global)",
        "Replace invoke call with direct function call"
      ]
    },
    "ipcRenderer.send": {
      "before": "ipcRenderer.send('save-data', data);",
      "after": "saveData(data); // Direct function call or event dispatch",
      "steps": [
        "Find corresponding ipcMain.on() listener",
        "Extract the handler function",
        "Replace send with direct call or custom event"
      ]
    },
    "ipcRenderer.on": {
      "before": "ipcRenderer.on('update-ui', (event, data) => { updateUI(data); });",
      "after": "// Use custom events: window.addEventListener('update-ui-event', (e) => { updateUI(e.detail); });",
      "alternative": "// Or direct function call: updateUI(data);"
    }
  }
}
```

### Pattern 3: Replace BrowserWindow with HTML

```json
{
  "rule": "replace_browserwindow",
  "electron_code": {
    "main_process": "const win = new BrowserWindow({ width: 1920, height: 1080, fullscreen: true }); win.loadFile('index.html');"
  },
  "brightsign_replacement": {
    "autorun_brs": "sub Main()\n  url$ = \"file:///sd:/index.html\"\n  h = CreateObject(\"roHtmlWidget\", { port: 2999 })\n  h.Show()\n  h.SetUrl({ url: url$ })\nend sub",
    "alternative_nodejs": "sub Main()\n  config = { nodejs_enabled: true, nodejs_main_script: \"app.js\", inspector_server: 2999 }\n  h = CreateObject(\"roHtmlWidget\", config)\n  h.Show()\n  h.SetUrl({ url: \"http://localhost:3000\" })\nend sub"
  },
  "notes": "BrightSign loads HTML via autorun.brs configuration, not programmatically"
}
```

### Pattern 4: Replace Native Dialogs

```json
{
  "rule": "replace_electron_dialogs",
  "transformations": [
    {
      "electron_api": "dialog.showOpenDialog",
      "replacement": "HTML file input",
      "implementation": {
        "html": "<input type='file' id='fileInput' />",
        "javascript": "document.getElementById('fileInput').addEventListener('change', (e) => { const file = e.target.files[0]; if (file) { processFile(file); } });"
      }
    },
    {
      "electron_api": "dialog.showMessageBox",
      "replacement": "Custom modal component",
      "implementation": {
        "simple": "window.alert('Message'); // or window.confirm('Question?');",
        "advanced": "function showModal(title, message, buttons) { /* Create custom HTML modal */ }"
      }
    },
    {
      "electron_api": "dialog.showErrorBox",
      "replacement": "Custom error modal or console",
      "implementation": {
        "simple": "console.error('Error message'); window.alert('Error: ' + message);",
        "advanced": "function showErrorModal(error) { /* Custom error UI */ }"
      }
    }
  ]
}
```

### Pattern 5: Remove Preload Scripts

```json
{
  "rule": "remove_preload_scripts",
  "reason": "Preload scripts bridge main and renderer processes with context isolation. Single-process architecture doesn't need this.",
  "steps": [
    {
      "action": "Identify preload script",
      "pattern": "BrowserWindow({ webPreferences: { preload: path.join(__dirname, 'preload.js') } })"
    },
    {
      "action": "Extract exposed APIs from preload",
      "pattern": "contextBridge.exposeInMainWorld('api', { ... });"
    },
    {
      "action": "Make APIs directly available",
      "note": "Move functions to shared modules and import directly"
    },
    {
      "action": "Delete preload script file",
      "note": "No longer needed in single-process architecture"
    }
  ]
}
```

---

## Webpack Configuration Transformation

### Rule: Convert from Multi-Config to Single Config

```json
{
  "rule": "webpack_single_process_config",
  "electron_webpack": {
    "description": "Electron requires separate webpack configs for main and renderer",
    "configs": ["main process config (target: electron-main)", "renderer process config (target: electron-renderer)", "preload script config (target: electron-preload)"],
    "externals_pattern": "{ 'electron': 'commonjs2 electron', 'fs': 'commonjs2 fs', ... }"
  },
  "brightsign_webpack": {
    "description": "BrightSign uses single webpack config for browser-like environment",
    "config": "single config (target: 'web' or omit)",
    "externals_pattern": "{ '@brightsign/deviceinfo': 'commonjs2 @brightsign/deviceinfo', '@brightsign/videooutput': 'commonjs2 @brightsign/videooutput', ... }",
    "required_externals": [
      "@brightsign/deviceinfo",
      "@brightsign/videooutput",
      "@brightsign/networkinterface",
      "@brightsign/screenshot",
      "@brightsign/messageport",
      "@brightsign/serialport",
      "@brightsign/gpio",
      "fs",
      "path",
      "crypto",
      "http",
      "https"
    ]
  },
  "transformation_example": {
    "before": "module.exports = [ /* main config */, /* renderer config */ ];",
    "after": "module.exports = { target: 'web', entry: './src/app.js', output: { path: __dirname + '/dist', filename: 'bundle.js' }, externals: { '@brightsign/deviceinfo': 'commonjs2 @brightsign/deviceinfo', 'fs': 'commonjs2 fs' } };"
  }
}
```

---

## Migration Validation Framework

```json
{
  "validation_framework": {
    "pre_migration_checks": [
      {
        "check_id": "detect_electron_usage",
        "description": "Find all Electron API usage",
        "command": "grep -r \"require('electron')\" src/",
        "validation": "All Electron imports identified and documented",
        "failure_action": "AI_QUESTION: Document all Electron API usage before proceeding"
      },
      {
        "check_id": "identify_ipc_patterns",
        "description": "Map all IPC communication",
        "patterns": ["ipcRenderer.send", "ipcRenderer.invoke", "ipcMain.on", "ipcMain.handle"],
        "validation": "Complete IPC communication map created",
        "failure_action": "Document IPC patterns for replacement strategy"
      },
      {
        "check_id": "assess_native_dependencies",
        "description": "Check for native Node modules",
        "examples": ["serialport", "sqlite3", "node-pty"],
        "validation": "All native dependencies identified",
        "failure_action": "AI_PLACEHOLDER: Check Node.js v18.18.2 compatibility"
      },
      {
        "check_id": "nodejs_version_check",
        "description": "Verify Node.js v18.18.2 compatibility",
        "command": "nvm use 18.18.2 && npm install && npm test",
        "validation": "App runs on Node.js v18.18.2",
        "failure_action": "Update code for Node.js v18.18.2 compatibility"
      }
    ],
    "compilation_checks": [
      {
        "check_id": "webpack_build_success",
        "command": "npm run build",
        "validation": "Webpack builds without errors",
        "failure_action": "AI_PLACEHOLDER: Fix webpack configuration errors"
      },
      {
        "check_id": "no_electron_dependencies",
        "description": "Ensure no Electron dependencies remain",
        "command": "grep 'electron' package.json",
        "validation": "No electron packages in dependencies",
        "failure_action": "Remove electron and @electron packages from package.json"
      }
    ],
    "runtime_checks": [
      {
        "check_id": "local_browser_test",
        "description": "Test in Chrome/Edge browser locally",
        "validation": "App runs in standard browser without errors",
        "failure_action": "AI_PLACEHOLDER: Fix browser compatibility issues"
      },
      {
        "check_id": "brightsign_api_mocked",
        "description": "Mock BrightSign APIs for local development",
        "validation": "App runs with mocked BrightSign APIs",
        "failure_action": "Create mock implementations for @brightsign/* modules"
      },
      {
        "check_id": "brightsign_device_test",
        "description": "Test on actual BrightSign player",
        "validation": "App runs on BrightSign hardware",
        "failure_action": "AI_PLACEHOLDER: Debug BrightSign-specific issues"
      }
    ],
    "brightsign_specific_checks": [
      {
        "check_id": "autorun_brs_configured",
        "description": "Verify autorun.brs launches app correctly",
        "validation": "autorun.brs exists and configured properly",
        "required_fields": ["nodejs_enabled or roHtmlWidget", "url or nodejs_main_script", "inspector_server for debugging"],
        "failure_action": "AI_PLACEHOLDER: Create autorun.brs from template"
      },
      {
        "check_id": "storage_paths_correct",
        "description": "Verify file paths use BrightSign storage locations",
        "patterns": ["/storage/sd/", "/storage/usb1/"],
        "validation": "All file operations use correct BrightSign paths",
        "failure_action": "Update file paths for BrightSign storage structure"
      },
      {
        "check_id": "brightsign_apis_work",
        "description": "Test BrightSign device APIs",
        "apis_to_test": ["DeviceInfo", "VideoOutput (if used)", "NetworkInterface (if used)"],
        "validation": "All BrightSign APIs return expected data",
        "failure_action": "AI_PLACEHOLDER: Debug BrightSign API integration"
      }
    ]
  }
}
```

---

## Common Pitfalls and Solutions

```json
{
  "common_pitfalls": [
    {
      "pitfall": "Forgetting to remove require('electron') imports",
      "impact": "Runtime error: module 'electron' not found",
      "solution": "Search entire codebase for 'electron' and remove all imports",
      "detection": "grep -r \"require.*electron\" ."
    },
    {
      "pitfall": "Not merging main + renderer processes properly",
      "impact": "IPC calls fail, app doesn't work",
      "solution": "Systematically replace all IPC with direct function calls",
      "detection": "Search for ipcRenderer and ipcMain usage"
    },
    {
      "pitfall": "Using ES modules in Node.js code without configuration",
      "impact": "Node.js v18.18.2 may require explicit ESM configuration",
      "solution": "Use CommonJS (require/module.exports) or configure package.json with { \"type\": \"module\" }",
      "note": "BrightSign Node.js v18.18.2 uses CommonJS by default"
    },
    {
      "pitfall": "Not externalizing BrightSign APIs in webpack",
      "impact": "Webpack tries to bundle native modules, build fails",
      "solution": "Add all @brightsign/* modules to webpack externals",
      "example": "externals: { '@brightsign/deviceinfo': 'commonjs2 @brightsign/deviceinfo' }"
    },
    {
      "pitfall": "Using hardcoded file paths from desktop environment",
      "impact": "File operations fail on BrightSign",
      "solution": "Use BrightSign storage paths: /storage/sd/, /storage/usb1/",
      "example": "Change '/home/user/data' to '/storage/sd/data'"
    },
    {
      "pitfall": "Expecting desktop window features (minimize, maximize, drag)",
      "impact": "These features don't exist on BrightSign",
      "solution": "Remove window chrome, BrightSign runs fullscreen by default",
      "note": "Design UI for fullscreen, always-on display"
    },
    {
      "pitfall": "Not creating autorun.brs file",
      "impact": "App won't launch on BrightSign",
      "solution": "Create autorun.brs to configure app startup",
      "template": "See autorun.brs template in examples"
    },
    {
      "pitfall": "Using deprecated Node.js APIs",
      "impact": "Code may not run on Node.js v18.18.2",
      "solution": "Update to modern Node.js v18 compatible APIs",
      "check": "Review Node.js v18 migration guide"
    }
  ]
}
```

---

## Example Transformation: Complete App

```json
{
  "example": "complete_electron_to_brightsign_transformation",
  "scenario": "Simple Electron app with file operations and IPC",
  "electron_structure": {
    "files": [
      "main.js (main process)",
      "renderer.js (renderer process)",
      "preload.js (preload script)",
      "index.html",
      "package.json"
    ]
  },
  "brightsign_structure": {
    "files": [
      "app.js (merged main + renderer logic)",
      "index.html",
      "package.json",
      "webpack.config.js",
      "autorun.brs",
      "dist/ (webpack output)"
    ]
  },
  "transformation_summary": [
    "Merged main.js and renderer.js into app.js",
    "Removed preload.js (not needed)",
    "Replaced ipcRenderer.invoke with direct async function calls",
    "Removed all electron imports",
    "Added BrightSign device API usage",
    "Configured webpack with BrightSign externals",
    "Created autorun.brs for BrightSign deployment",
    "Updated file paths to use /storage/sd/"
  ]
}
```

---

## AI Automation Instructions

```json
{
  "ai_instructions": {
    "methodology": "systematic_refactoring",
    "process": [
      {
        "phase": "1_analysis",
        "tasks": [
          "Scan codebase for all require('electron') imports",
          "Map all IPC communication patterns",
          "Identify main process and renderer process files",
          "Document preload script APIs (if any)",
          "List all Electron-specific APIs used",
          "Check Node.js version compatibility"
        ]
      },
      {
        "phase": "2_architecture_refactor",
        "tasks": [
          "Merge main process logic into renderer context or shared modules",
          "Eliminate all IPC communication",
          "Convert ipcRenderer.invoke to direct async function calls",
          "Convert ipcRenderer.send to direct function calls or events",
          "Remove BrowserWindow creation code",
          "Delete preload scripts"
        ]
      },
      {
        "phase": "3_api_replacement",
        "tasks": [
          "Replace app.whenReady with DOMContentLoaded",
          "Replace app.quit with process.exit",
          "Replace dialog.showOpenDialog with <input type='file'>",
          "Replace dialog.showMessageBox with custom modal or window.alert",
          "Replace Menu with custom HTML menus",
          "Replace Notification with Web API or custom UI",
          "Update file paths for BrightSign storage"
        ]
      },
      {
        "phase": "4_brightsign_integration",
        "tasks": [
          "Add @brightsign/deviceinfo for device information",
          "Add other BrightSign APIs as needed (videooutput, networkinterface, etc.)",
          "Implement async initialization for BrightSign APIs",
          "Create mocks for local development"
        ]
      },
      {
        "phase": "5_build_configuration",
        "tasks": [
          "Convert multi-config webpack to single config",
          "Set target to 'web' or omit",
          "Add all @brightsign/* modules to externals",
          "Add Node.js modules (fs, path, crypto, etc.) to externals",
          "Configure loaders for HTML, CSS, assets",
          "Set up development and production builds"
        ]
      },
      {
        "phase": "6_deployment_setup",
        "tasks": [
          "Create autorun.brs file",
          "Configure roHtmlWidget or nodejs_enabled",
          "Set up inspector_server for remote debugging",
          "Create deployment package script",
          "Document BrightSign deployment process"
        ]
      },
      {
        "phase": "7_testing",
        "tasks": [
          "Test in Chrome/Edge locally with mocked BrightSign APIs",
          "Verify webpack build succeeds",
          "Test on BrightSign device",
          "Verify all features work",
          "Check performance",
          "Validate error handling"
        ]
      }
    ],
    "ai_placeholders": {
      "use_when": "Implementation requires user decision or testing",
      "format": "// AI_PLACEHOLDER: [Description of what needs attention]",
      "examples": [
        "AI_PLACEHOLDER: Test file operations on BrightSign device",
        "AI_PLACEHOLDER: Verify network connectivity for API calls",
        "AI_PLACEHOLDER: Adjust CSS for BrightSign screen resolution"
      ]
    },
    "user_questions": {
      "use_when": "Critical information missing that AI cannot determine",
      "format": "AI_QUESTION: [Question for user]",
      "examples": [
        "AI_QUESTION: What BrightSign player model are you targeting?",
        "AI_QUESTION: Does your app need to work offline?",
        "AI_QUESTION: What screen resolution should the UI be designed for?"
      ]
    }
  }
}
```

---

## roElectron Limitations Reference

```json
{
  "roelectron_not_recommended": {
    "reason": "Severe limitations make roElectron unsuitable for most applications",
    "limitations": [
      "Cannot use BrightSign asset pool (no efficient media caching)",
      "Legacy BrightSign JavaScript objects won't work",
      "Cannot use BrightSign Media Player (only Chromium media player)",
      "Virtual Keyboard won't work (no on-screen keyboard)",
      "Proxy configuration doesn't apply (network limitations)",
      "No BrightSign-specific user agent keywords",
      "BSMessagePort unavailable (limited messaging)",
      "Only available on Series 5 players",
      "Limited documentation and examples",
      "Minimal BrightSign support and testing"
    ],
    "recommended_alternative": "Native HTML/JS/Node.js v18.18.2 on BrightSign Chromium engine",
    "benefits_of_alternative": [
      "Full BrightSign API access",
      "Better performance and reliability",
      "Comprehensive documentation",
      "Regular updates and bug fixes",
      "Works on Series 4 and Series 5 players",
      "Easier debugging with Chrome DevTools",
      "Simpler single-process architecture"
    ]
  }
}
```

---

## Summary

This document provides comprehensive AI-readable instructions for migrating Electron applications to native HTML/JavaScript/Node.js v18.18.2 on BrightSign platforms. The migration involves:

1. **Architecture transformation**: Multi-process (main + renderer) → Single process
2. **API replacement**: Electron APIs → Web/Node.js/BrightSign APIs
3. **IPC elimination**: Remove all inter-process communication
4. **Build modernization**: Simplified webpack configuration
5. **Platform integration**: Add BrightSign device APIs

The result is a cleaner, more maintainable codebase that fully leverages BrightSign's capabilities without the limitations of roElectron.
