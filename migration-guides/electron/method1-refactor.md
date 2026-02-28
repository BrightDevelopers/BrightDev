# Method 1: Refactor & Replace Electron APIs

**🤖 AI-Driven Refactoring**: This method uses AI to systematically analyze your Electron app and refactor it to native HTML/JavaScript/Node.js v18.18.2. AI handles architecture transformation, API replacement, and configuration.

> For machine-readable patterns, see [CLAUDE.md](CLAUDE.md)

[← Back to Main Guide](README.md)

---

## Overview

Systematically refactor your Electron application by removing Electron-specific APIs and replacing them with web standards, Node.js APIs, and BrightSign device APIs.

**⏱️ Timeline**: 2-4 weeks  
**🎯 Best for**: All Electron applications  
**✅ BrightSign Recommended**  
**📦 Target Platform**: Node.js v18.18.2 (BrightSign OS)

---

## Prerequisites

Before using this prompt:
- ✅ Ensure the [BrightDeveloper MCP server](https://github.com/BrightDevelopers/technical-documentation/blob/main/MCP-SERVER-HOWTO.md) is connected
- ✅ Have your Electron project accessible in the workspace
- ✅ Attach the [CLAUDE.md](CLAUDE.md) file to the AI context for code transformation patterns
- ✅ Have a BrightSign player available for testing (or use browser for initial testing)

---

## Complete AI Migration Prompt

**This single prompt automates the entire refactoring process:**

```
First, read and analyze the automation patterns at migration-guides/electron/CLAUDE.md.

I need you to migrate my Electron desktop application to native HTML/JavaScript/Node.js v18.18.2 for BrightSign platform.

Project Details:
- Project Path: {YOUR_PROJECT_PATH}
- Main Package Entry: {MAIN_ENTRY_POINT from package.json, e.g., "main.js"}
- Target BrightSign Model: {e.g., XT1144, XD1034, or "any"}
- Current Electron Version: {ELECTRON_VERSION}
- Current Node.js Version: {NODEJS_VERSION}

Application Architecture:
- Number of Main Process Files: {COUNT}
- Number of Renderer Windows: {COUNT}
- Number of Preload Scripts: {COUNT}
- Application Complexity: {LOW/MEDIUM/HIGH}

Electron APIs Used (check all that apply):
- [ ] IPC Communication (ipcRenderer, ipcMain)
- [ ] BrowserWindow management
- [ ] Native dialogs (dialog.showOpenDialog, showMessageBox, etc.)
- [ ] Native menus (Menu, Tray)
- [ ] Notifications (Electron Notification)
- [ ] File system operations (fs, path modules)
- [ ] Auto-updater (electron-updater)
- [ ] Global keyboard shortcuts (globalShortcut)
- [ ] System tray (Tray)
- [ ] Power management (powerSaveBlocker)
- [ ] Clipboard operations
- [ ] Shell operations (shell.openExternal)
- [ ] Context isolation / Preload scripts
- [ ] electron.remote (deprecated)
- [ ] Other: {SPECIFY}

BrightSign Platform Features Needed:
- [ ] Device information (model, serial number, OS version)
- [ ] Video playback control (advanced)
- [ ] Network configuration
- [ ] Screenshot capture
- [ ] Serial port communication
- [ ] GPIO control
- [ ] Other: {SPECIFY}

Application Requirements:
- Offline Support: {YES/NO}
- Backend/API Integration: {YES/NO - specify endpoints if yes}
- Local Database: {NONE/IndexedDB/SQLite/Other}
- Media Playback: {YES/NO - what types: video, audio, images}
- User Input: {Keyboard/Mouse/Touch/GPIO/Other}

Migration Tasks:
1. Analyze my Electron application and create a comprehensive feature inventory
   - List all Electron API usage with file paths and line numbers
   - Map all IPC communication patterns (send/invoke/handle/on)
   - Document main process, renderer processes, and preload scripts
   - Identify all native features (dialogs, menus, notifications, etc.)

2. Architecture Transformation
   - Merge main process and renderer process(es) into single-process architecture
   - Eliminate all IPC communication (ipcRenderer, ipcMain)
   - Remove BrowserWindow creation code
   - Delete preload scripts (no longer needed)

3. API Replacement (follow patterns from CLAUDE.md)
   - Replace app.whenReady() with DOMContentLoaded event
   - Replace app.quit() with process.exit()
   - Replace BrowserWindow with HTML page loaded via autorun.brs
   - Replace ipcRenderer.invoke() with direct async function calls
   - Replace ipcRenderer.send() with direct function calls or custom events
   - Replace dialog.showOpenDialog() with HTML <input type="file">
   - Replace dialog.showMessageBox() with custom HTML modal or window.alert()
   - Replace Menu with custom HTML/CSS menu components
   - Replace Notification with Web Notifications API or custom UI
   - Remove electron.remote usage (not needed in single process)
   - Replace globalShortcut with window keyboard event listeners
   - Remove Tray (not applicable to BrightSign)
   - Update file paths to use BrightSign storage locations (/storage/sd/)

4. BrightSign Integration
   - Add @brightsign/deviceinfo for device information
   - Add @brightsign/videooutput if advanced video control needed
   - Add @brightsign/networkconfiguration if network configuration needed
   - Add other BrightSign APIs as required
   - Implement async initialization pattern for BrightSign APIs
   - Create mock implementations for local development/testing

5. Node.js v18.18.2 Compatibility
   - Verify all Node.js code works with v18.18.2
   - Update deprecated APIs if any
   - Use CommonJS (require/module.exports) by default
   - Test all file system operations
   - Verify all networking code (fetch, https module)

6. Webpack Configuration
   - Create single webpack configuration (remove multi-config if present)
   - Set target to 'web' or omit (single process, browser-like environment)
   - Add BrightSign APIs to externals:
     - '@brightsign/deviceinfo': 'commonjs @brightsign/deviceinfo'
     - '@brightsign/videooutput': 'commonjs @brightsign/videooutput'
     - All other @brightsign/* modules used
   - Add Node.js modules to externals (fs, path, crypto, http, https, etc.)
   - Configure loaders for HTML, CSS, images, and other assets
   - Set up development and production build modes
   - Configure source maps for debugging

7. Package.json Updates
   - Remove electron and @electron/* dependencies
   - Add required @brightsign/* dependencies
   - Update scripts for webpack build and development
   - Set Node.js engine to 18.18.2
   - Update entry point for BrightSign deployment

8. Create autorun.brs Launcher File
   - Configure roHtmlWidget with nodejs_enabled mode
   - Set inspector_server port (2999) for remote debugging
   - Configure URL to load HTML application
   - Add any required BrightScript setup code
   - Example:
     ```
     sub Main()
       rect = CreateObject("roRectangle, 0, 0, 1920, 1080") ' Fullscreen
       config = {
         nodejs_enabled: true,
         url: "file:///sd:/dist/index.html",
         inspector_server: { port: 2999 }
       }
       h = CreateObject("roHtmlWidget", rect, config)
       h.Show()
     end sub
     ```

9. Development Environment Setup
   - Create mock BrightSign APIs for local development
   - Set up local development server (webpack-dev-server or similar)
   - Configure browser testing (Chrome/Edge for Chromium compatibility)
   - Create npm scripts for development workflow

10. Deployment Package Creation
    - Build production webpack bundle (dist/ folder)
    - Include autorun.brs file
    - Include all assets and dependencies
    - Create deployment instructions for BrightSign
    - Document file structure for SD card deployment

11. Testing and Validation
    - Test in Chrome/Edge locally with mocked BrightSign APIs
    - Verify all features work without Electron
    - Check error handling and logging
    - Validate file operations with BrightSign paths
    - Test on actual BrightSign device (if available)
    - Verify remote debugging works (Chrome DevTools)

12. Documentation
    - Document all API replacements made
    - Create developer guide for maintaining the application
    - Document BrightSign-specific features and APIs used
    - Provide troubleshooting guide
    - Create deployment checklist

Code Quality Requirements:
- Use modern ES6+ JavaScript syntax
- Implement proper error handling with try/catch
- Add comprehensive console logging for debugging
- Follow BrightSign best practices from CLAUDE.md
- Create modular, maintainable code structure
- Add comments explaining BrightSign-specific code
- Use async/await for asynchronous operations
- Handle edge cases and error conditions

Output Deliverables:
1. Refactored codebase with all Electron APIs removed
2. Single-process architecture (merged main + renderer)
3. Webpack configuration for BrightSign deployment
4. autorun.brs launcher file
5. package.json with updated dependencies
6. Mock BrightSign APIs for local development
7. Complete deployment package in dist/ folder
8. Testing checklist and validation results
9. Migration summary document listing all changes
10. Deployment instructions for BrightSign

Follow all transformation patterns from CLAUDE.md, including:
- Merge multi-process architecture to single process
- Remove all IPC communication
- Replace Electron APIs with web/Node.js/BrightSign equivalents
- Configure webpack for single-process with BrightSign externals
- Create proper autorun.brs configuration

Output a production-ready BrightSign application with complete documentation.
```

---

## Customization Guide

**Replace the following placeholders in the prompt:**

| Placeholder | Example | Description |
|------------|---------|-------------|
| `{YOUR_PROJECT_PATH}` | `c:\Users\dev\MyElectronApp` | Absolute path to your Electron project |
| `{MAIN_ENTRY_POINT}` | `main.js` or `electron.js` | Main process file from package.json |
| `{YOUR_BRIGHTSIGN_MODEL}` | `XT1144` or `any` | Target BrightSign player model |
| `{ELECTRON_VERSION}` | `v25.3.1` | Current Electron version from package.json |
| `{NODEJS_VERSION}` | `v20.5.0` | Current Node.js version your app uses |
| `{COUNT}` | `1`, `2`, `5`, etc. | Number of files, windows, or components |
| `{SPECIFY}` | Descriptive details | Additional context for your project |

**Checkbox Instructions:**
- Mark `[x]` for applicable items
- Leave `[ ]` for non-applicable items

---

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

For detailed troubleshooting of common migration issues, see the comprehensive [Troubleshooting Guide](troubleshooting.md) which covers:

- Build issues (webpack, dependencies, native modules)
- Runtime errors (IPC, BrowserWindow, file operations, BrightSign APIs)
- Node.js v18.18.2 compatibility issues  
- UI/display issues
- Debugging strategies with Chrome DevTools
- Deployment issues

---

## Example: Before and After

### Before (Electron Multi-Process)

**main.js:**
```javascript
const { app, BrowserWindow, ipcMain } = require('electron');

app.whenReady().then(() => {
  const win = new BrowserWindow({ 
    width: 1920, 
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile('index.html');
});

ipcMain.handle('read-file', async (event, path) => {
  return fs.readFileSync(path, 'utf8');
});
```

**renderer.js:**
```javascript
const { ipcRenderer } = require('electron');

async function loadFile() {
  const content = await ipcRenderer.invoke('read-file', '/data/file.txt');
  document.getElementById('content').textContent = content;
}
```

### After (BrightSign Single-Process)

**app.js:**
```javascript
const fs = require('fs');

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  loadFile();
}

function loadFile() {
  try {
    const content = fs.readFileSync('/storage/sd/data/file.txt', 'utf8');
    document.getElementById('content').textContent = content;
  } catch (error) {
    console.error('Error reading file:', error);
  }
}
```

---

## Next Steps After Migration

1. **Test Thoroughly**: Verify all features work on BrightSign
2. **Optimize Performance**: Profile and optimize for BrightSign hardware
3. **Implement Error Handling**: Add robust error handling for production
4. **Set Up Monitoring**: Implement logging and health checks
5. **Create Update Mechanism**: Build custom update system if needed
6. **Document Deployment**: Create deployment guide for operations team
7. **Train Team**: Ensure team understands new architecture

---

## Additional Resources

- [BrightSign JavaScript API Documentation](https://docs.brightsign.biz/developers/javascript-apis/)
- [Node.js v18 Documentation](https://nodejs.org/docs/latest-v18.x/api/)
- [BrightSign Developer Cookbook](https://github.com/brightsign/dev-cookbook)

---

## Need Help?

- 💬 Ask in [BrightSign Support Community](https://support.brightsign.biz/hc/en-us/community/topics)
- 🐛 Report issues: [GitHub Issues](https://github.com/BrightDevelopers/BrightDev/issues)
- 📧 Send an email to `integrations@brightsign.biz` with any questions

---

**Ready to migrate?** Copy the AI prompt above, customize the placeholders, and let AI handle the refactoring! 
