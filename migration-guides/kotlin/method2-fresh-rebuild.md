# Method 2: Fresh HTML/JavaScript/Node.js Application ⭐

> **🤖 AI-Driven Rebuild**: This method uses AI to analyze your Kotlin app and rebuild it from scratch using web technologies. AI handles architecture design, code generation, and configuration. For machine-readable patterns, see [CLAUDE.md](CLAUDE.md)

[← Back to Main Guide](README.md)

---

## Overview

Build a new application from scratch using native web technologies. This provides the best long-term value despite higher initial effort.

**⏱️ Timeline**: 4-6 weeks  
**🎯 Best for**: Production deployments  
**✅ BrightSign Recommended**  
**📦 Target Platform**: Node.js v18.18.2 (BrightSign OS)

---

## Why BrightSign Recommends This Method

- ✅ **Superior debugging** - Full Chrome DevTools support
- ✅ **Easier maintenance** - Clean, readable JavaScript code
- ✅ **Better performance** - Optimized for BrightSign's engine
- ✅ **Incremental development** - Build and test feature by feature
- ✅ **Direct API access** - Full BrightSign platform integration
- ✅ **Future-proof** - Easy to extend and modify

---

## AI-Driven Migration Workflow

### Step 1: AI Analyzes Your Android Application

**Use this AI prompt instead of manual analysis:**

```
Conduct a comprehensive analysis of my Kotlin Android application:

1. Inventory all UI components:
   - Count Activities and Fragments
   - Map screen flows and navigation
   - Identify UI patterns (lists, forms, dialogs, etc.)
   - Document user interactions

2. Analyze data architecture:
   - Identify data sources (local DB, APIs, SharedPreferences)
   - Map repository patterns
   - Document data models and relationships
   - Find background services and workers

3. Document hardware/platform integrations:
   - Android-specific features being used
   - Third-party SDKs and libraries
   - Hardware access (camera, sensors, etc.)
   - Network requirements

4. Assess complexity:
   - Rate business logic complexity (LOW/MEDIUM/HIGH)
   - Identify migration challenges
   - Estimate effort for each component

5. Generate migration roadmap:
   - Prioritized feature list
   - Component-by-component plan
   - Risk assessment
   - Timeline estimate

Provide detailed analysis with file paths, line numbers, and migration recommendations.
```

**AI will create a comprehensive inventory:**
- List all screens (Activities/Fragments)
- Identify data sources (Repositories, APIs)
- Note background services
- Document hardware integrations

### Step 2: AI Sets Up BrightSign Development Environment

**Use this AI prompt:**

```
Set up a complete BrightSign development environment with best practices:

1. Verify Node.js installation (v14+) and show version

2. Create optimized project structure:
    brightsign-app/
    ├── src/
    │   ├── ui/           # HTML/CSS/JS files
    │   ├── backend/      # Node.js server (if needed)
    │   ├── utils/        # Helper functions
    │   └── mocks/        # BrightSign API mocks for local dev
    ├── assets/           # Images, videos, fonts
    ├── dist/             # Build output
    ├── autorun.brs       # BrightSign launcher
    ├── webpack.config.js # Webpack configuration
    └── package.json

3. Generate package.json with:
   - Project metadata
   - All required dependencies (express, webpack, loaders)
   - Development dependencies
   - npm scripts for dev and build

4. Install all dependencies automatically

5. Create .gitignore for Node.js projects

Provide all generated files and explain the structure.
```

**Example package.json AI will generate:**
```json
{
  "name": "brightsign-app",
  "version": "1.0.0",
  "description": "BrightSign application migrated from Kotlin Android",
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^4.15.1",
    "html-webpack-plugin": "^5.5.3",
    "css-loader": "^6.8.1",
    "style-loader": "^3.3.3"
  }
}
```

### Step 3: AI Configures Webpack for BrightSign

**Use this AI prompt:**

```
Generate a production-ready webpack configuration for BrightSign:

1. Create webpack.config.js with:
   - Node.js v18.18.2 target (BrightSign OS version)
   - UMD library output for compatibility
   - Development and production modes
   - CSS and asset handling

2. Configure BrightSign API externals:
   - Mark @brightsign/* modules as external in production
   - Use webpack aliases for mocks in development
   - List all common BrightSign APIs (deviceinfo, videooutput, etc.)

3. Generate mock modules for local development:
   - src/mocks/deviceinfo.js
   - src/mocks/networkconfiguration.js
   - src/mocks/videooutput.js
   - Any others needed based on my app requirements

4. Set up HtmlWebpackPlugin for index.html generation

5. Configure webpack-dev-server with hot reload

6. Add proper source maps for debugging

Provide complete webpack.config.js and all mock files.
```

**AI will generate webpack.config.js:**
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';
    
    return {
        mode: argv.mode || 'development',
        target: 'node18.18', // BrightSign OS runs Node v18.18.2
        entry: './src/ui/index.js',
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'dist'),
            clean: true,
            libraryTarget: 'umd'
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                }
            ]
        },
        
        // Mark BrightSign APIs as external - they're provided by the player runtime
        externals: isDevelopment ? {} : {
            '@brightsign/deviceinfo': 'commonjs @brightsign/deviceinfo',
            '@brightsign/videooutput': 'commonjs @brightsign/videooutput',
            '@brightsign/networkconfiguration': 'commonjs @brightsign/networkconfiguration',
            '@brightsign/screenshot': 'commonjs @brightsign/screenshot',
            '@brightsign/registry': 'commonjs @brightsign/registry',
            '@brightsign/serialport': 'commonjs @brightsign/serialport'
        },
        
        resolve: {
            alias: isDevelopment ? {
                // In development, use mocks for BrightSign APIs
                '@brightsign/deviceinfo': path.resolve(__dirname, 'src/mocks/deviceinfo.js'),
                '@brightsign/videooutput': path.resolve(__dirname, 'src/mocks/videooutput.js'),
                '@brightsign/networkconfiguration': path.resolve(__dirname, 'src/mocks/networkconfiguration.js'),
            } : {}
        },
        
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html'
            })
        ],
        
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
            },
            compress: true,
            port: 8080,
            hot: true
        }
    };
};
```

**Create mock modules for local development:**

```javascript
// src/mocks/deviceinfo.js
class DeviceInfo {
    constructor() {
        this.model = 'XT1144';
        this.osVersion = '9.0.189';
        this.bootVersion = '1.2.34';
        this.serialNumber = 'MOCK-000000';
        this.family = 'xt';
    }
    
    osVersionCompare(version) {
        // Version comparison logic
        return 0;
    }
    
    bootVersionCompare(bootVersion) {
        return 0;
    }
    
    osVersionIsAtLeast(version) {
        return this.osVersionCompare(version) >= 0;
    }
    
    bootVersionIsAtLeast(bootVersion) {
        return this.bootVersionCompare(bootVersion) >= 0;
    }
    
    hasFeature(feature) {
        const mockFeatures = ['ethernet', 'wifi', 'hdmi', 'usb'];
        return mockFeatures.includes(feature.toLowerCase());
    }
    
    async getTemperature() {
        return { celsius: 45.0, fahrenheit: 113.0 };
    }
}

module.exports = DeviceInfo; // CommonJS export for Node v18.18.2
```

```javascript
// src/mocks/networkconfiguration.js
class NetworkConfiguration {
    constructor(ifName = 'eth0') {
        this.interfaceName = ifName;
    }
    
    getCurrentConfig() {
        console.log('[MOCK] Getting network configuration');
        return {
            interface: this.interfaceName,
            ip: '192.168.1.100',
            subnet: '255.255.255.0',
            gateway: '192.168.1.1',
            dns: ['8.8.8.8', '8.8.4.4']
        };
    }
    
    applyConfig(config) {
        console.log('[MOCK] Applying network config:', config);
        return true;
    }
}

module.exports = NetworkConfiguration; // CommonJS export for Node v18.18.2
```

**Update package.json scripts:**
```json
{
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production"
  }
}
```

**Usage in your application:**

```javascript
// src/ui/platform.js - Platform abstraction layer
class BrightSignPlatform {
    constructor() {
        this.deviceInfo = null;
        this.initialized = false;
        this.initialize(); // Synchronous initialization for Node v18.18.2
    }
    
    initialize() {
        try {
            // Use require() for CommonJS compatibility (Node v18.18.2)
            const DeviceInfo = require('@brightsign/deviceinfo');
            this.deviceInfo = new DeviceInfo();
            this.initialized = true;
        } catch (error) {
            console.warn('BrightSign deviceinfo not available, using fallback');
            this.deviceInfo = {
                model: 'UNKNOWN',
                osVersion: 'UNKNOWN',
                serialNumber: 'UNKNOWN'
            };
            this.initialized = true;
        }
    }
    
    getDeviceInfo() {
        return {
            model: this.deviceInfo.model,
            osVersion: this.deviceInfo.osVersion,
            serial: this.deviceInfo.serialNumber
        };
    }
}
```

**Development workflow:**

**AI will set up these npm scripts for you:**

```bash
# Run locally with mocks (webpack resolves @brightsign/* to mocks)
npm run dev

# Build for BrightSign player (webpack externalizes @brightsign/* as CommonJS externals)
npm run build
```

**Key Configuration Details (AI handles all of this):**

- **Node v18.18.2 Target**: BrightSign players run Node.js v18.18.2 - webpack configured with `target: 'node18.18'`
- **CommonJS Modules**: Uses `require()` for BrightSign APIs (not ES modules `import`)
- **Synchronous Initialization**: BrightSign APIs initialized synchronously in constructor using try/catch
- **UMD Output**: Webpack builds use UMD library target for universal compatibility
- **CommonJS Externals**: Uses `'commonjs @brightsign/*'` format in webpack externals
- **Mock Modules**: Development mocks use `module.exports` to match CommonJS pattern

### Step 4: AI Rebuilds UI Components

**Use this AI prompt for each screen:**

```
Migrate my Android [Activity/Fragment name] to HTML/CSS/JavaScript:

1. Analyze the original Kotlin code:
   - UI components (TextViews, Buttons, RecyclerViews, etc.)
   - User interactions (click handlers, form inputs)
   - Data bindings and observables
   - Navigation flows

2. Generate equivalent web implementation:
   - Semantic HTML5 structure
   - CSS with responsive design
   - Modern JavaScript (ES6+)
   - Event handlers and data binding

3. Implement ViewModel pattern:
   - Separate business logic from UI
   - Observable state management
   - Async data fetching

4. Create modular, reusable components

5. Add error handling and loading states

6. Show me the implementation for review

Provide complete HTML, CSS, and JavaScript files for this screen.
```

**Example AI-generated transformation:**

**Before (Kotlin):**
```kotlin
class DashboardActivity : AppCompatActivity() {
    private val viewModel: DashboardViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)
        
        viewModel.stats.observe(this) { stats ->
            userCountText.text = "Users: ${stats.userCount}"
        }
        
        refreshButton.setOnClickListener {
            viewModel.refreshStats()
        }
    }
}
```

**After (HTML + JavaScript):**

```html
<!-- dashboard.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard</title>
    <link rel="stylesheet" href="dashboard.css">
</head>
<body>
    <div id="dashboard">
        <h1>Dashboard</h1>
        <p id="userCount">Users: <span>0</span></p>
        <button id="refreshButton">Refresh Stats</button>
    </div>
    
    <script type="module" src="dashboard.js"></script>
</body>
</html>
```

```javascript
// dashboard.js
class DashboardViewModel {
    constructor() {
        this.stats = { userCount: 0 };
        this.observers = [];
    }
    
    async refreshStats() {
        try {
            const response = await fetch('http://localhost:3000/api/stats');
            this.stats = await response.json();
            this.notifyObservers();
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }
    
    observe(callback) {
        this.observers.push(callback);
    }
    
    notifyObservers() {
        this.observers.forEach(cb => cb(this.stats));
    }
}

const viewModel = new DashboardViewModel();

document.addEventListener('DOMContentLoaded', () => {
    viewModel.observe((stats) => {
        document.querySelector('#userCount span').textContent = stats.userCount;
    });
    
    document.getElementById('refreshButton').addEventListener('click', () => {
        viewModel.refreshStats();
    });
    
    viewModel.refreshStats();
});
```

### Step 5: AI Implements Node.js Backend (If Needed)

**Use this AI prompt:**

```
Generate a Node.js backend for my BrightSign application:

1. Analyze backend requirements from my Android app:
   - API endpoints needed
   - Data processing logic
   - External service integrations
   - WebSocket requirements (if any)

2. Create Express.js server with:
   - RESTful API routes
   - Middleware for JSON, CORS, error handling
   - Request validation
   - Response formatting

3. Implement data layer:
   - IndexedDB for local storage
   - External API integration
   - Caching strategies

4. Add logging and monitoring:
   - Console logging for debugging
   - Error tracking
   - Performance monitoring

5. Generate server startup code

Provide complete backend/server.js with all routes and middleware.
```

**Example server AI will generate:**

```javascript
// backend/server.js
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// API routes
app.get('/api/stats', async (req, res) => {
    res.json({
        userCount: 150,
        activeSessions: 42
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

### Step 6: AI Creates BrightSign Launcher

**Use this AI prompt:**

```
Generate a production-ready autorun.brs file for BrightSign:

1. Create BrightScript launcher with:
   - Message port for event handling
   - Dynamic screen resolution detection
   - Full-screen HTML widget configuration
   - Node.js enabled for backend support
   - Remote debugging on port 2999

2. Configure proper file paths:
   - Point to dist/index.html (webpack output)
   - Use file:/// protocol for local files

3. Add event handling:
   - HTML widget events
   - Error handling
   - Lifecycle management

4. Include comments explaining each section

5. Add any custom configuration based on my app requirements

Provide complete autorun.brs file.
```

**AI will generate:**

```brightscript
' BrightSign launcher
Sub Main()
    msgPort = CreateObject("roMessagePort")

    ' Get Screen Resolution
	vidmode = CreateObject("roVideoMode")
	width = vidmode.GetResX()
	height = vidmode.GetResY()
	r = CreateObject("roRectangle", 0, 0, width, height)

	config = {
		nodejs_enabled: true
		url: "file:///sd:/dist/index.html"
		port: msgPort,
        inspector_server: {port: 2999}  ' Enable remote debugging
	}

	h = CreateObject("roHtmlWidget", r, config)
    
    while true
        msg = wait(0, msgPort)
        if type(msg) = "roHtmlWidgetEvent" then
            print "HTML Event: "; msg.GetData()
        end if
    end while
End Sub
```

### Step 7: AI Creates Platform Abstraction Layer

**Use this AI prompt:**

```
Create a comprehensive BrightSign platform abstraction layer:

1. Analyze all Android APIs I'm using and create JavaScript equivalents:
   - SharedPreferences → localStorage wrapper
   - Toast notifications → custom UI notifications
   - System services → BrightSign device APIs
   - File I/O → appropriate web/Node.js APIs

2. Generate utils/platform.js with:
   - BrightSignPlatform class
   - Synchronous initialization (Node v18.18.2 compatible)
   - CommonJS exports (require/module.exports)
   - Graceful fallbacks for development
   - Error handling

3. Implement methods for:
   - Device information (getDeviceInfo)
   - Data persistence (savePreference, getPreference)
   - UI notifications (showNotification)
   - Network configuration (if needed)
   - Any custom platform features

4. Add JSDoc comments for all methods

5. Create mock implementations for local development

Provide complete utils/platform.js file.
```

**AI-generated platform abstraction:**

```javascript
// utils/platform.js
class BrightSignPlatform {
    constructor() {
        this.deviceInfo = null;
        this.networkConfig = null;
        this.initialized = false;
        this.initialize(); // Synchronous initialization
    }
    
    initialize() {
        try {
            // Use require() for CommonJS compatibility (Node v18.18.2)
            const DeviceInfo = require('@brightsign/deviceinfo');
            const NetworkConfiguration = require('@brightsign/networkconfiguration');
            
            this.deviceInfo = new DeviceInfo();
            this.networkConfig = new NetworkConfiguration('eth0');
            this.initialized = true;
        } catch (error) {
            console.warn('BrightSign APIs not available, using fallbacks');
            this.initialized = true;
        }
    }
    
    getDeviceInfo() {
        if (this.deviceInfo) {
            return {
                model: this.deviceInfo.model,
                osVersion: this.deviceInfo.osVersion,
                serial: this.deviceInfo.serialNumber
            };
        }
        return { model: 'MOCK', osVersion: 'MOCK', serial: 'MOCK' };
    }
    
    savePreference(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    
    getPreference(key, defaultValue = null) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    }
    
    showNotification(message) {
        console.log(`[Notification] ${message}`);
        // Create toast-like UI notification
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

module.exports = new BrightSignPlatform(); // Export singleton for CommonJS
```

For comprehensive API replacements, see the [main guide](README.md#common-api-replacements).

---

# AI-Assisted Migration with BrightDeveloper MCP

The BrightDeveloper MCP server automates your complete application rebuild. The prompt below orchestrates AI to analyze your Kotlin app, design the web architecture, generate all code, and create deployment artifacts.

> **💡 AI Does the Work**: You provide requirements, AI builds the entire application. Code generation, configuration, and setup are fully automated.

## Prerequisites

Before using this prompt:
- ✅ Ensure the [BrightDeveloper MCP server](https://github.com/BrightDevelopers/technical-documentation/blob/main/MCP-SERVER-HOWTO.md) is connected
- ✅ Have your Kotlin project accessible in the workspace
- ✅ Optionally review this guide to understand what AI will build

---

## Complete AI Migration Prompt for Method 2 ⭐

**This single prompt automates the entire rebuild process:**

```
First, read and analyze the migration guide at migration-guides/kotlin/method2-fresh-rebuild.md and the automation patterns at migration-guides/kotlin/CLAUDE.md.

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
12. Provide testing checklist and debugging instructions

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

---

## Tips for Best Results

1. **Be Specific**: Provide accurate counts and detailed feature lists - AI uses this to estimate scope
2. **Include Dependencies**: Mention all third-party libraries - AI will find modern web equivalents
3. **Describe Custom Features**: Unique functionality needs clear description - AI can recreate if well-explained
4. **State Constraints**: Network, hardware, performance requirements - AI designs accordingly
5. **Review Architecture**: Let AI propose the architecture before coding - validate the approach
6. **Iterative Development**: Have AI build and test each feature incrementally
7. **Ask for Explanations**: If generated code seems complex, ask AI to explain its decisions
8. **Test Locally First**: Use webpack dev mode with mocks before deploying to BrightSign
9. **Use Chrome DevTools**: Take advantage of remote debugging (port 2999) - AI can help set this up

---

## Next Steps

- [← Return to Main Guide](README.md)
- [View Method 1: Transpilation](method1-transpilation.md) (For rapid prototyping)
- [View Advanced Migration Approaches](README.md#advanced-migration-approaches)
