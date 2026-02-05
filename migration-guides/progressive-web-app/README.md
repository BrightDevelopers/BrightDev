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

**[Adapt PWA for BrightSign](method1-adapt.md)** - Remove PWA-specific features, adapt for embedded environment (1-2 weeks)

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

For AI-assisted migration, work with your AI assistant (like Claude via the BrightDeveloper MCP) to automate the migration process.

**Quick Start:**
1. **Analyze** - Ask AI to analyze your PWA structure, dependencies, and features
2. **Adapt** - Ask AI to remove PWA features and optimize for BrightSign displays
3. **Deploy** - Ask AI to create deployment files (autorun.brs, server setup, etc.)

💡 **For detailed AI prompts and step-by-step instructions**, see [Method 1: Adapt PWA for BrightSign →](method1-adapt.md#step-1-analyze-your-pwa)

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

## Common Migration Challenges

PWA migrations may encounter specific challenges like complex service workers, SPA routing, push notifications, or mobile-first designs.

💡 **For detailed AI prompts to overcome these challenges**, see the [Common Migration Challenges](method1-adapt.md#common-migration-challenges) section in the detailed migration guide.

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

For detailed step-by-step instructions, see [Method 1: Adapt PWA for BrightSign →](method1-adapt.md)
