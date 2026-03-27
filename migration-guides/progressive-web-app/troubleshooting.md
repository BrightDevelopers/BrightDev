# Troubleshooting Guide: PWA to BrightSign Migration

This guide provides manual code for error handling, and fallback instructions for each migration step.

## General Troubleshooting using AI

You could make use of the brightdeveloper MCP server and AI agent of your choice to assist with diagnosing specific issues by providing detailed error messages and project context. An example AI prompt for troubleshooting may look like this:

```
I'm encountering an error in my PWA to BrightSign migration project.

Error Message:
[paste the specific error message or describe the issue]

Project Path: [your-path]

Project Context:
[briefly describe your project setup and what you were attempting]

Please help me:
1. Diagnose the root cause of this error
2. Suggest specific fixes for my project
3. Provide code examples or configuration changes if applicable
```

However, if the AI approach is not yielding results, follow the manual troubleshooting steps outlined below for each migration phase.

---

## Important: Deployment Architecture

**Most PWA migrations use a simple static deployment:**
- HTML + bundle.js (all client code bundled)
- Loaded directly via `roHtmlWidget` pointing to `file:///sd:/index.html`
- No Node.js server needed

**Node.js server is ONLY needed if:**
- Your app uses client-side routing (React Router, Vue Router, Angular Router, etc.)
- You need a catch-all route to handle SPA navigation

This guide covers both scenarios, but **start with the static approach** unless you specifically need client-side routing support.

---

## Step 1: Analysis Troubleshooting

**Manual Analysis:**
- Manually review `package.json`, `manifest.json`, and service worker files.
- Identify framework and build setup.
- Check for client-side routing (React Router, Vue Router, Angular Router).
- List PWA-specific dependencies (workbox, pwa plugins).

## Step 2: Build Troubleshooting

**Manual Build:**
- Check build script in `package.json`.
- Run `npm run build` or equivalent.
- Review build output for errors.
- Verify output directory (dist, build, etc.).

**Common Build Issues:**
- Missing dependencies: Run `npm install`
- Build script not found: Add to package.json scripts
- Output path incorrect: Check webpack/vite config `output.path` or `build.outDir`
- Asset path errors: Verify `publicPath` is set to `/`

## Step 3: Adaptation Troubleshooting

**Manual Adaptations:**

1. Remove PWA Features
   - **Service Worker**: Remove `serviceWorker.register()` calls from main JS files
   - **Manifest**: Delete `<link rel="manifest">` and `<meta name="theme-color">` from HTML
   - **Install Prompts**: Remove `beforeinstallprompt` event listeners and install UI components
   - **PWA Dependencies**: Remove from package.json: workbox, pwa plugins, notification libraries

2. Update for Signage Display
   - **Viewport**: Change from `width=device-width` to `width=1920, height=1080` (or your target resolution)
   - **Font Sizes**: Increase base font to 24px+, heading sizes to 48-72px for viewing distance
   - **Remove Responsive CSS**: Delete @media queries and mobile breakpoints
   - **Remove Touch Events**: Replace `touchstart/touchmove/touchend` with auto-advance or button navigation

3. Add Signage Features (Key Patterns)
   - **Idle Detection**: Use `setTimeout` with event listeners to trigger screensaver after inactivity
   - **Auto-Refresh**: Schedule `window.location.reload()` every 24 hours for stability
   - **Connection Monitoring**: Use `window.addEventListener('online/offline')` for network status
   - **Memory Cleanup**: Periodically clear caches and old data with `setInterval`

**Code Reference Pointers:**
- Service worker removal: Look for `navigator.serviceWorker.register()` in main JS/index files
- Manifest removal: Check `<head>` section of index.html
- Viewport update: In index.html `<meta name="viewport" ...>`
- Font sizes: In main CSS file, update `:root` or `body` font-size declarations
- Idle detection: Add global timer that resets on user interaction events
- Auto-refresh: Single `setTimeout(() => window.location.reload(), 86400000)`

## Step 4: Node.js Server Troubleshooting

**⚠️ SKIP THIS STEP if your app does NOT use client-side routing.**

Most PWA migrations don't need a Node.js server. Only proceed if your app uses:
- React Router, Vue Router, Angular Router, or similar client-side routing
- Multiple client-side "pages" accessed via URL paths (e.g., `/about`, `/products`)

**Manual Server Setup (ONLY for SPAs with client-side routing):**
- Create `server.js` with Express for SPA routing.
- Configure static file serving from build directory (dist/build).
- Add catch-all route (`app.get('*', ...)`) that returns `index.html` - **must be LAST route**.
- Add health check endpoint (`/health`).
- Bundle server code with `webpack.server.config.js` into `server.bundle.js`.
- Test server locally with all routes.

**Key Server Pattern:**
```javascript
const express = require('express');
const path = require('path');
const app = express();

const BUILD_DIR = path.join(__dirname, 'dist'); // or 'build'

// Static files FIRST
app.use(express.static(BUILD_DIR));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Catch-all route LAST (critical for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(BUILD_DIR, 'index.html'));
});

app.listen(8080, () => console.log('Server running on port 8080'));
```

**Common Issues:**
- Routes return 404: Ensure catch-all route is **after** static middleware
- Assets fail to load: Check BUILD_DIR path and static file configuration
- Server won't start: Verify Express is installed (`npm install express`)
- Port already in use: Change port number or kill conflicting process

## Step 5: BrightSign Deployment Troubleshooting

**Manual Deployment File Creation:**
- Create `autorun.brs` using provided templates (see below).
- Use **Static template** for most apps (HTML + bundle.js).
- Use **Node.js template** ONLY if you have client-side routing.
- Set display resolution (1920x1080 or 3840x2160).
- Enable remote debugging on port 2999.
- Document SD card structure with all required files.

**autorun.brs Template (Static HTML - Use This for Most Apps):**
```brightscript
Sub Main()
    msgPort = CreateObject("roMessagePort")
    
    ' Launch Chromium with local HTML file
    htmlRect = CreateObject("roRectangle", 0, 0, 1920, 1080)
    htmlConfig = {
        url: "file:///sd:/index.html",
        port: msgPort,
        inspector_server: { port: 2999 }
    }
    html = CreateObject("roHtmlWidget", htmlRect, htmlConfig)
    html.Show()
    
    ' Keep alive
    while true
        msg = wait(0, msgPort)
    end while
End Sub
```

**autorun.brs Template (Node.js Server - Only for SPAs with Routing):**
```brightscript
Sub Main()
    msgPort = CreateObject("roMessagePort")
    
    ' Start Node.js server
    node = CreateObject("roNodeJs", "server.bundle.js",  {message_port: msgPort})
    sleep(3000)  ' Wait for server to initialize
    
    ' Launch Chromium
    htmlRect = CreateObject("roRectangle", 0, 0, 1920, 1080)
    htmlConfig = {
        nodejs_enabled: true,
        url: "http://localhost:8080/index.html",
        port: msgPort,
        inspector_server: { port: 2999 }
    }
    html = CreateObject("roHtmlWidget", htmlRect, htmlConfig)
    html.Show()
    
    ' Keep alive
    while true
        msg = wait(0, msgPort)
    end while
End Sub
```

**Common Issues:**
- Black screen: Check autorun.brs syntax, verify file paths (`file:///sd:/` for static, or correct server URL)
- Syntax errors: Validate BrightScript syntax (case-sensitive, Sub/End Sub matching)
- Server not starting: For SPA, ensure Node.js path is correct (`server.bundle.js`)
- Wrong display size: Update `CreateObject("roRectangle", x, y, width, height)`
- Using wrong template: Most apps should use the static HTML template, not Node.js

## Step 6: Packaging Troubleshooting

**Manual Packaging:**
- **Primary task**: Bundle all client code and dependencies into bundle.js
- **Optional task**: Bundle server code into server.bundle.js (ONLY if using Node.js server)
- Configure webpack externals for `@brightsign/*` APIs (must be commonjs externals)
- Verify no node_modules folder is copied to SD card
- Document SD card directory structure
- Test deployment on BrightSign device

**Webpack Configuration Pattern (Client - Required for All Apps):**
```javascript
// webpack.config.js for Client
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  mode: 'production',
  
  // CRITICAL: Mark BrightSign APIs as externals
  externals: {
    '@brightsign/deviceinfo': 'commonjs @brightsign/deviceinfo',
    '@brightsign/networkconfiguration': 'commonjs @brightsign/networkconfiguration',
    // Add other @brightsign/* modules as needed
  },
  
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
};

// webpack.server.config.js for Server (if SPA)
const path = require('path');

module.exports = {
  entry: './server.js',
  output: {
    filename: 'server.bundle.js',
    path: path.resolve(__dirname),
    libraryTarget: 'commonjs2'
  },
  target: 'node',
  mode: 'production',
  
  // Mark BrightSign APIs as externals (if used in server code)
  externals: {
    '@brightsign/deviceinfo': 'commonjs @brightsign/deviceinfo'
  },
  
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
};
```

**SD Card Structure (Static - Most Common):**
```
SD_CARD/
├── autorun.brs           # BrightSign launcher (static template)
├── index.html            # Entry point
├── bundle.js             # ALL client code bundled here
├── styles.css            # (if not bundled into bundle.js)
└── assets/               # Images, fonts, etc.
```

**SD Card Structure (SPA with Node.js - Only if Routing):**
```
SD_CARD/
├── autorun.brs           # BrightSign launcher (Node.js template)
├── server.bundle.js      # Server code with Express bundled
└── dist/                 # Build output served by Express
    ├── index.html        # Entry point
    ├── bundle.js         # Client code bundled
    ├── styles.css
    └── assets/
```

**Why Bundle Dependencies:**
- Reduces SD card size from 50-200+ MB to 5-20 MB
- Faster deployment and load times
- Fewer files to manage (no node_modules folder)
- Only BrightSign APIs remain external (provided by runtime)
- Simplifies deployment - just copy files to SD card

**Common Issues:**
- "Module not found" for `@brightsign/*`: Add to webpack externals as `commonjs @brightsign/modulename`
- Bundle too large: Enable minification, check for duplicate dependencies
- Assets not loading: Verify webpack asset loader configuration and publicPath
- Deployment fails: Check that only essential files are on SD card (no dev dependencies)

## Chromium vs BrightSign Media Player

These migration guides default to the **Chromium media player** (`use-brightsign-media-player = "0"`), which provides full modern web API support (service workers, Cache API, IndexedDB, Web Notifications, standard HTML5 video, etc.). This is the right choice for the majority of web-based migration use cases.

However, the Chromium media player is **only available on Series 5 players and later**. Series 4 and earlier do not support it.

### When to use the BrightSign media player instead

Switch back to the default BrightSign media player if your application requires any of the following:

- **Series 4 (or earlier) player support**: The Chromium media player is not available on these devices. Remove the registry write entirely and the player will use the BrightSign media player by default.
- **Synchronized playback**: Features like `roSyncManager` and Genlock (PTP-based frame-accurate sync over Ethernet) only work with the BrightSign media player.
- **UDP/RTP streaming**: Streaming via `roMediaStreamer` (TS files over UDP/RTP) and `roRtspStream` (UDP, RTP, HLS, HTTP streams) require the BrightSign media player.
- **Chroma key / video transparency**: Luma and chroma key compositing via BrightSign's HWZ video transparency extensions are only available with the BrightSign media player.
- **Broader hardware-accelerated decode support**: The BrightSign media player supports more video decode levels and profiles than Chromium. If you are playing uncommon codecs or profiles, you may need it.

### How to switch back

Remove the registry write from `autorun.brs`, or explicitly set it to `"1"`:

```brightscript
' Option 1: Delete the key (reverts to default BrightSign media player)
registrySection = CreateObject("roRegistrySection", "html")
registrySection.Delete("use-brightsign-media-player")
registrySection.Flush()

' Option 2: Explicitly set to BrightSign media player
registrySection = CreateObject("roRegistrySection", "html")
registrySection.Write("use-brightsign-media-player", "1")
registrySection.Flush()
```

**Note**: When using the BrightSign media player, Chromium-specific web features (service workers, Cache API, etc.) will not be available. For more details, see [HTML Playback Options on Series 5 Players](https://docs.brightsign.biz/developers/html-playback-options-on-series-5-players).

---

## Additional Resources

- **CLAUDE.md**: Machine-readable automation patterns and code transformation templates
- **method1-adapt.md**: Complete AI-first migration workflow with comprehensive prompt
- **BrightSign Documentation**: https://docs.brightsign.biz/

