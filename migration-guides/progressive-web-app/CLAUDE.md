# ai_migration_instructions

```json
{
  "document_type": "ai_migration_instructions",
  "version": "1.0",
  "target_platform": "brightsign",
  "source_platform": "pwa_html_js",
  "automation_level": "full_auto_with_placeholders",
  "primary_method": "adapt_pwa",
  "recommended_method": "adapt_pwa",
  "note": "This file is machine-readable only. All prose and manual explanations have been removed."
}
```

---

## Method: Adapt PWA for BrightSign

```json
{
  "method_id": "adapt_pwa",
  "difficulty": "low-medium",
  "production_ready": true,
  "deployment_types": {
    "primary": "static_html_bundle",
    "optional": "spa_with_nodejs_server",
    "note": "Most apps only need HTML + bundle.js loaded via roHtmlWidget. Node.js server is ONLY needed for SPAs with client-side routing."
  },
  "migration_plan": [
    "analyze_pwa_structure",
    "build_production_version",
    "adapt_pwa_features",
    "optimize_for_signage",
    "add_signage_features",
    "bundle_client_code",
    "setup_node_server_if_spa_routing",
    "generate_brightsign_deployment",
    "package_for_sd_card"
  ],
  "outputs": [
    "production_build_directory",
    "bundle.js (client code bundled)",
    "autorun.brs",
    "server.bundle.js (ONLY if SPA with routing)",
    "SD_CARD_STRUCTURE.md",
    "deployment_package"
  ]
}
```

---

## Automation Tasks

```json
{
  "analyze_pwa_structure": {
    "actions": [
      "read package.json",
      "detect framework (react/vue/angular/vanilla)",
      "find service worker files",
      "find manifest files",
      "detect client-side routing",
      "list dependencies"
    ]
  },
  "build_production_version": {
    "actions": [
      "verify build script in package.json",
      "run build command",
      "check output directory"
    ]
  },
  "adapt_pwa_features": {
    "actions": [
      "keep service workers (supported on Chromium media player for caching and offline use)",
      "remove manifest references (not needed for signage deployment)",
      "keep Web Notifications API if used (supported on Chromium media player)",
      "remove install prompts (not applicable to signage)",
      "remove background sync if used (not applicable to signage)",
      "remove PWA-specific build plugins from package.json (workbox-webpack-plugin, webpack-pwa-manifest, vite-plugin-pwa)"
    ],
    "note": "BrightSign Series 5 Chromium media player (Series 5 onwards only) supports service workers, Cache API, IndexedDB, and Web Notifications API. Only remove features that are not applicable to digital signage (install prompts, background sync, manifest). See troubleshooting.md for cases where the BrightSign media player should be used instead (Series 4, sync, UDP/RTP, chroma key)."
  },
  "optimize_for_signage": {
    "actions": [
      "update viewport meta to fixed display size",
      "increase base font size",
      "remove responsive/mobile CSS",
      "remove touch event handlers",
      "set fixed layout dimensions"
    ]
  },
  "add_signage_features": {
    "actions": [
      "add idle detection/screensaver timeout",
      "add auto-refresh for 24/7 operation",
      "add connection status monitoring",
      "add memory cleanup for long-running stability"
    ]
  },
  "bundle_client_code": {
    "critical": true,
    "applies_to": "all_deployments",
    "actions": [
      "configure webpack to bundle all client dependencies into bundle.js",
      "mark @brightsign/* APIs as commonjs externals",
      "set publicPath to /",
      "enable production mode and minification",
      "verify bundle.js contains all app code and dependencies"
    ]
  },
  "setup_node_server_if_spa_routing": {
    "optional": true,
    "required_only_if": "SPA with client-side routing (React Router, Vue Router, etc.)",
    "skip_if": "Static site or single page without routing",
    "actions": [
      "create server.js with Express",
      "serve static files from build directory",
      "add catch-all route for SPA routing (MUST be after static middleware)",
      "add health check endpoint",
      "configure webpack.server.config.js to bundle server into server.bundle.js",
      "bundle Express and dependencies into server.bundle.js"
    ]
  },
  "generate_brightsign_deployment": {
    "actions": [
      "create autorun.brs (static HTML version for most apps)",
      "create autorun.brs (Node.js version ONLY if SPA with routing)",
      "document SD card structure",
      "add deployment instructions"
    ]
  },
  "package_for_sd_card": {
    "actions": [
      "bundle all client dependencies (except @brightsign/*) into bundle.js",
      "bundle server dependencies into server.bundle.js (ONLY if Node.js server needed)",
      "copy required files to SD card root",
      "verify deployment package has minimal files",
      "ensure no node_modules folder on SD card"
    ]
  }
}
```

---

## Code Transformation Patterns

```json
{
  "adapt_pwa_patterns": {
    "remove": {
      "html": ["<link rel=\"manifest\" ...>"],
      "js": ["addEventListener('beforeinstallprompt')"],
      "dependencies": ["workbox-webpack-plugin", "webpack-pwa-manifest", "vite-plugin-pwa"]
    },
    "keep_on_chromium": {
      "note": "These features work on BrightSign Chromium media player and can be kept if useful for your signage app",
      "js": ["serviceWorker.register (caching, offline support)", "Cache API", "IndexedDB", "Notification.requestPermission", "new Notification"]
    }
  },
  "signage_optimizations": {
    "viewport": "<meta name=\"viewport\" content=\"width=1920, height=1080, initial-scale=1\">",
    "css": {
      "body": {"width": "1920px", "height": "1080px", "font-size": "24px", "overflow": "hidden"},
      "h1": {"font-size": "3rem"}
    }
  },
  "signage_features": [
    "idle detection (JS timeout)",
    "auto-refresh (setTimeout/interval)",
    "connection monitoring (window.ononline/onoffline)",
    "memory cleanup (periodic cache clear, optional GC)"
  ]
}
```

---

## Webpack Configuration (Client Bundling - Required for All)

```javascript
// webpack.config.js - Bundles all client-side code
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  mode: 'production',
  
  // CRITICAL: Mark BrightSign APIs as externals - they are provided by the runtime
  externals: {
    '@brightsign/deviceinfo': 'commonjs @brightsign/deviceinfo',
    '@brightsign/networkconfiguration': 'commonjs @brightsign/networkconfiguration',
    '@brightsign/screenshot': 'commonjs @brightsign/screenshot',
    '@brightsign/registry': 'commonjs @brightsign/registry'
    // Add other @brightsign/* modules as needed
  },
  
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  }
};
```

---

## Webpack Server Configuration (Optional - Only for SPAs with Routing)

```javascript
// webpack.server.config.js - ONLY needed if using Node.js server for SPA routing
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
  
  // Mark @brightsign/* APIs as externals if used in server code
  externals: {
    '@brightsign/deviceinfo': 'commonjs @brightsign/deviceinfo'
  },
  
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
```

---

## Express Server Pattern (Optional - Only for SPAs with Routing)

```javascript
// server.js - Create this ONLY if your app uses client-side routing
const express = require('express');
const path = require('path');
const app = express();

const BUILD_DIR = path.join(__dirname, 'dist'); // or 'build'
const PORT = 8080;

// CRITICAL: Static files middleware MUST come FIRST
app.use(express.static(BUILD_DIR));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// CRITICAL: Catch-all route MUST be LAST for SPA routing to work
app.get('*', (req, res) => {
  res.sendFile(path.join(BUILD_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## BrightSign Deployment Files

### autorun.brs Template (Static HTML - Most Common)

```brightscript
' Use this template for MOST apps - simple HTML + bundle.js
Sub Main()
    msgPort = CreateObject("roMessagePort")

    ' Use Chromium media player for full web API support (Series 5 onwards only)
    ' See troubleshooting.md if you need Series 4 support, sync, UDP/RTP, or chroma key
    registrySection = CreateObject("roRegistrySection", "html")
    registrySection.Write("use-brightsign-media-player", "0")
    registrySection.Flush()

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

### autorun.brs Template (Node.js Server - Only for SPAs with Routing)

```brightscript
' Use this ONLY if your app has client-side routing (React Router, Vue Router, etc.)
Sub Main()
    msgPort = CreateObject("roMessagePort")

    ' Use Chromium media player for full web API support (Series 5 onwards only)
    ' See troubleshooting.md if you need Series 4 support, sync, UDP/RTP, or chroma key
    registrySection = CreateObject("roRegistrySection", "html")
    registrySection.Write("use-brightsign-media-player", "0")
    registrySection.Flush()

    ' Start Node.js server with bundled server code
    node = CreateObject("roNodeJs", "server.bundle.js", {message_port: msgPort})
    sleep(3000)  ' Wait for server to initialize

    ' Launch Chromium pointing to local server
    htmlRect = CreateObject("roRectangle", 0, 0, 1920, 1080)
    htmlConfig = {
        nodejs_enabled: true,
        url: "http://localhost:8080",
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

---

## SD Card Structure

### Static Deployment (Most Common - No Node.js)

```
SD_CARD/
├── autorun.brs           # BrightSign launcher (static version)
├── index.html            # Entry point
├── bundle.js             # ALL client code bundled here
├── styles.css            # (if not bundled into bundle.js)
└── assets/               # Images, fonts, etc.
    ├── logo.png
    └── fonts/
```

### SPA with Node.js Server (Only if Client-Side Routing)

```
SD_CARD/
├── autorun.brs           # BrightSign launcher (Node.js version)
├── server.bundle.js      # Server code with Express bundled
└── dist/                 # Build output served by Express
    ├── index.html        # Entry point
    ├── bundle.js         # Client code bundled
    ├── styles.css
    └── assets/
```

---

## Validation Checklist

```json
{
  "validation": [
    "Non-signage PWA features removed (manifest, install prompts, background sync)",
    "Chromium-supported features retained if useful (service workers, Cache API, IndexedDB, Web Notifications)",
    "Display optimizations applied (viewport, fonts, layout)",
    "Signage features added (idle detection, auto-refresh, connection monitoring)",
    "Mobile-specific code removed",
    "Client code bundled into bundle.js with all dependencies (except @brightsign/*)",
    "autorun.brs uses correct template (static HTML for most apps)",
    "Node.js server bundled into server.bundle.js (ONLY if SPA with routing)",
    "SD card structure is minimal (no node_modules folder)",
    "All routes work correctly (if SPA with routing)",
    "Assets load properly (check publicPath is /)",
    "No console errors on BrightSign",
    "Remote debugging accessible on port 2999"
  ]
}
```
