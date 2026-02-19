# Method 1: Adapt PWA for BrightSign

> **🎯 Complexity**: **LOW to MEDIUM**  
> **🚀 Best for**: All Progressive Web Apps (primary migration path)  
> **⚡ Key Factors**: SPA routing complexity, service worker usage, display optimizations

---

## Overview

PWAs are already web applications, so migration involves simple **adaptation**:

1. Build production version
2. Remove PWA features (service worker, manifest, notifications)
3. Optimize for signage displays (viewport, fonts, layout)
4. Set up Node.js server (if SPA with routing)
5. Deploy to BrightSign with autorun.brs

**Recommended Approach**: Use AI assistance for each step below. Separating prompts is a great way to maintain clean context and execute AI code generation in a structured way.

---

## Step 1: Analyze Your PWA

### AI Prompt: Analyze PWA Structure

```
Analyze my Progressive Web App and provide detailed assessment.

Refer to CLAUDE.md for PWA analysis patterns and automation schemas if needed.

Tasks:

1. **Identify Framework and Build Setup**:
   - Detect framework: React, Vue, Angular, or vanilla JavaScript
   - Find framework version
   - Identify build tool (Vite, Webpack, Create React App, etc.)
   - Locate build configuration files
   - Identify build output directory (build/, dist/, etc.)

2. **Find PWA Features**:
   - Locate service worker file(s)
   - Find service worker registration code
   - Identify caching strategies used
   - Check for Workbox usage
   - Find web app manifest file
   - Check for push notification code
   - Check for background sync
   - Check for install prompts
   
3. **Analyze Application Structure**:
   - Identify entry point (index.html)
   - Map component/page structure
   - Check for client-side routing
   - List all routes (if SPA)
   - Identify API endpoints used
   - Check data persistence methods (localStorage, IndexedDB, etc.)

4. **Inventory Dependencies**:
   - List all runtime dependencies
   - List PWA-specific packages
   - Identify state management library
   - Check for UI component libraries

5. **Assess Display Configuration**:
   - Current viewport settings
   - Responsive breakpoints used
   - Touch interaction patterns
   - Mobile-specific features

Provide complete analysis with file paths and specific recommendations.
```

**Expected Output** (summarized):
```
Framework: React 18.2.0 with Vite
Build Output: dist/

PWA Features: Service worker (Workbox), manifest, install prompt
Routing: Client-side (react-router-dom) - 5 routes
Complexity: MEDIUM (requires Node.js server for routing)

Key Actions:
- Remove service worker and manifest
- Set up Express server for SPA routing
- Optimize viewport and fonts for 1920x1080
```

---

## Step 2: Build Production Version

### AI Prompt: Build Production PWA

```
Build production version of my PWA.

Consult CLAUDE.md for build automation patterns if needed.

Tasks:

1. **Check Build Configuration**:
   - Verify package.json build script
   - Check build tool configuration
   - Configure webpack to bundle all dependencies into bundle.js
   - Mark @brightsign/* APIs as commonjs externals in webpack
   - Identify any environment variables needed
   - Check for build-time optimizations

2. **Run Production Build**:
   - Execute build command
   - Verify build completes successfully
   - Check output directory
   - Verify all assets are bundled

3. **Analyze Build Output**:
   - List all generated files
   - Check file sizes
   - Verify source maps (optional for debugging)
   - Check for any build warnings

4. **Test Build Locally**:
   - Serve production build locally
   - Test all routes work
   - Verify all features function
   - Check console for errors

Execute build and provide complete output analysis.
```

---

## Step 3: Adapt and Optimize for BrightSign

### AI Prompt

```
Adapt my PWA for BrightSign digital signage.

Path: [your-project-path]
Nodejs version: 18.18.2
Display: 1920x1080 (or 3840x2160 for 4K)

Remove PWA Features:
1. Service worker registration and files
2. Web app manifest references
3. Push notifications and background sync
4. Install prompts and PWA detection
5. PWA dependencies from package.json

Optimize for Signage:
1. Update viewport to fixed display size (1920x1080)
2. Increase font sizes for viewing distance (24px+ base)
3. Remove responsive breakpoints and mobile CSS
4. Remove touch event handlers
5. Update layout for landscape orientation

Add Signage Features:
1. Idle detection / screensaver timeout
2. Auto-refresh for 24/7 operation
3. Connection status monitoring
4. Memory cleanup for long-running stability

Show all changes with before/after examples.
```

<details>
<summary><strong>Manual Implementation Reference</strong></summary>

### Key Code Examples

**1. Remove Service Worker Registration**

**Before (index.html or main.js):**
```javascript
// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
}
```

**After:**
```javascript
// Service worker removed - not needed for BrightSign
```

**2. Update Viewport and Font Sizes for Signage**

**Before (index.html + styles.css):**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
```css
:root {
    --font-size-base: 16px;
}

body {
    font-size: var(--font-size-base);
}

h1 {
    font-size: 2rem; /* 32px */
}
```

**After (index.html + styles.css):**
```html
<meta name="viewport" content="width=1920, height=1080, initial-scale=1.0">
```
```css
:root {
    --font-size-base: 24px; /* Increased for viewing distance */
}

body {
    font-size: var(--font-size-base);
    width: 1920px;
    height: 1080px;
    overflow: hidden;
}

h1 {
    font-size: 3rem; /* 72px - larger for signage */
}
```

**3. Add Signage Features (Idle Detection & Auto-Refresh)**

```javascript
// Idle detection for screensaver
let idleTimer = null;
const IDLE_TIMEOUT = 60000; // 1 minute

function resetIdleTimer() {
    clearTimeout(idleTimer);
    hideScreensaver();
    idleTimer = setTimeout(() => showScreensaver(), IDLE_TIMEOUT);
}

document.addEventListener('click', resetIdleTimer);
document.addEventListener('keypress', resetIdleTimer);
resetIdleTimer();

// Auto-refresh every 24 hours for reliability
setTimeout(() => {
    console.log('Auto-refresh triggered (24-hour cycle)');
    window.location.reload();
}, 86400000);
```

**Additional Changes:**
- Remove web app manifest references (`<link rel="manifest">`, theme-color meta tags)
- Remove install prompt components
- Remove responsive breakpoints (@media queries)
- Remove touch event handlers (touchstart, touchmove, touchend)
- Add connection status monitoring
- Add memory cleanup for long-running stability

---
</details>

## Step 4: Set Up Node.js Server (for SPAs)

**Note**: Only needed if your PWA uses client-side routing (React Router, Vue Router, Angular Router)

### AI Prompt

```
Create Node.js Express server for my SPA routing.

Path: [your-project-path]
Build Directory: dist (webpack output)

Tasks:
1. Create server.js with Express
2. Configure static file serving from dist/
3. Add catch-all route for client-side routing
4. Add health check endpoint
5. Update package.json with express dependency and build script
6. Ensure webpack bundles all dependencies except express
7. Test server locally with all routes

Provide complete server code and setup instructions.
```

<details>
<summary><strong>Manual Server Implementation Reference</strong></summary>

**server.js:**
```javascript
const express = require('express');
const path = require('path');
const app = express();

// Configuration
const PORT = process.env.PORT || 8080;
const BUILD_DIR = path.join(__dirname, 'dist'); // Webpack output directory

// Middleware - serve static files
app.use(express.static(BUILD_DIR));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API proxy (if needed)
// app.use('/api', proxy('https://api.example.com'));

// Catch-all route - send to index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(BUILD_DIR, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Serving files from ${BUILD_DIR}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
```

**package.json updates:**
```json
{
  "dependencies": {
    "express": "^4.18.2"
  },
  "scripts": {
    "start": "node server.js",
    "build": "webpack --config webpack.config.js"
  }
```

</details>

---

## Step 5: Create BrightSign Deployment

### AI Prompt

```
Generate BrightSign deployment files for my PWA.

Application Type: [SPA with Node.js OR Static]
Display: [1920x1080 OR 3840x2160]
Build Directory: dist (webpack bundled output)

Create:
1. autorun.brs (BrightSign launcher script)
   - Configure for SPA (with Node.js) or static serving
   - Set display resolution
   - Enable remote debugging (port 2999)
   - Add error handling

2. SD_CARD_STRUCTURE.md (deployment documentation)
   - List all required files (including bundle.js)
   - Include directory structure
   - Add setup instructions

3. Deployment guide with troubleshooting tips

Provide complete deployment package.
```

<details>
<summary><strong>Manual autorun.brs Templates</strong></summary>

**For SPA with Node.js:**
```brightscript
' autorun.brs - SPA with Node.js Server
Sub Main()
    msgPort = CreateObject("roMessagePort")
    
    ' Start Node.js server
    print "Starting Node.js server..."    
    node = CreateObject("roNodeJs", "SD:/server.js")
    
    ' Wait for server to start
    sleep(3000)
    print "Server started, launching Chromium..."
    
    ' Launch Chromium
    htmlRect = CreateObject("roRectangle", 0, 0, 1920, 1080)
    htmlConfig = {
        nodejs_enabled: true,
        url: "file:///sd:/index.html",
        port: msgPort,
        security_params: {
            websecurity: false
        }
    }
    
    html = CreateObject("roHtmlWidget", htmlRect, htmlConfig)
    html.Show()
    
    ' Event loop with error handling
    errorCount = 0
    maxErrors = 5
    
    while true
        msg = wait(0, msgPort)
        msgType = type(msg)
        
        if msgType = "roHtmlWidgetEvent" then
            reason = msg.GetReason()
            print "HTML Widget Event: "; reason
            
            if reason = "load-error" or reason = "load-aborted" then
                print "Error loading content"
                errorCount = errorCount + 1
                
                if errorCount < maxErrors then
                    print "Retrying... ("; errorCount; "/"; maxErrors; ")"
                    sleep(2000)
                    html.Reload()
                else
                    print "Max errors reached, rebooting..."
                    RebootSystem()
                end if
            else if reason = "load-finished" then
                print "Content loaded successfully"
                errorCount = 0
            end if
            
        else if msgType = "roNodeJsEvent" then
            print "Node.js Event: "; msg.GetString()
            
        end if
    end while
End Sub
```

**For Static PWA (no Node.js):**
```brightscript
' autorun.brs - Static PWA
Sub Main()
    msgPort = CreateObject("roMessagePort")
    
    ' Configuration
    displayWidth = 1920
    displayHeight = 1080
    
    ' Launch Chromium with local file
    htmlRect = CreateObject("roRectangle", 0, 0, displayWidth, displayHeight)
    htmlConfig = {
        url: "file:///sd:/index.html"
        port: msgPort
        inspector_server: { port: 2999 }
        javascript_enabled: true
        nodejs_enabled: true
    }
    
    html = CreateObject("roHtmlWidget", htmlRect, htmlConfig)
    html.Show()
    
    ' Event loop
    while true
        msg = wait(0, msgPort)
        msgType = type(msg)
        
        if msgType = "roHtmlWidgetEvent" then
            reason = msg.GetReason()
            print "HTML Widget Event: "; reason
            
            if reason = "load-error" then
                print "Error loading content, reloading..."
                sleep(2000)
                html.Reload()
            end if
        end if
    end while
End Sub
```

</details>

---

## Step 6: Package for Deployment

### AI Prompt

```
Package my BrightSign application for SD card deployment.

Application Type: [SPA with Node.js OR Static]
Build Directory: dist (webpack bundled output)

Tasks:
1. Configure webpack to bundle all npm dependencies into bundle.js
   - Include all dependencies in the bundle
   - Add BrightSign APIs (@brightsign/*) as commonjs externals
   - Ensure proper module resolution
2. Document SD card directory structure
3. List all required files
4. Create deployment instructions
5. Add pre-deployment checklist
6. Include SD card formatting requirements
7. Provide testing steps

Output complete deployment guide with webpack configuration.
```

<details>
<summary><strong>Manual Deployment Reference</strong></summary>

### Webpack Configuration for Bundling

**Important**: Bundle all npm dependencies to avoid deploying `node_modules/` to the SD card.

**webpack.config.js:**
```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js', // Your main entry point
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
  
  // Mark BrightSign APIs as external (commonjs modules)
  externals: {
    '@brightsign/deviceinfo': 'commonjs @brightsign/deviceinfo',
    '@brightsign/networkconfiguration': 'commonjs @brightsign/networkconfiguration',
    '@brightsign/serialport': 'commonjs @brightsign/serialport',
    // Add other @brightsign/* APIs as needed
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
      }
    ]
  },
  
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
```

**Why bundle dependencies:**
- Avoids copying large `node_modules/` folder to SD card
- Reduces deployment size significantly  
- Faster load times on BrightSign
- Only BrightSign-specific APIs remain as external modules

**Why mark @brightsign/* as externals:**
- These APIs are provided by the BrightSign runtime
- Cannot be bundled (native modules)
- Must be loaded as commonjs modules by the player

**package.json scripts:**
```json
{
  "scripts": {
    "build": "npx webpack",
    "build:prod": "NODE_ENV=production npx webpack"
  },
  "devDependencies": {
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.4",
    "babel-loader": "^9.1.2",
    "@babel/core": "^7.22.0",
    "@babel/preset-env": "^7.22.0",
    "@babel/preset-react": "^7.22.0",
    "style-loader": "^3.3.3",
    "css-loader": "^6.8.1"
  }
}
```

---

**SD Card Structures:**

**For SPA with Node.js (with bundled dependencies):**
```
SD_CARD/
├── autorun.brs           # BrightSign launcher
├── server.js             # Express server (if needed)
├── package.json          # Only express dependency
├── node_modules/         # Only express (minimal)
│   └── express/
└── dist/                 # Production build
    ├── index.html
    ├── bundle.js         # All app dependencies bundled
    ├── styles.css
    └── assets/
        └── images/
```

**For Static PWA (fully bundled):**
```
SD_CARD/
├── autorun.brs           # BrightSign launcher
├── index.html            # Main HTML
├── bundle.js             # All dependencies bundled
├── styles.css
└── assets/
    └── images/
```

**Note**: If using BrightSign APIs (@brightsign/*), they remain as external modules and are loaded by the BrightSign runtime, not included in bundle.js.

### Deployment Steps

```bash
# 1. Configure webpack (if not already done)
# Create webpack.config.js with externals for @brightsign/* APIs

# 2. Build production version with dependencies bundled
npm run build  # Uses webpack to create bundle.js

# 3. Create deployment directory
mkdir brightsign-deploy
cd brightsign-deploy

# 4a. For SPA with Node.js - copy bundled build
cp -r ../dist ./
cp ../server.js ./
cp ../package.json ./  # Only includes express
cp ../autorun.brs ./

# Install only production dependencies (just express)
npm install --production --omit=dev

# 4b. For Static - copy bundled build only
cp -r ../dist/* ./
cp ../autorun.brs ./
# No node_modules needed - everything bundled!

# 5. Copy to SD card
# - Insert SD card
# - Format as FAT32 or exFAT
# - Copy all files to root of SD card

# 6. Test on BrightSign
# - Insert SD card into player
# - Power on
# - Application should start automatically

# Verify bundle size
ls -lh dist/bundle.js  # Should be significantly smaller than node_modules
```

**Benefits of bundling:**
- SD card deployment: ~5-20 MB instead of 50-200+ MB
- Faster initial load on BrightSign
- Simpler deployment process
- Fewer files to manage

</details>

---

## Testing and Verification

### AI Prompt for Testing

```
Create testing plan for my BrightSign PWA deployment.

Provide:
1. Pre-deployment browser testing steps
2. Node.js server testing (if SPA)
3. Remote debugging setup (Chrome DevTools on port 2999)
4. On-device verification checklist
5. Common issues and solutions

Include specific commands and URLs to test.
```

<details>
<summary><strong>Manual Testing Reference</strong></summary>

**1. Test in Browser:**
```bash
# Serve production build locally
npm run build
npm start  # or npx serve -s dist

# Open http://localhost:8080
# Verify:
# - All pages load
# - All routes work (for SPA)
# - No console errors
# - Display looks correct at 1920x1080
# - bundle.js loads correctly (check Network tab)
```

**2. Test Node.js Server (if SPA):**
```bash
node server.js

# Test endpoints:
curl http://localhost:8080/health
curl http://localhost:8080/
curl http://localhost:8080/about

# All should return HTML or JSON
```

### On-Device Testing

**1. Remote Debugging:**
```bash
# Connect to BrightSign on same network
# Open Chrome on your computer
# Navigate to: http://BRIGHTSIGN_IP:2999

# Chrome DevTools will open
# Check console for errors
# Inspect elements
# Test functionality
```

**2. Log Monitoring:**
```bash
# View BrightScript logs
# SSH into BrightSign (if enabled)
ssh brightsign@BRIGHTSIGN_IP
```

---

## Common Issues and Solutions

### Issue 1: Routes Return 404

**Problem**: Client-side routes don't work, return 404

**Solution**: Ensure Node.js server is set up correctly

```javascript
// server.js - Make sure catch-all route is LAST
app.use(express.static('dist'));

// This must be after all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

### Issue 2: Fonts/Assets Not Loading

**Problem**: Fonts or images return 404

**Solution**: Check asset paths and webpack configuration

```javascript
// Verify assets are in dist directory
ls -R dist/

// Check webpack configuration
// webpack.config.js
module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/', // Should be '/' for BrightSign
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource'
      }
    ]
  }
}
```

### Issue 3: Application Not Starting

**Problem**: BrightSign shows black screen

**Solutions**:
```brightscript
' Add debugging to autorun.brs
print "Starting application..."
print "Display: "; displayWidth; "x"; displayHeight
print "URL: "; url

' Check Node.js is starting
node = CreateObject("roNodeJs", config)
if node = invalid then
    print "ERROR: Failed to create Node.js object"
else
    print "Node.js object created successfully"
    node.RunProgram(nodeScript)
end if
```

### Issue 4: Display Size Wrong

**Problem**: Content doesn't fill screen or is cut off

**Solution**: Verify viewport and CSS

```html
<!-- Check viewport -->
<meta name="viewport" content="width=1920, height=1080, initial-scale=1.0">
```

```css
/* Check body size */
body {
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    margin: 0;
    padding: 0;
}
```

</details>

---

## Common Migration Challenges

Use these AI prompts when encountering specific migration issues:

### Complex Service Worker

```
Analyze and replace my complex service worker.

Tasks:
1. Analyze caching strategies and offline features
2. Determine what's needed for always-online signage
3. Replace with localStorage/IndexedDB where appropriate
4. Remove unnecessary PWA offline features

Provide replacement strategy with code examples.
```

### SPA Client-Side Routing

```
My PWA uses [React Router/Vue Router/Angular Router] for client-side routing.

Tasks:
1. Set up Express server for SPA routing
2. Configure catch-all route correctly
3. Create autorun.brs for Node.js + Chromium
4. Test all application routes

Provide complete server setup code.
```

### Push Notifications

```
Replace Web Push Notifications with on-screen alternative.

Tasks:
1. Analyze current notification usage
2. Design custom on-screen notification system
3. Create notification UI component  
4. Remove Web Notification API dependencies

Provide complete replacement implementation.
```

### Mobile-First Design

```
Optimize mobile-first responsive design for fixed 1920x1080 signage display.

Tasks:
1. Remove all mobile breakpoints
2. Update viewport to 1920x1080 fixed
3. Increase font sizes for viewing distance
4. Remove touch interactions
5. Set fixed layout dimensions

Show all CSS and JavaScript changes needed.
```

---

## Optimization Tips

<details>
<summary><strong>Performance and Reliability Best Practices</strong></summary>

### Error Recovery

```javascript
// 1. Add memory cleanup for 24/7 operation
setInterval(() => {
    // Clear old data
    if (dataCache.size > 1000) {
        dataCache.clear();
    }
    
    // Force garbage collection (if available)
    if (global.gc) {
        global.gc();
    }
}, 3600000); // Every hour

// 2. Implement lazy loading for images
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            imageObserver.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// 3. Add error recovery
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Log error for debugging
    logError(event.error);
    
    // Optionally reload on critical errors
    if (isCriticalError(event.error)) {
        setTimeout(() => {
            location.reload();
        }, 5000);
    }
});
```

### Auto-Refresh

```javascript
// Reload page daily to clear memory
const DAILY_REFRESH_TIME = '03:00'; // 3 AM

function scheduleDailyRefresh() {
    const now = new Date();
    const [hours, minutes] = DAILY_REFRESH_TIME.split(':');
    
    const refreshTime = new Date();
    refreshTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    if (refreshTime <= now) {
        refreshTime.setDate(refreshTime.getDate() + 1);
    }
    
    const msUntilRefresh = refreshTime - now;
    
    setTimeout(() => {
        console.log('Daily refresh triggered');
        location.reload();
    }, msUntilRefresh);
}

scheduleDailyRefresh();
```

</details>

---

## What's Next

After migration is complete:

1. Deploy to SD card and test on actual BrightSign device
2. Set up remote debugging (port 2999) for troubleshooting
3. Monitor application stability over 24-48 hours
4. Fine-tune display settings based on viewing environment

**Need help?** Use the AI prompts throughout this guide or consult [CLAUDE.md](CLAUDE.md) for automation patterns.
