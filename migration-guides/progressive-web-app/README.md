# Progressive Web App (PWA) to BrightSign Migration Guide

**🤖 AI-First Migration**: This guide is designed for AI-assisted migration. Instead of manually executing steps, you'll work with AI agents (like Claude via the BrightDeveloper MCP) to automate the entire migration process. For machine-readable patterns and automation schemas, see [CLAUDE.md](CLAUDE.md)

If you have not set up the BrightDeveloper MCP Server yet, follow the instructions in the [Installing the MCP server](https://github.com/BrightDevelopers/BrightDev/blob/main/README.md#install-the-brightsign-mcp-server) section of the main BrightDev README file.

> Note that not everything generated using AI agents and the BrightDeveloper MCP may be perfect on the first try. You may need to iterate with the AI, provide additional context, or make manual adjustments as needed.

## Overview

Progressive Web Apps (PWAs) are web applications that use modern web capabilities to deliver app-like experiences. Since PWAs are **already web-based** with HTML/CSS/JavaScript, migration to BrightSign is straightforward - you adapt the existing web content for BrightSign's embedded environment.

**Migration Strategy**: Adapt PWA for BrightSign's embedded platform, remove browser-specific features

**⏱️ Timeline**: 1-2 weeks  
**✅ Complexity**: LOW - Your content is already HTML/CSS/JS

---

## What is a Progressive Web App?

### Architecture
```
Progressive Web App
├── Web Application (HTML/CSS/JS)
├── Service Worker (offline support)
├── Web App Manifest (installability)
└── Modern Web APIs
    ├── Push Notifications
    ├── Background Sync
    ├── Cache API
    └── IndexedDB
```

### Common Patterns

**1. Single Page Application (SPA)**
- React, Vue, Angular, or vanilla JavaScript
- Client-side routing
- Dynamic content loading
- State management

**2. Offline-First PWA**
- Service worker for caching
- Background sync capabilities
- Offline data storage (IndexedDB, Cache API)
- Progressive enhancement

**3. Installable Web App**
- Web app manifest
- Add to home screen functionality
- Standalone display mode
- App-like navigation

---

## Migration Approach

Since PWAs are already web-based, there's essentially **one migration path**:

**[Adapt PWA for BrightSign](method1-extraction.md)** - Remove PWA-specific features, adapt for embedded environment (1-2 weeks)

No transpilation needed - you're adapting existing web content for BrightSign's Chromium environment.

---

## Quick Assessment

### What Transfers Directly ✅

- **HTML pages** - Use as-is
- **CSS styles** - Use as-is (adjust for signage displays)
- **JavaScript logic** - Most works as-is
- **Business logic** - No changes needed
- **API calls** - fetch/XHR work identically
- **Modern ES6+ JavaScript** - Fully supported (Chromium 120)
- **localStorage** - Works identically
- **IndexedDB** - Works identically
- **Web workers** - Supported
- **CSS Grid/Flexbox** - Fully supported

### What Needs Adaptation ⚠️

| PWA Feature | BrightSign Equivalent |
|-------------|----------------------|
| Service Worker | Remove or adapt (always-online signage) |
| Push Notifications | Not applicable (no user interaction) |
| Background Sync | Not needed (persistent connection) |
| Web App Manifest | Remove (not installable) |
| Add to Home Screen | Not applicable |
| Geolocation API | Not available |
| Camera/Microphone (getUserMedia) | BrightSign camera API (limited models) |
| Vibration API | Not applicable |
| Share API | Not applicable |
| Install prompts | Remove |
| Notification API | Remove or use custom on-screen notifications |

### What to Optimize 🎯

- **Display Size**: Adjust for large signage displays (typically 1920x1080 or 4K)
- **Font Sizes**: Optimize for viewing distance (larger than mobile)
- **Touch Interactions**: May need removal/adaptation (not all displays are touch)
- **Viewport**: Update for fixed display size
- **Navigation**: Remove mobile gestures, use simple navigation
- **Performance**: Optimize for 24/7 operation

---

## Key Advantages of PWA Migration

**Simple migration path**:
- ✅ Content is already HTML/CSS/JavaScript
- ✅ No compilation or transpilation needed
- ✅ Modern JavaScript features supported (ES6+)
- ✅ Minimal code changes required
- ✅ Fast migration (1-2 weeks)
- ✅ Familiar web development workflow
- ✅ Most APIs work identically

**Your main work** is removing PWA-specific features and optimizing for signage displays.

---

## Common PWA Patterns

### Pattern 1: React/Vue/Angular SPA

**PWA Structure:**
```
pwa-app/
├── public/
│   ├── index.html
│   ├── manifest.json          ← Remove
│   └── service-worker.js      ← Remove or adapt
├── src/
│   ├── components/
│   ├── services/
│   ├── store/
│   └── App.jsx
├── package.json
└── build/                      ← Use this for BrightSign
```

**Migration:** Use production build, remove PWA features

### Pattern 2: Offline-First PWA

**Service Worker Code:**
```javascript
// Service worker (remove or simplify)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**Migration:** 
- Remove service worker registration
- Use direct fetch or local file serving
- BrightSign can serve content locally via Node.js

### Pattern 3: Multi-Page PWA

**PWA Structure:**
```
pwa-app/
├── index.html
├── about.html
├── contact.html
├── css/
├── js/
│   ├── main.js
│   └── sw-register.js         ← Remove
├── manifest.json              ← Remove
└── service-worker.js          ← Remove
```

**Migration:** Use HTML files directly, remove PWA registration

---

## Getting Started with AI-Assisted Migration

### 1. Let AI Analyze Your PWA

**Use this AI prompt:**

```
Analyze my Progressive Web App and provide a migration assessment:

1. **Identify PWA Structure**:
   - List all HTML entry points
   - Identify framework used (React, Vue, Angular, vanilla)
   - Find build configuration (webpack, vite, etc.)
   - Locate service worker files
   - Find web app manifest
   - Map complete folder structure

2. **Analyze PWA Features**:
   - Service worker functionality (caching, offline, background sync)
   - Web app manifest configuration
   - Push notification usage
   - Background sync usage
   - Install prompts
   - Notification API usage
   - Other PWA-specific APIs

3. **Inventory Dependencies**:
   - JavaScript framework and version
   - State management (Redux, Vuex, etc.)
   - UI libraries
   - Build tools and configuration
   - PWA-specific packages (workbox, etc.)

4. **Analyze API Usage**:
   - REST API endpoints
   - WebSocket connections
   - Local storage usage
   - IndexedDB usage
   - Cache API usage
   - Fetch/XHR patterns

5. **Assess Display Requirements**:
   - Current viewport configuration
   - Responsive design approach
   - Touch interaction patterns
   - Mobile-specific UI elements

6. **Estimate Complexity**:
   - Service worker complexity
   - Framework migration needs
   - Display optimization scope
   - Overall complexity: LOW/MEDIUM

Provide a structured migration plan with specific steps and file changes needed.
```

### 2. Let AI Adapt PWA for BrightSign

**Use this AI prompt:**

```
Adapt my Progressive Web App for BrightSign deployment:

1. **Remove PWA-Specific Features**:
   - Remove service worker registration from HTML
   - Remove service worker files
   - Remove web app manifest references
   - Remove push notification code
   - Remove background sync code
   - Remove install prompts
   - Remove notification API calls
   - Remove share API calls

2. **Create BrightSign Project Structure**:
    brightsign-pwa/
    ├── public/
    │   ├── index.html
    │   ├── css/
    │   ├── js/
    │   └── assets/
    ├── config/
    └── autorun.brs          # BrightSign launcher

3. **Adapt for Production Build**:
   - Build production version of PWA
   - Extract built files (if using framework)
   - Update asset paths for BrightSign
   - Remove source maps (optional)
   - Minify assets

4. **Optimize for Signage Displays**:
   - Update viewport for fixed display size
   - Adjust font sizes for large displays
   - Remove mobile-specific CSS
   - Update CSS for signage aspect ratios
   - Remove touch gestures (if not touch display)
   - Add display-appropriate navigation

5. **Handle Data Persistence**:
   - Keep localStorage (works on BrightSign)
   - Keep IndexedDB (works on BrightSign)
   - Replace Cache API with direct fetch
   - Use Node.js fs for local file access (if needed)

6. **Update Build Configuration**:
   - Configure webpack/vite externals for @brightsign/* APIs
   - Bundle all other dependencies (BrightSign OS doesn't provide runtime deps)
   - Remove PWA plugins from webpack/vite config
   - Update output paths for BrightSign

7. **Set up package.json**:
   - List runtime dependencies only
   - Remove build-time PWA dependencies
   - Create deploy script

Provide the complete adapted project with all necessary changes.
```

### 3. Let AI Optimize Display Settings

**Use this AI prompt:**

```
Optimize my PWA for BrightSign signage displays:

1. **Viewport and Display Configuration**:
   - Update viewport meta tag for fixed display (1920x1080 or 4K)
   - Remove responsive breakpoints (single fixed size)
   - Adjust CSS for large display viewing
   - Update font sizes for viewing distance
   - Optimize layout for landscape orientation

2. **Remove Mobile-Specific Features**:
   - Remove touch gesture handlers (swipe, pinch, etc.)
   - Remove mobile-specific CSS (@media queries for mobile)
   - Remove viewport height adjustments (100vh issues)
   - Remove pull-to-refresh prevention
   - Remove mobile navigation patterns

3. **Add Signage-Specific Features**:
   - Add idle/screensaver functionality
   - Add auto-refresh timer (if needed)
   - Add error recovery mechanisms
   - Add connection status indicators
   - Add logging for debugging

4. **Performance Optimization**:
   - Optimize for 24/7 operation
   - Add memory leak prevention
   - Implement periodic cleanup
   - Optimize image sizes for display resolution
   - Add lazy loading for media

Show before/after code for all display optimizations.
```

### 4. Let AI Set Up BrightSign Deployment

**Use this AI prompt:**

```
Prepare my PWA for BrightSign deployment:

1. **Create autorun.brs**:
   - Set up BrightScript launcher
   - Configure Chromium display settings
   - Add Node.js server (if needed for routing)
   - Include error handling and logging

2. **BrightSign API Integration** (if needed):
   - Create DeviceInfo wrapper for device info
   - Create NetworkConfiguration wrapper for network status
   - Add registry access (if configuration needed)
   - Add serial port communication (if needed)

3. **File Structure for SD Card**:
    
    SD_CARD/
    ├── autorun.brs
    ├── index.html
    ├── css/
    ├── js/
    ├── assets/
    ├── config/
    └── node_modules/        # If using Node.js

    or if using webpack.config.js:

    SD_CARD/
    ├── dist/
    │   ├── index.html
    │   ├── main.css/
    │   ├── bundle.js
    │   └── assets/
    └── autorun.brs

4. **Handle Client-Side Routing** (for SPAs):
   - Set up Node.js server for SPA routing
   - Configure fallback to index.html
   - Update BrightScript to launch Node.js server
   - Test all routes work correctly

5. **Testing Configuration**:
   - Set up remote debugging (port 2999)
   - Create logging utilities
   - Add error tracking
   - Document testing procedures

Provide complete deployment package and setup instructions.
```

---

## BrightSign Resources

**Essential Documentation:**
- [BrightSign Developer Portal](https://docs.brightsign.biz/developers)
- [JavaScript API Reference](https://docs.brightsign.biz/developers/javascript-apis)
- [Node.js Environment (v18.18.2)](https://docs.brightsign.biz/developers/nodejs)
- [Chromium 120 Web APIs](https://docs.brightsign.biz/developers/chromium)
- [Debugging Guide](https://docs.brightsign.biz/developers/debugging-htmlnode-apps)

**Example Applications:**
1. [Simple HTML/JS App](https://github.com/brightsign/dev-cookbook/tree/main/examples/simple-html-app)
2. [Node.js Server with SPA](https://github.com/brightsign/dev-cookbook/tree/main/examples/node-simple-server)
3. [React App on BrightSign](https://github.com/brightsign/dev-cookbook/tree/main/templates/cra-template-brightsign-app)

---

## Timeline Estimate

**Week 1:**
- Days 1-2: Analysis, build production version, remove PWA features
- Days 3-4: Display optimization, testing in browser
- Day 5: BrightSign deployment setup, initial device testing

**Week 2 (if needed):**
- Days 1-3: Framework-specific adaptations (SPA routing, etc.)
- Days 4-5: Extended testing and optimization

**Most PWAs**: 1 week
**Complex SPAs with routing**: 2 weeks

---

## Common Challenges and Solutions

### Challenge: Service Worker Complexity

**AI Prompt:**
```
My PWA has a complex service worker with multiple caching strategies. Help me:
1. Analyze what the service worker does
2. Determine which features are needed on BrightSign
3. Replace caching with localStorage/IndexedDB
4. Remove unnecessary offline features
5. Provide simplified data persistence code

Show migration strategy for my service worker.
```

### Challenge: SPA Routing

**AI Prompt:**
```
My PWA is a React/Vue/Angular SPA with client-side routing. Help me:
1. Set up Node.js server for routing
2. Configure server to handle all routes
3. Create autorun.brs to launch server and Chromium
4. Test all routes work correctly
5. Optimize for BrightSign environment

Provide complete server setup and deployment code.
```

### Challenge: Push Notifications

**AI Prompt:**
```
My PWA uses push notifications. Help me:
1. Identify what notifications are used for
2. Design alternative on-screen notification system
3. Create custom notification UI
4. Implement notification logic without Web Notification API
5. Test notification display

Provide alternative notification implementation.
```

### Challenge: Mobile-First Design

**AI Prompt:**
```
My PWA is mobile-first with many responsive breakpoints. Help me:
1. Identify target signage display resolution
2. Remove mobile breakpoints
3. Adjust layout for fixed large display
4. Update font sizes for viewing distance
5. Remove mobile-specific interactions
6. Test on target display size

Provide optimized CSS for signage displays.
```

---

## When to Choose This Migration

**✅ Perfect fit for PWAs:**
- Content is HTML/CSS/JavaScript
- Fast migration (1-2 weeks)
- Modern web features needed
- SPA framework (React, Vue, Angular)
- Standard web functionality

**✅ Works well even with:**
- Service workers (remove/simplify)
- Complex routing (add Node.js server)
- Modern JavaScript (fully supported)
- Large frameworks

---

## Next Steps

1. Run the AI analysis prompt to assess your PWA
2. Build production version
3. Remove PWA-specific features
4. Optimize for signage displays
5. Set up BrightSign deployment
6. Test on device

For detailed step-by-step instructions, see [Method 1: Adapt PWA for BrightSign →](method1-extraction.md)
