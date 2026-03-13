# Troubleshooting Guide: Kotlin to BrightSign Migration

This guide provides manual code references, error handling, and fallback instructions for Method 1 (Transpilation) and Method 2 (Fresh Rebuild).

## General Troubleshooting using AI

You could make use of the brightdeveloper MCP server and AI agent of your choice to assist with diagnosing specific issues by providing detailed error messages and project context. An example AI prompt for troubleshooting may look like this:

```
I'm encountering an error in my Kotlin to BrightSign migration project.

Migration Method: [Method 1: Transpilation OR Method 2: Fresh Rebuild]

Error Message:
[paste the specific error message or describe the issue]

Project Path: [your-kotlin-project-path]
Target BrightSign Model: [XT1144, XD1034, etc.]

Project Context:
[briefly describe your Android app and what you were attempting]

Please help me:
1. Diagnose the root cause of this error
2. Suggest specific fixes for my project
3. Provide code examples or configuration changes if applicable
```

However, if the AI approach is not yielding results, follow the manual troubleshooting steps outlined below for each migration method.

---

## Method 1: Transpilation Troubleshooting

### Step 1: Business Logic Extraction

**Manual Extraction:**
- Review Kotlin project structure for business logic separation
- Identify data classes, repositories, use cases, view models
- Separate Android-specific UI code (Activities, Fragments, Views)
- Create shared module for business logic

**Common Issues:**
- Mixed business logic and UI: Refactor to separate concerns
- Context dependencies: Replace with platform abstractions
- Android-specific types: Remove Parcelable, Bundle, Intent

### Step 2: Kotlin/JS Build Configuration

**Manual Configuration:**
- Create `build.gradle.kts` with Kotlin Multiplatform plugin
- Configure JS target: `js(IR) { nodejs() }`
- Add kotlinx-serialization plugin
- Configure source sets (commonMain, jsMain)

**build.gradle.kts Pattern:**

<details>
<summary>Click to expand</summary>

```kotlin
plugins {
    kotlin("multiplatform") version "1.9.20"
    kotlin("plugin.serialization") version "1.9.20"
}

kotlin {
    js(IR) {
        nodejs()
        binaries.executable()
        
        compilations["main"].packageJson {
            customField("type", "module")
        }
    }
    
    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
            }
        }
        
        val jsMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-html-js:0.9.1")
            }
        }
    }
}
```

</details>

**Common Issues:**
- Plugin version conflicts: Use compatible Kotlin and plugin versions
- Source set not found: Ensure correct naming (commonMain, jsMain)
- JS IR backend errors: Use `js(IR)` instead of legacy `js(LEGACY)`
- Serialization errors: Add @Serializable annotation and plugin

### Step 3: Platform Abstraction Layer

**Manual Platform Abstractions:**
- Create expect/actual classes for Android APIs
- Replace SharedPreferences with localStorage abstraction
- Replace Context with platform-agnostic interfaces
- Convert Android notifications to browser notifications

**expect/actual Pattern:**

```kotlin
// In commonMain/PlatformStorage.kt
expect class PlatformStorage {
    fun saveString(key: String, value: String)
    fun getString(key: String): String?
}

// In jsMain/PlatformStorage.kt
actual class PlatformStorage {
    actual fun saveString(key: String, value: String) {
        js("localStorage.setItem(key, value)")
    }
    
    actual fun getString(key: String): String? {
        return js("localStorage.getItem(key)") as? String
    }
}
```

**Common Android → JavaScript Replacements:**

| Android API | JavaScript Replacement | Code Reference |
|------------|----------------------|----------------|
| `SharedPreferences` | `localStorage` | `localStorage.setItem(key, JSON.stringify(value))` |
| `Toast.makeText()` | `console.log()` or DOM notification | `console.log('[Toast]', message)` |
| `File I/O` | Node.js `fs` module | `const fs = require('fs'); fs.readFileSync(path)` |
| `Context.getSystemService()` | BrightSign APIs | `const DeviceInfo = require('@brightsign/deviceinfo')` |
| Coroutines | `async/await` | `async function name() { await ... }` |

**Common Issues:**
- Missing expect declarations: Ensure all Android APIs have expect/actual pairs
- JS interop errors: Use `js()` function for direct JavaScript calls
- Type conversion errors: Cast results explicitly `as? Type`

### Step 4: Transpilation Build

**Manual Build:**
- Run `./gradlew build` or `./gradlew jsBrowserProductionWebpack`
- Check build output in `build/distributions/`
- Verify generated JavaScript files
- Review for compilation errors

**Common Issues:**
- Compilation failures: Check Kotlin syntax and type compatibility
- Missing dependencies: Add to build.gradle.kts dependencies
- Output directory not created: Verify webpack configuration
- Runtime errors: Test transpiled code in Node.js environment

### Step 5: HTML/CSS/JavaScript UI

**Manual UI Creation:**
- Replace each Android Activity with HTML page
- Convert XML layouts to HTML structure
- Migrate view models to JavaScript classes
- Integrate transpiled business logic

**Android Activity → HTML Pattern:**

```html
<!-- dashboard.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="app">
        <h1>Dashboard</h1>
        <div id="content"></div>
        <button id="fetchBtn">Fetch Data</button>
    </div>
    
    <script type="module">
        import { BusinessLogic } from './transpiled/business-logic.js';
        const logic = new BusinessLogic();
        
        document.getElementById('fetchBtn').addEventListener('click', async () => {
            const data = await logic.fetchData();
            document.getElementById('content').textContent = JSON.stringify(data);
        });
    </script>
</body>
</html>
```

**Common Issues:**
- Import errors: Use correct path to transpiled JavaScript modules
- Module format mismatch: Ensure transpiled code exports correctly
- Event binding failures: Verify DOM elements exist before adding listeners
- Style not applied: Check CSS file path and selector specificity

---

## Method 2: Fresh Rebuild Troubleshooting ⭐

### Step 1: Android App Analysis

**Manual Analysis:**
- Count Activities and Fragments in project
- List all screens and user flows
- Identify data sources (SharedPreferences, Room, APIs)
- Document Android API usage patterns
- Map hardware integrations

**Analysis Commands:**
```bash
# Count UI components
find . -name "*.kt" | xargs grep -l "Activity" | wc -l
find . -name "*.kt" | xargs grep -l "Fragment" | wc -l

# List dependencies
grep "implementation" build.gradle > dependencies.txt

# Find Android API usage
grep -r "import android\." . --include="*.kt"
grep -r "@brightsign" . --include="*.kt"
```

**Common Issues:**
- Complex navigation flows: Document with flowcharts
- Many third-party libraries: Research JavaScript equivalents
- Custom Android components: Plan JavaScript implementations

### Step 2: BrightSign Environment Setup

**Manual Setup:**
- Install Node.js v18.18.2 (to match BrightSign OS)
- Create project structure (src/ui, src/utils, src/mocks, assets)
- Initialize npm project - `npm init`
- Install webpack and required loaders

**Project Structure:**

```
brightsign-app/
├── src/
│   ├── ui/
│   │   ├── index.html
│   │   ├── app.js
│   │   └── styles.css
│   ├── utils/
│   │   ├── platform.js      # BrightSign platform abstraction
│   │   ├── dataService.js
│   │   └── formatters.js
│   └── mocks/
│       ├── deviceinfo.js    # Mock for local development
│       └── networkconfiguration.js
├── assets/
│   ├── images/
│   └── fonts/
├── dist/                    # Webpack output
├── autorun.brs
├── webpack.config.js
└── package.json
```

**package.json Setup:**

```json
{
  "name": "brightsign-kotlin-migration",
  "version": "1.0.0",
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production"
  },
  "devDependencies": {
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^4.15.1",
    "html-webpack-plugin": "^5.5.4",
    "css-loader": "^6.8.1",
    "style-loader": "^3.3.3"
  }
}
```

**Common Issues:**
- Node.js version mismatch: Use nvm to install v18.18.2
- npm install failures: Clear npm cache - `npm cache clean --force` - and try again
- Webpack version conflicts: Use compatible webpack plugins

### Step 3: Webpack Configuration

**Manual Webpack Setup:**
- Configure entry and output
- Set target to `node18.18`
- Add externals for BrightSign APIs (CommonJS format)
- Configure loaders (CSS, HTML)
- Set up development server with mocks

**webpack.config.js Pattern (Node v18.18.2 CommonJS):**

<details>
<summary>Click to expand</summary>

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';
    
    return {
        mode: argv.mode || 'development',
        target: 'node18.18', // BrightSign OS runs Node v18.18.2
        entry: './src/ui/app.js',
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'dist'),
            clean: true,
            libraryTarget: 'umd' // Universal module definition
        },
        
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                }
            ]
        },
        
        // CRITICAL: Mark BrightSign APIs as external with CommonJS prefix
        externals: isDevelopment ? {} : {
            '@brightsign/deviceinfo': 'commonjs @brightsign/deviceinfo',
            '@brightsign/networkconfiguration': 'commonjs @brightsign/networkconfiguration',
            '@brightsign/videooutput': 'commonjs @brightsign/videooutput',
            '@brightsign/registry': 'commonjs @brightsign/registry'
        },
        
        resolve: {
            alias: isDevelopment ? {
                // In development, use mocks
                '@brightsign/deviceinfo': path.resolve(__dirname, 'src/mocks/deviceinfo.js'),
                '@brightsign/networkconfiguration': path.resolve(__dirname, 'src/mocks/networkconfiguration.js')
            } : {}
        },
        
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/ui/index.html'
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

</details>

**Common Issues:**
- "Cannot find module @brightsign/*": Add to externals with 'commonjs' prefix
- Mocks not resolving in dev mode: Check resolve.alias paths
- Bundle too large: BrightSign APIs must be external, not bundled, and check duplicate dependencies
- UMD target errors: Ensure libraryTarget is 'umd' for Node compatibility

### Step 4: Platform Abstraction Layer

**Manual Platform Abstraction:**
- Create BrightSignPlatform class
- Initialize synchronously using require() (Node v18.18.2)
- Wrap all BrightSign APIs with try/catch
- Provide fallback implementations

**Platform Abstraction Pattern (Synchronous for Node v18.18.2):**

<details>
<summary>Click to expand</summary>

```javascript
// src/utils/platform.js
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
            console.log('[Platform] BrightSign APIs initialized');
        } catch (error) {
            console.warn('[Platform] BrightSign APIs not available, using fallbacks:', error);
            this.deviceInfo = {
                model: 'MOCK',
                osVersion: 'MOCK',
                serialNumber: 'MOCK-000000'
            };
            this.initialized = true;
        }
    }
    
    getDeviceInfo() {
        if (this.deviceInfo && this.deviceInfo.model) {
            return {
                model: this.deviceInfo.model,
                osVersion: this.deviceInfo.osVersion,
                serial: this.deviceInfo.serialNumber
            };
        }
        return { model: 'MOCK', osVersion: 'MOCK', serial: 'MOCK' };
    }
    
    savePreference(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('[Platform] Failed to save preference:', error);
        }
    }
    
    getPreference(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('[Platform] Failed to get preference:', error);
            return defaultValue;
        }
    }
    
    showNotification(message) {
        console.log(`[Notification] ${message}`);
        // Optional: Create DOM notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    isNetworkAvailable() {
        return navigator.onLine;
    }
}

// Export singleton for CommonJS
module.exports = new BrightSignPlatform();
```

</details>

**Mock Pattern (for Local Development):**

```javascript
// src/mocks/deviceinfo.js
class DeviceInfo {
    constructor() {
        this.model = 'XT1144';
        this.osVersion = '9.0.189';
        this.bootVersion = '1.2.34';
        this.serialNumber = 'MOCK-123456';
        this.family = 'xt';
    }
    
    osVersionCompare(version) {
        return 0;
    }
    
    hasFeature(feature) {
        const mockFeatures = ['ethernet', 'wifi', 'hdmi', 'usb'];
        return mockFeatures.includes(feature.toLowerCase());
    }
}

module.exports = DeviceInfo; // CommonJS export for Node v18.18.2
```

**Common Issues:**
- BrightSign APIs not found: Ensure webpack externals are configured correctly
- Mock modules not loading: Check webpack resolve.alias in development mode
- require() errors: Verify using CommonJS exports (module.exports)

### Step 5: UI Rebuild

**Manual UI Migration:**
- Convert each Android Activity to HTML page
- Replace RecyclerView with HTML/CSS grid or list
- Replace Android buttons with HTML buttons
- Implement event handlers in JavaScript

**Android Activity → HTML/JS Pattern:**

<details>
<summary>Click to expand</summary>

```javascript
// src/ui/app.js
import './styles.css';
import platform from '../utils/platform.js';
import dataService from '../utils/dataService.js';

class BrightSignApp {
    constructor() {
        this.weatherData = null;
        this.deviceData = null;
    }
    
    init() {
        console.log('BrightSign Application Initialized');
        
        // Platform is initialized synchronously in constructor
        this.setupEventListeners();
        this.loadDeviceModel();
        
        platform.showNotification('Application ready!');
    }
    
    setupEventListeners() {
        document.getElementById('fetchWeatherBtn')
            .addEventListener('click', () => this.fetchWeather());
        document.getElementById('fetchDeviceBtn')
            .addEventListener('click', () => this.fetchDevice());
    }
    
    async fetchWeather() {
        try {
            platform.showNotification('Fetching weather...');
            const city = platform.getPreference('defaultCity', 'London');
            this.weatherData = await dataService.fetchWeather(city);
            this.updateWeatherDisplay();
            platform.showNotification('Weather loaded!');
        } catch (error) {
            console.error('Error fetching weather:', error);
            platform.showNotification(`Error: ${error.message}`);
        }
    }
    
    loadDeviceModel() {
        const deviceInfo = platform.getDeviceInfo();
        document.getElementById('deviceModel').textContent = 
            `${deviceInfo.model} | ${deviceInfo.osVersion}`;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new BrightSignApp();
    app.init();
    window.brightSignApp = app; // For debugging
});
```

</details>

**Common Issues:**
- Event handlers not firing: Ensure DOM elements exist before adding listeners
- Platform methods returning undefined: Check synchronous initialization completed
- Data not displaying: Verify DOM manipulation and element selectors
- Async errors: Don't use await with synchronous platform methods

### Step 6: Data Layer Migration

**Manual Data Layer:**
- Replace SharedPreferences with localStorage
- Replace Room Database with IndexedDB
- Convert Retrofit to fetch() API
- Implement data caching strategies

**Data Service Pattern:**

<details>
<summary>Click to expand</summary>

```javascript
// src/utils/dataService.js
class DataService {
    constructor() {
        this.cache = new Map();
    }
    
    async fetchWeather(city) {
        const cacheKey = `weather_${city}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 min
                return cached.data;
            }
        }
        
        // Fetch from API
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=YOUR_KEY`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update cache
        this.cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        
        return data;
    }
    
    clearCache() {
        this.cache.clear();
    }
}

module.exports = new DataService();
```

</details>

**Common Issues:**
- CORS errors: Configure API servers or use proxy
- Cache not working: Check Map usage and timestamp logic
- Parse errors: Verify API response format
- Network timeouts: Add timeout handling to fetch calls

### Step 7: BrightSign Deployment

**Manual Deployment:**
- Create autorun.brs launcher
- Set display resolution
- Enable remote debugging (port 2999)
- Configure `nodejs_enabled` if using Node.js features
- Test on BrightSign device

**autorun.brs Template:**

<details>
<summary>Click to expand</summary>

```brightscript
Sub Main()
    msgPort = CreateObject("roMessagePort")
    
    ' Get Screen Resolution
    vidmode = CreateObject("roVideoMode")
    width = vidmode.GetResX()
    height = vidmode.GetResY()
    r = CreateObject("roRectangle", 0, 0, width, height)
    
    config = {
        nodejs_enabled: true,
        url: "file:///sd:/index.html",
        port: msgPort,
        inspector_server: {port: 2999}
    }
    
    h = CreateObject("roHtmlWidget", r, config)
    h.Show()
    
    while true
        msg = wait(0, msgPort)
        if type(msg) = "roHtmlWidgetEvent" then
            print "HTML Event: "; msg.GetUserData()
        end if
    end while
End Sub
```

</details>

SD Card Structure (Method 2 - Fresh Rebuild):

```
SD_CARD/
├── autorun.brs           # BrightSign launcher
├── index.html            # Entry point (from dist/)
├── bundle.js             # Webpack output (from dist/)
├── styles.css            # (if not bundled in bundle.js)
└── assets/               # Images, fonts, etc.
    ├── logo.png
    └── fonts/
```

**Common Issues:**
- Black screen: Check `autorun.brs` syntax and file paths
- Resolution incorrect: Update CreateObject("roRectangle") dimensions
- Debugging not available: Check `inspector_server` port configuration
- Files not found: Verify `file:///sd:/` paths match SD card structure

---

## Common Issues Across Both Methods

### Node.js Version Compatibility

**Problem**: ES module errors, import/export not working

**Solution**: BrightSign runs Node v18.18.2, use CommonJS:
```javascript
// Wrong (ES modules)
import DeviceInfo from '@brightsign/deviceinfo';
export default class MyClass {}

// Correct (CommonJS for Node v18.18.2)
const DeviceInfo = require('@brightsign/deviceinfo');
module.exports = class MyClass {}
```

### Async/Await Pattern Errors

**Problem**: "ensureInitialized is not a function"

**Solution**: Platform methods are synchronous in Node v18.18.2:
```javascript
// Wrong (async pattern)
await platform.ensureInitialized();
const pref = await platform.getPreference('key');

// Correct (synchronous pattern)
const pref = platform.getPreference('key');
```

### Remote Debugging

**Problem**: Cannot connect to Chrome DevTools

**Solution**:
1. Verify `inspector_server` port in autorun.brs
2. Connect to `chrome://inspect` or `localhost:2999`
3. Check firewall allows port 2999
4. Ensure BrightSign and computer are on same network

### localStorage Not Available

**Problem**: Platform abstraction fails with localStorage errors

**Solution**: Wrap in try/catch and provide fallbacks:
```javascript
savePreference(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('localStorage not available:', error);
        // Use in-memory fallback
        this.memoryStorage = this.memoryStorage || {};
        this.memoryStorage[key] = value;
    }
}
```

---

## Additional Resources

- [README.md](./README.md): Complete migration guide with two primary methods
- [CLAUDE.md](./CLAUDE.md): Machine-readable automation patterns and code transformations
- [BrightSign Developer Portal](https://docs.brightsign.biz/developers)
- [JavaScript API Reference](https://docs.brightsign.biz/developers/javascript-apis)
- [Debugging HTML/Nodejs apps](https://docs.brightsign.biz/developers/debugging-htmlnode-apps)
