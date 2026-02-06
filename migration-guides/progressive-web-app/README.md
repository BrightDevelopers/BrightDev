# Progressive Web App (PWA) to BrightSign Migration Guide

**🤖 AI-First Migration**: This guide is designed for AI-assisted migration. Instead of manually executing steps, you'll work with AI agents (like Claude via the BrightDeveloper MCP) to automate the entire migration process. For machine-readable patterns and automation schemas, see [CLAUDE.md](CLAUDE.md)

If you have not set up the BrightDeveloper MCP Server yet, follow the instructions in the [Installing the MCP server](https://github.com/BrightDevelopers/BrightDev/blob/main/README.md#install-the-brightsign-mcp-server) section of the main BrightDev README file.

> Note that not everything generated using AI agents and the BrightDeveloper MCP may be perfect on the first try. You may need to iterate with the AI, provide additional context, or make manual adjustments as needed.

## Overview

Since PWAs are **already web-based** with HTML/CSS/JavaScript, migration to BrightSign is straightforward. You'll adapt existing web content for BrightSign's embedded Chromium environment, removing PWA-specific features that don't apply to digital signage.

**Migration Strategy**: Remove PWA features → Optimize for signage displays → Deploy to BrightSign

**⚡ Key Factors**: Routing complexity (SPAs need Node.js), service worker usage, display optimizations  
**📊 Complexity**: Typically LOW to MEDIUM - see assessment criteria [below](#complexity-assessment)

---

## Migration Approach

**[Adapt PWA for BrightSign →](method1-adapt.md)**

Since PWAs are already web-based, there's **one migration path**: adapt existing content for BrightSign's embedded environment. No transpilation needed.

**What you'll do:**
1. Build production version of your PWA
2. Remove PWA-specific features (service worker, manifest, notifications)
3. Optimize display and fonts for signage viewing distance
4. Set up Node.js server (if SPA with client-side routing)
5. Create BrightSign deployment files

---

## Quick Assessment

### Core Web Content ✅
HTML, CSS, JavaScript, business logic, fetch/XHR, localStorage, IndexedDB, Web Workers - all work as-is on BrightSign's Chromium 120.

### PWA Features to Remove ⚠️
Service workers, web manifest, push notifications, background sync, install prompts, geolocation - not applicable for digital signage.

### Signage Optimizations 🎯
- **Large displays**: Update viewport and layout for 1920x1080 or 4K
- **Viewing distance**: Increase font sizes for readability (24px+ base)
- **SPA routing**: Add Node.js Express server for client-side routes
- **24/7 operation**: Add auto-refresh, idle detection, memory cleanup



## Getting Started with AI-Assisted Migration

**Recommended Approach:** Use AI assistance (like Claude with the BrightDeveloper MCP) to automate migration steps.

### Quick Start Prompt

```
Migrate my Progressive Web App to BrightSign:

Source: [your-project-path]
Framework: [React/Vue/Angular/Vanilla]
Display: [1920x1080 or 3840x2160]

Refer to CLAUDE.md for PWA migration patterns and automation schemas.

Tasks:
1. Analyze PWA structure and dependencies
2. Build production version
3. Remove PWA features (service worker, manifest, notifications)
4. Optimize for signage (viewport, fonts, layout)
5. Set up Node.js server (if SPA with routing)
6. Create BrightSign deployment files (autorun.brs)
7. Generate SD card deployment structure

Provide step-by-step results and complete migration report.
```

💡 **For detailed step-by-step AI prompts and guidance**, see [Method 1: Adapt PWA for BrightSign →](method1-adapt.md)

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

## Complexity Assessment

Use these factors to estimate migration effort for your team:

**LOW Complexity** - Static PWA or simple SPA
- No service worker or simple caching only
- Standard viewport and layout
- Few dependencies
- No complex routing

**MEDIUM Complexity** - SPA with routing
- Complex service worker with multiple strategies
- Client-side routing requiring Node.js server
- Custom viewport or responsive design
- Multiple API integrations

**HIGH Complexity** - Advanced PWA features
- Background sync or push notifications to replace
- Complex offline-first architecture
- Mobile-first design requiring significant layout changes
- Framework-specific build optimizations needed

---

## Common Migration Challenges

PWA migrations may encounter specific challenges like complex service workers, SPA routing, push notifications, or mobile-first designs.

💡 **For detailed AI prompts to overcome these challenges**, see the [Common Migration Challenges](method1-adapt.md#common-migration-challenges) section in the detailed migration guide.

---

## When to Choose This Migration

**✅ Ideal when:**
- Your PWA is already built with HTML/CSS/JavaScript
- You want to leverage existing web frameworks (React, Vue, Angular)
- Your content needs modern web APIs and ES6+ JavaScript
- You need quick deployment with minimal code changes

**✅ Handles well:**
- Service workers → Remove or simplify
- SPA routing → Add Node.js Express server
- Mobile-first design → Optimize for fixed displays
- Offline features → Replace with signage-appropriate alternatives

---

## Next Steps

1. Run the AI analysis prompt to assess your PWA
2. Build production version
3. Remove PWA-specific features
4. Optimize for signage displays
5. Set up BrightSign deployment
6. Test on device

For detailed step-by-step instructions, see [Method 1: Adapt PWA for BrightSign →](method1-adapt.md)
