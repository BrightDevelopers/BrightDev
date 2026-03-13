# Method 2: Fresh HTML/JavaScript/Node.js Application ⭐

[← Back to Main Guide](README.md)

Build a new application from scratch using native web technologies. This provides the best long-term value despite higher initial effort.

- **🎯 Best for**: Production deployments  
- **📦 Target Platform**: Node.js v18.18.2 (BrightSign OS)
- **✅ BrightSign Recommended**: Superior debugging, easier maintenance, better performance, and full platform integration

---

# AI-Assisted Migration with BrightDeveloper MCP

The prompt below orchestrates AI to analyze your Kotlin app, design the web architecture, generate all code, and create deployment artifacts.

Before using this prompt:
- ✅ Ensure the [BrightDeveloper MCP server](https://github.com/BrightDevelopers/technical-documentation/blob/main/MCP-SERVER-HOWTO.md) is connected
- ✅ Have your Kotlin project accessible in the workspace
- ✅ Attach the [CLAUDE.md](CLAUDE.md) file to the AI context for code transformation patterns


**This single prompt automates the entire rebuild process:**

```
First, read and analyze the automation patterns at migration-guides/kotlin/CLAUDE.md.

I need you to migrate my Kotlin Android application to JavaScript/Node.js for BrightSign using Method 2 (Fresh Rebuild).

Project Details:
- Project Path: {YOUR_PROJECT_PATH}
- Main Package: {YOUR_PACKAGE_NAME}
- Target BrightSign Model: {e.g., XT1144, XD1034, or "any"}
- Team Expertise: {e.g., "Moderate JavaScript/Node.js"}

Current Application Architecture:
- Number of UI Screens: {NUMBER}
- Data Layer: {e.g., "SharedPreferences + Retrofit API calls"}
- Business Logic Complexity: {LOW/MEDIUM/HIGH}
- Background Services: {YES/NO - describe if yes}

Android APIs to Replace:
- [ ] SharedPreferences → localStorage/IndexedDB
- [ ] Room Database → IndexedDB
- [ ] Retrofit/OkHttp → fetch() API
- [ ] Android MediaPlayer → HTML5 video/BrightSign videooutput
- [ ] Toast notifications → Custom UI notifications
- [ ] File I/O → Node.js fs module
- [ ] Other: {SPECIFY}

BrightSign Platform Features Needed:
- [ ] Device information (model, serial number, OS version)
- [ ] Network configuration
- [ ] Video playback control
- [ ] Screenshot capture
- [ ] Serial port communication
- [ ] Custom hardware integration
- [ ] Other: {SPECIFY}

Backend Requirements:
- Node.js Server: {YES/NO}
- API Endpoints: {LIST_REQUIRED_ENDPOINTS}
- Database: {NONE/IndexedDB/Remote Database}

Migration Tasks:
1. Analyze my Kotlin application and create a comprehensive feature inventory
2. Set up BrightSign development environment (Node.js project structure)
3. Configure webpack with BrightSign API externals and development mocks
4. For each Android Activity/Fragment, create equivalent HTML/CSS/JavaScript UI
5. Rebuild data layer using localStorage/IndexedDB (replace SharedPreferences/Room)
6. Rebuild networking layer using fetch() API (replace Retrofit/OkHttp)
7. Create BrightSignPlatform abstraction class for device APIs with async initialization
8. Implement Node.js backend if needed (Express server)
9. Create package.json with all required dependencies (webpack, loaders, plugins)
10. Create autorun.brs launcher file with nodejs_enabled: true, inspector_server port 2999, and proper URL configuration
11. Generate deployment package with all assets (dist/ folder + autorun.brs)
12. Provide testing checklist and debugging and deployment instructions

Code Quality Requirements:
- Use modern ES6+ JavaScript syntax
- Implement proper error handling
- Add console logging for debugging
- Follow BrightSign best practices from CLAUDE.md
- Create modular, maintainable code structure

Follow all transformation patterns from CLAUDE.md, including:
- Platform abstraction for BrightSign APIs with async initialization
- localStorage wrapper for data persistence
- Custom notification system for Toast replacements
- Proper webpack externals configuration

Output a production-ready BrightSign application with complete documentation.
```

---

## Customization Guide

**Replace the following placeholders in the prompt:**

| Placeholder | Example | Description |
|------------|---------|-------------|
| `{YOUR_PROJECT_PATH}` | `c:\Users\dev\MyKotlinApp` | Absolute path to your Kotlin project |
| `{YOUR_PACKAGE_NAME}` | `com.example.myapp` | Your Android app's main package name |
| `{YOUR_BRIGHTSIGN_MODEL}` | `XT1144` or `any` | Target BrightSign player model |
| `{NUMBER}` | `5` | Count of activities, screens, or endpoints |
| `{LIST_REQUIRED_ENDPOINTS}` | `/api/users, /api/stats` | Backend API endpoints needed |
| `{SPECIFY}` | Descriptive details | Additional context for your project |

**Checkbox Instructions:**
- Mark `[x]` for applicable items
- Leave `[ ]` for non-applicable items
