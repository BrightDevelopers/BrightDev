# Progressive Web App (PWA) to BrightSign Migration Guide

**🤖 AI-First Migration**: This guide is designed for AI-assisted migration. Instead of manually executing steps, you'll work with AI agents (like Claude via the BrightDeveloper MCP) to automate the entire migration process. For machine-readable patterns and automation schemas, see [CLAUDE.md](CLAUDE.md)

If you have not set up the BrightDeveloper MCP Server yet, follow the instructions in the [Installing the MCP server](https://github.com/BrightDevelopers/BrightDev/blob/main/README.md#install-the-brightsign-mcp-server) section of the main BrightDev README file.

> Note that not everything generated using AI agents and the BrightDeveloper MCP may be perfect on the first try. You may need to iterate with the AI, provide additional context, or make manual adjustments as needed.

## Overview

Since PWAs are **already web-based** with HTML/CSS/JavaScript, migration to BrightSign is straightforward. You'll adapt existing web content for BrightSign's embedded Chromium environment, removing PWA-specific features that don't apply to digital signage.

**⚡ Key Factors**: Routing complexity (SPAs need Node.js), service worker usage, display optimizations  
**📊 Complexity**: Typically LOW to MEDIUM - see assessment details [below](#migration-complexity-assessment)

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

## Migration Complexity Assessment

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

## Migration Approach

**What you'll do:**
1. Build production version of your PWA
2. Adapt existing content for BrightSign's embedded Chromium environment (HTML, CSS, JS, fetch/XHR, localStorage, IndexedDB, etc.)
3. Remove PWA-specific features (service workers, manifest, notifications, background sync, install prompts, etc.)
4. Optimize display and fonts for signage viewing distance
5. Set up Node.js server (if SPA with client-side routing)
6. Add auto-refresh, idle detection, memory cleanup for 24/7 operation (if needed)
7. Create BrightSign deployment files

Refer to **[Adapt PWA for BrightSign →](method1-adapt.md)** for the complete AI prompt to help with your PWA migration.

---

## BrightSign Resources

- [BrightSign Developer Portal](https://docs.brightsign.biz/developers)
- [JavaScript API Reference](https://docs.brightsign.biz/developers/javascript-apis)
- [Debugging HTML/Nodejs apps](https://docs.brightsign.biz/developers/debugging-htmlnode-apps)
