# Method 1: Adapt PWA for BrightSign

[← Back to Main Guide](README.md)

**This single prompt automates the entire adaptation process:**

```
First, read and analyze the automation patterns at migration-guides/progressive-web-app/CLAUDE.md (if available).

I need you to migrate my Progressive Web App (PWA) to BrightSign using Method 1 (Adaptation for Digital Signage).

IMPORTANT - Deployment Architecture:
Most PWA migrations use a simple static deployment (HTML + bundle.js loaded via roHtmlWidget).
Node.js server is ONLY needed if the app uses client-side routing (React Router, Vue Router, etc.).
Default to static deployment unless routing is explicitly required.

Project Details:
- Project Path: {YOUR_PROJECT_PATH}
- Framework: {React/Vue/Angular/Vanilla}
- Build Tool: {Webpack/Vite/CRA/Other}
- Build Output Directory: {dist/build/other}
- SPA Routing: {YES/NO}
- Node.js Version: 18.18.2
- Target Display: {1920x1080 or 3840x2160}
- Team Expertise: {e.g., "Moderate JavaScript/Node.js"}

PWA Features Used (check all that apply):
- [ ] Service Worker (Workbox/Custom)
- [ ] Web App Manifest
- [ ] Push Notifications
- [ ] Background Sync
- [ ] Install Prompt
- [ ] Client-side Routing (React Router/Vue Router/etc.)
- [ ] Other: {SPECIFY}

Dependencies and Libraries:
- State Management: {Redux/MobX/Pinia/None}
- UI Library: {Material-UI/Bootstrap/None}
- PWA-Specific Packages: {List}
- Other Notable Dependencies: {List}

Display and Layout:
- Current Viewport Meta: {e.g., width=device-width, initial-scale=1.0}
- Responsive Breakpoints: {List or NONE}
- Touch Interactions: {YES/NO}
- Mobile-First Design: {YES/NO}

Migration Tasks:
1. Analyze the PWA structure and inventory all features, dependencies, and PWA-specific code (service worker, manifest, install prompt, etc.)
2. Remove all PWA features not needed for BrightSign:
   - Service worker registration and files
   - Web app manifest references
   - Push notifications and background sync
   - Install prompts and PWA detection
   - PWA dependencies from package.json
3. Optimize for signage:
   - Update viewport to fixed display size ({1920x1080} or {3840x2160})
   - Increase font sizes for viewing distance (24px+ base)
   - Remove responsive/mobile CSS and breakpoints
   - Remove touch event handlers
   - Update layout for landscape orientation
4. Add signage features:
   - Idle detection/screensaver timeout
   - Auto-refresh for 24/7 operation
   - Connection status monitoring
   - Memory cleanup for long-running stability
5. Build and bundle production version:
   - Verify package.json build script
   - Configure webpack to bundle ALL client dependencies into bundle.js
   - Mark @brightsign/* APIs as commonjs externals in webpack
   - Run production build and verify output
6. (ONLY if SPA with client-side routing) Set up Node.js Express server:
   - NOTE: Skip this step if your app doesn't use React Router, Vue Router, or similar
   - Create server.js with static file serving and catch-all route (must be LAST route)
   - Add health check endpoint
   - Configure webpack.server.config.js to bundle server into server.bundle.js
   - Bundle Express and dependencies into server.bundle.js
7. Generate BrightSign deployment files:
   - autorun.brs (use static HTML template for most apps, Node.js template only if routing)
   - SD_CARD_STRUCTURE.md (deployment documentation)
   - Deployment guide with troubleshooting tips
8. Package for SD card deployment:
   - For MOST apps: index.html + bundle.js + assets (static deployment)
   - For SPAs with routing: server.bundle.js + dist/ folder (Node.js deployment)
   - Ensure NO node_modules folder on SD card (everything bundled)
   - Document SD card directory structure and required files
9. Create a testing plan:
   - Pre-deployment browser testing steps
   - Node.js server testing (only if using server)
   - Remote debugging setup (Chrome DevTools on port 2999)
   - On-device verification checklist
   - Common issues and solutions

Follow all code transformation and deployment patterns from migration-guides/progressive-web-app/CLAUDE.md (if available), including:
- Remove all PWA-specific code and dependencies
- Optimize CSS and layout for fixed signage display
- Add error recovery, memory cleanup, and auto-refresh for reliability
- Use webpack externals for @brightsign/* APIs
- Provide before/after code examples for all major changes
- Output a complete, production-ready BrightSign deployment package
```

---

## Customization Guide

**Replace the following placeholders in the prompt:**

| Placeholder | Example | Description |
|------------|---------|-------------|
| `{YOUR_PROJECT_PATH}` | `c:\Users\dev\MyPWA` | Absolute path to your PWA project |
| `{React/Vue/Angular/Vanilla}` | `React` | Framework used |
| `{Webpack/Vite/CRA/Other}` | `Webpack` | Build tool used |
| `{dist/build/other}` | `dist` | Build output directory |
| `{1920x1080}` | `1920x1080` | Target display resolution |
| `{SPECIFY}` | `Custom push notification system` | Additional features or context |

**Checkbox Instructions:**
- Mark `[x]` for applicable items
- Leave `[ ]` for non-applicable items

---

## Tips for Best Results

1. **Be Specific**: Provide accurate details about your PWA's structure and features
2. **List All Dependencies**: Mention all third-party and PWA-specific packages
3. **Describe Custom Features**: Any unique functionality or requirements
4. **State Constraints**: Network, hardware, or performance requirements
5. **Review AI Output**: Check generated code and deployment artifacts
6. **Test Thoroughly**: Use the provided testing plan before deploying to BrightSign
7. **Iterate as Needed**: Refine and re-run the prompt for incremental improvements

## Troubleshooting

If you encounter issues during migration, refer to the [troubleshooting guide](./troubleshooting.md) for common problems and solutions.
