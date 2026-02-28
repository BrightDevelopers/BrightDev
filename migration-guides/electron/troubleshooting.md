# Troubleshooting Guide

Common issues when migrating Electron applications to HTML/JavaScript/Node.js v18.18.2 for BrightSign.

[← Back to Main Guide](README.md)

[← Back to Migration Guide](method1-refactor.md)

---

## Build Issues

### Error: "Cannot find module 'electron'"

**Symptom**: Runtime or build error stating that the 'electron' module cannot be found.

**Cause**: Electron imports were not fully removed from the codebase.

**Solution**:
1. Search your entire codebase for Electron imports:
   ```bash
   grep -r "require('electron')" ./src
   grep -r "require(\"electron\")" ./src
   grep -r "from 'electron'" ./src
   ```
2. Remove all instances of:
   - `const { app, BrowserWindow } = require('electron')`
   - `import { ipcRenderer } from 'electron'`
   - `const electron = require('electron')`
   - `require('electron').remote`
   - Any `@electron/*` imports

3. Replace Electron APIs with appropriate alternatives (see [README.md](README.md#common-api-replacements))

---

### Error: "Module not found: @brightsign/deviceinfo"

**Symptom**: Webpack build fails with "Can't resolve '@brightsign/deviceinfo'" or similar.

**Cause**: BrightSign modules not properly externalized in webpack configuration.

**Solution**:
Add BrightSign modules to webpack externals:
```javascript
// webpack.config.js
externals: {
    '@brightsign/deviceinfo': 'commonjs @brightsign/deviceinfo',
    '@brightsign/videooutput': 'commonjs @brightsign/videooutput',
    '@brightsign/networkconfiguration': 'commonjs @brightsign/networkconfiguration',
    // Add other @brightsign/* modules as needed
}
```

---

## Runtime Issues

### Error: "ipcRenderer is not defined"

**Symptom**: Application crashes with "ipcRenderer is not defined" error.

**Cause**: IPC code not fully removed or replaced.

**Solution**:
1. Search for all IPC usage:
   ```bash
   grep -r "ipcRenderer" ./src
   grep -r "ipcMain" ./src
   ```

2. Replace IPC patterns:
   - `ipcRenderer.invoke('channel', args)` → Direct async function call
   - `ipcRenderer.send('channel', data)` → Direct function call or custom event
   - `ipcMain.handle()` → Remove, function now in single process
   - `ipcMain.on()` → Remove, function now in single process

3. Example conversion:
   ```javascript
   // Before (Electron with IPC)
   const result = await ipcRenderer.invoke('fetch-data', userId);
   
   // After (Direct call)
   const result = await fetchData(userId);
   ```

---

### Error: "BrowserWindow is not defined"

**Symptom**: Runtime error about BrowserWindow.

**Cause**: Window management code not removed.

**Solution**:
1. Remove all BrowserWindow creation code
2. BrightSign loads HTML directly via autorun.brs
3. Window management now handled by HTML/CSS:
   - Fullscreen: Default behavior on BrightSign
   - Hide/show: Use CSS `display` or `visibility` properties

---

### Application doesn't start on BrightSign

**Symptom**: Nothing displays when deploying to BrightSign.

**Causes & Solutions**:

**Missing autorun.brs:**
- Verify `autorun.brs` file exists in root of SD card
- Check syntax is correct BrightScript

**Incorrect autorun.brs configuration:**
```brightscript
sub Main()
  ' For HTML/JS application
  rect = CreateObject("roRectangle, 0, 0, 1920, 1080") ' Fullscreen
  config = {
    nodejs_enabled: true,
    url: "file:///sd:/dist/index.html",  ' Your main entry point
    inspector_server: { port: 2999 }     ' For remote debugging
  }
  h = CreateObject("roHtmlWidget", rect, config)
  h.Show()
end sub
```

**Wrong file paths:**
- Ensure paths use BrightSign SD card format: `file:///sd:/path/to/file.html`

---

### File operations fail on BrightSign

**Symptom**: `fs.readFileSync()` or `fs.writeFileSync()` throws errors.

**Cause**: Using desktop file paths instead of BrightSign storage paths.

**Solution**:
1. Update all file paths to BrightSign storage locations:
   - SD card: `/storage/sd/`
   - USB drive: `/storage/usb1/`, `/storage/usb2/`, etc.
   - Internal storage: `/storage/internal/` (limited space)

2. Example:
   ```javascript
   // Before (Desktop path)
   fs.readFileSync('C:/Users/data/config.json', 'utf8');
   
   // After (BrightSign path)
   fs.readFileSync('/storage/sd/data/config.json', 'utf8');
   ```

3. Check file permissions and storage availability

---

### BrightSign APIs return errors

**Symptom**: `require('@brightsign/deviceinfo')` throws errors or returns undefined.

**Causes & Solutions**:

**Testing on desktop browser:**
- BrightSign APIs only work on actual BrightSign hardware
- Create mock implementations for local development:
  ```javascript
  // Mock for local development
  const DeviceInfo = process.env.NODE_ENV === 'development' 
    ? { model: 'MOCK_XT1144', serialNumber: 'MOCK_123456' }
    : require('@brightsign/deviceinfo');
  ```

**Wrong BrightSign player OS version:**
- Some APIs only available on certain OS versions
- Check API documentation for compatibility

**Not initialized properly:**
- Some BrightSign APIs require initialization
- Use async initialization pattern if needed

---

## Webpack Configuration Issues

### Webpack builds slowly or hangs

**Cause**: Webpack trying to process too many files or resolve complex dependencies.

**Solution**:
1. Exclude `node_modules` from being processed:
   ```javascript
   module: {
     rules: [
       {
         test: /\.js$/,
         exclude: /node_modules/,
         use: 'babel-loader'
       }
     ]
   }
   ```

2. Optimize webpack configuration:
   ```javascript
   optimization: {
     minimize: true,
     splitChunks: {
       chunks: 'all'
     }
   }
   ```

---

### Source maps not working for debugging

**Symptom**: Can't debug code in Chrome DevTools, line numbers are wrong.

**Solution**:
1. Enable source maps in webpack:
   ```javascript
   // webpack.config.js
   devtool: 'source-map',  // For production
   // or 'inline-source-map' for development
   ```

2. Ensure BrightSign inspector server is enabled in `autorun.brs`:
   ```brightscript
   inspector_server: { port: 2999 }
   ```

3. Connect Chrome DevTools to BrightSign:
   - Open Chrome: `chrome://inspect`
   - Add network target: `<brightsign-ip>:2999`
   - Click "Inspect" when device appears

---

## Node.js Compatibility Issues

### Code doesn't work on Node.js v18.18.2

**Symptom**: Errors about unsupported features or deprecated APIs.

**Solution**:
1. Test locally with Node.js v18.18.2:
   ```bash
   nvm use 18.18.2
   node app.js
   ```

2. Update deprecated Node.js APIs:
   - Check [Node.js v18 migration guide](https://nodejs.org/en/blog/release/v18.0.0)
   - Replace deprecated methods with modern equivalents

3. Common v18 compatibility issues:
   - **Buffer()**: Use `Buffer.from()` or `Buffer.alloc()`
   - **crypto constants**: Import explicitly
   - **fs Promises**: Use `fs.promises` or `require('fs/promises')`

---

### ES Modules vs CommonJS conflicts

**Symptom**: `Cannot use import statement outside a module` or `require is not defined`.

**Solution**:

**Option 1: Use CommonJS (Recommended for BrightSign)**
```javascript
// Use require/module.exports
const fs = require('fs');
module.exports = { myFunction };
```

**Option 2: Configure ES Modules**
```json
// package.json
{
  "type": "module"
}
```

Then use `.mjs` extension or update all imports to ES module syntax.

**BrightSign Note**: CommonJS is the default and generally safer for Node.js v18.18.2 on BrightSign.

---

## UI/Display Issues

### UI doesn't display correctly on BrightSign

**Symptom**: Layout broken, elements misaligned, or missing on BrightSign display.

**Causes & Solutions**:

**Wrong resolution:**
- BrightSign defaults to specific video modes
- Design UI for target resolution (e.g., 1920x1080 or 3840x2160)
- Use responsive CSS or set explicit dimensions

**Missing assets:**
- Verify all images, fonts, CSS files are included in deployment package
- Check file paths are correct for BrightSign filesystem
- Use relative paths where possible

**CSS not loading:**
- Ensure webpack bundles CSS correctly
- Check CSS file is included in HTML
- Verify CSS file path in deployed package

---

### Fonts not loading

**Symptom**: Text displays in fallback font, custom fonts not applied.

**Solution**:
1. Include web fonts in deployment package
2. Use relative paths in CSS:
   ```css
   @font-face {
     font-family: 'MyFont';
     src: url('./fonts/myfont.woff2') format('woff2');
   }
   ```

3. Or use web-safe fonts for testing

---

## Debugging Strategies

### Enable verbose logging

Add comprehensive logging throughout your application:

```javascript
function log(category, message, data) {
  console.log(`[${new Date().toISOString()}] [${category}] ${message}`, data || '');
}

// Usage
log('APP', 'Application started');
log('FILE', 'Reading file', { path: '/storage/sd/data.json' });
log('ERROR', 'Operation failed', { error: e.message });
```

---

### Remote debugging with Chrome DevTools

1. Enable inspector server in `autorun.brs`:
   ```brightscript
   inspector_server: { port: 2999 }
   ```

2. Connect Chrome DevTools:
   - Open `chrome://inspect` in Chrome browser
   - Click "Configure" → Add `<brightsign-ip>:2999`
   - Wait for device to appear in list
   - Click "inspect" to open DevTools

3. Use DevTools for:
   - Console logs
   - Breakpoints and stepping
   - Network requests monitoring
   - Performance profiling

---

### Test on desktop first

Before deploying to BrightSign:
1. Mock BrightSign APIs for local testing
2. Test in Chrome or Edge (same Chromium engine)
3. Verify all functionality works in browser
4. Then deploy to BrightSign for final testing

---

## Performance Issues

### Slow startup or loading

**Solutions**:
1. Minimize webpack bundle size
2. Lazy load resources where possible
3. Remove duplicate dependencies using `resolve.alias` in webpack
4. Optimize images and assets
5. Use webpack code splitting:
   ```javascript
   optimization: {
     splitChunks: {
       chunks: 'all'
     }
   }
   ```

---

### High memory usage

**Solutions**:
1. Profile memory with Chrome DevTools
2. Check for memory leaks (event listeners not removed)
3. Limit cache sizes
4. Optimize large data structures
5. Use streaming for large files instead of loading entirely into memory

---

## Deployment Issues

### Wrong deployment package structure

**Correct structure for BrightSign SD card:**
```
/
├── autorun.brs           # BrightScript launcher
├── dist/                 # Webpack build output
│   ├── index.html
│   ├── bundle.js
│   ├── styles.css       # if not bundled into JS
│   └── assets/
├── data/                # Application data (optional)
└── config.json          # Configuration (optional)
```

---

### Package too large for SD card

**Solutions**:
1. Minimize webpack output:
   - Enable production mode
   - Enable minification
   - Remove source maps from production build

2. Compress assets:
   - Optimize images
   - Use compressed video formats
   - Remove unused dependencies

3. Use external storage:
   - Store large media on USB drive
   - Reference via `/storage/usb1/` paths

---

## Getting More Help

If issues persist:

1. **Check BrightSign Documentation**: [docs.brightsign.biz](https://docs.brightsign.biz/developers/javascript/)
2. **Search BrightSign Support Community**: [BrightSign Support Community](https://support.brightsign.biz/hc/en-us/community/topics)
3. **Open GitHub Issue**: [BrightDev Issues](https://github.com/BrightDevelopers/BrightDev/issues)
4. **Contact BrightSign Support**: Send email to `integrations@brightsign.biz` with detailed description and logs
