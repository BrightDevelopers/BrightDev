# Kotlin Migration Guide

> **AI Automation Instructions**: For machine-readable migration patterns, validation rules, and automation schemas, see [CLAUDE.md](CLAUDE.md)

## Overview

When migrating your Kotlin-based Android application to the BrightSign platform, you have **2 primary approaches**:

1. **Kotlin to JavaScript Transpilation** - Quick prototyping (1-2 weeks)
2. **Fresh HTML/JS/Node.js Rebuild** - Production quality (4-6 weeks) ⭐ **Recommended**

**BrightSign recommends Method 2 (Fresh Rebuild)** for production deployments due to superior debugging, easier maintenance, and better platform integration.

> **Note**: Advanced approaches (Kotlin Multiplatform, WebAssembly, PWA) are available for specialized use cases - see the [Advanced Migration Approaches](#advanced-migration-approaches) section at the end of this guide.

---

## Quick Decision Guide

**Choose your migration approach:**

| Your Goal | Recommended Method | Timeline | Use When |
|-----------|-------------------|----------|----------|
| **Rapid prototype** - Get something running quickly to demo | Method 1: Transpilation | 1-2 weeks | You need a proof-of-concept fast, plan to rebuild later |
| **Production app** - Long-term maintainability ⭐ | Method 2: Fresh Rebuild | 4-6 weeks | You want a production-ready application |

> **For specialized scenarios** (multi-platform code sharing, CPU-intensive operations, offline-first apps), see [Advanced Migration Approaches](#advanced-migration-approaches).

---

# Method 1: Kotlin to JavaScript Transpilation

## Overview

Transpile your existing Kotlin code to JavaScript, allowing you to reuse business logic while rebuilding the UI layer. This is the fastest path to a working prototype.

**⏱️ Timeline**: 1-2 weeks  
**🎯 Best for**: Rapid prototyping, simple applications  
**⚠️ Note**: Plan to refactor to Method 2 for production

## When to Use

- ✅ Need a working prototype quickly
- ✅ Well-separated business logic and UI code
- ✅ Comfortable with mocked/placeholder implementations
- ⚠️ Understand this is a temporary solution

## Migration Steps

### 1. Consolidate Business Logic

Extract all core business logic into a shared module, separating it from Android-specific UI code:

**What to extract:**
- Data classes and models
- Repository patterns
- Use cases / business rules
- Network logic (using Ktor or similar)
- Utility functions

**What to exclude:**
- Activities and Fragments
- Android Views
- Context-dependent code

### 2. Configure Kotlin/JS Compilation

**build.gradle.kts:**
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
            customField("name", "brightsign-app-logic")
            customField("version", "1.0.0")
        }
    }
    
    sourceSets {
        val jsMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
                implementation("io.ktor:ktor-client-core:2.3.5")
                implementation("io.ktor:ktor-client-js:2.3.5")
            }
        }
    }
}
```

### 3. Handle Android-Specific APIs

Android APIs cannot be directly transpiled. Use the **expect/actual** pattern to create platform-specific implementations:

**Before (Android):**
```kotlin
class UserRepository(private val context: Context) {
    private val prefs = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
    
    fun saveUserId(userId: String) {
        prefs.edit().putString("user_id", userId).apply()
    }
}
```

**After (Platform-agnostic):**
```kotlin
// In commonMain
expect class PlatformStorage {
    fun saveString(key: String, value: String)
    fun getString(key: String): String?
}

class UserRepository(private val storage: PlatformStorage) {
    fun saveUserId(userId: String) {
        storage.saveString("user_id", userId)
    }
}

// In jsMain
actual class PlatformStorage {
    actual fun saveString(key: String, value: String) {
        js("localStorage.setItem(key, value)")
    }
    
    actual fun getString(key: String): String? {
        return js("localStorage.getItem(key)") as? String
    }
}
```

### 4. Build HTML/JavaScript UI

Create a new web-based UI that consumes your transpiled Kotlin logic:

```html
<!DOCTYPE html>
<html>
<head>
    <title>BrightSign App</title>
</head>
<body>
    <input type="text" id="userIdInput" placeholder="Enter User ID">
    <button id="saveButton">Save User</button>
    
    <script type="module">
        import { PlatformStorage, UserRepository } from './kotlin-output/app-logic.js';
        
        const storage = new PlatformStorage();
        const userRepo = new UserRepository(storage);
        
        document.getElementById('saveButton').addEventListener('click', () => {
            const userId = document.getElementById('userIdInput').value;
            userRepo.saveUserId(userId);
        });
    </script>
</body>
</html>
```

## Common Android → JavaScript Replacements

| Android API | JavaScript/BrightSign Equivalent |
|------------|----------------------------------|
| `SharedPreferences` | `localStorage` or `IndexedDB` |
| `Toast.makeText()` | `console.log()` or custom DOM notification |
| `Context.getSystemService()` | BrightSign device APIs |
| `File` / `FileInputStream` | Node.js `fs` module |
| Coroutines | `async/await` |
| `OkHttp` / `Retrofit` | `fetch()` API |

---

# Method 2: Fresh HTML/JavaScript/Node.js Application ⭐

## Overview

Build a new application from scratch using native web technologies. This provides the best long-term value despite higher initial effort.

**⏱️ Timeline**: 4-6 weeks  
**🎯 Best for**: Production deployments  
**✅ BrightSign Recommended**

## Why BrightSign Recommends This Method

- ✅ **Superior debugging** - Full Chrome DevTools support
- ✅ **Easier maintenance** - Clean, readable JavaScript code
- ✅ **Better performance** - Optimized for BrightSign's engine
- ✅ **Incremental development** - Build and test feature by feature
- ✅ **Direct API access** - Full BrightSign platform integration
- ✅ **Future-proof** - Easy to extend and modify

## Migration Steps

### 1. Analyze Your Android Application

Identify all features, screens, and dependencies in your current app:

```bash
# Count UI components
find . -name "*.kt" | grep Activity | wc -l
find . -name "*.kt" | grep Fragment | wc -l

# List dependencies
grep "implementation" build.gradle
```

**Create a feature inventory:**
- List all screens (Activities/Fragments)
- Identify data sources (Repositories, APIs)
- Note background services
- Document hardware integrations

### 2. Set Up BrightSign Development Environment

```bash
# Verify Node.js (v14+)
node --version

# Create project structure
mkdir brightsign-app
cd brightsign-app
mkdir -p src/{ui,backend,utils} assets

# Initialize npm
npm init -y

# Install dependencies
npm install express
```

**Project structure:**
```
brightsign-app/
├── src/
│   ├── ui/           # HTML/CSS/JS files
│   ├── backend/      # Node.js server (if needed)
│   └── utils/        # Helper functions
├── assets/           # Images, videos, fonts
├── autorun.brs       # BrightSign launcher
├── webpack.config.js # Webpack configuration
└── package.json
```

### 3. Configure Webpack for BrightSign APIs

BrightSign APIs (`@brightsign/*`) are only available when running on physical BrightSign players. To enable local development on your laptop, configure webpack to externalize these modules and use mocks during development.

**Install webpack dependencies:**
```bash
npm install --save-dev webpack webpack-cli webpack-dev-server html-webpack-plugin css-loader style-loader
```

**webpack.config.js:**
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';
    
    return {
        mode: argv.mode || 'development',
        entry: './src/ui/index.js',
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'dist'),
            clean: true,
            library: {
                type: isDevelopment ? 'var' : 'module'
            }
        },
        experiments: {
            outputModule: !isDevelopment
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
            '@brightsign/deviceinfo': '@brightsign/deviceinfo',
            '@brightsign/videooutput': '@brightsign/videooutput',
            '@brightsign/networkconfiguration': '@brightsign/networkconfiguration',
            '@brightsign/screenshot': '@brightsign/screenshot',
            '@brightsign/registry': '@brightsign/registry',
            '@brightsign/serialport': '@brightsign/serialport'
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
export class DeviceInfo {
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

export default DeviceInfo;
```

```javascript
// src/mocks/networkconfiguration.js
export class NetworkConfiguration {
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

export default NetworkConfiguration;
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
export class BrightSignPlatform {
    constructor() {
        this.deviceInfo = null;
        this.initialized = false;
        this.initPromise = this.initialize();
    }
    
    async initialize() {
        try {
            // Dynamic import works with webpack externals (production)
            // and aliases (development)
            const { default: DeviceInfoClass } = await import('@brightsign/deviceinfo');
            this.deviceInfo = new DeviceInfoClass();
            this.initialized = true;
        } catch (error) {
            console.warn('BrightSign deviceinfo not available, using fallback');
            this.deviceInfo = {
                model: 'UNKNOWN',
                osVersion: 'UNKNOWN',
                serialNumber: 'UNKNOWN'
            };
        }
    }
    
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initPromise;
        }
    }
    
    async getDeviceInfo() {
        await this.ensureInitialized();
        
        return {
            model: this.deviceInfo.model,
            osVersion: this.deviceInfo.osVersion,
            serial: this.deviceInfo.serialNumber
        };
    }
}
```

**Development workflow:**

```bash
# Run locally with mocks (webpack resolves @brightsign/* to mocks)
npm run dev

# Build for BrightSign player (webpack externalizes @brightsign/* as ES modules)
npm run build
```

**Important Notes:**

- **Dynamic Imports**: Use `import()` instead of `require()` for BrightSign APIs to ensure compatibility with webpack externals
- **Async Initialization**: Initialize BrightSign APIs asynchronously and use `await ensureInitialized()` before accessing them
- **ES Module Output**: Production builds use ES module format (`experiments.outputModule`) for proper external module handling
- **Mock Classes**: Development mocks should export classes matching the real BrightSign API structure

### 4. Rebuild UI with HTML/CSS/JavaScript

Migrate each Android screen to HTML:

**Android Activity → HTML Page**

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

### 5. Implement Node.js Backend (Optional)

If your app needs server-side logic:

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

### 6. Create BrightSign autorun.brs

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

### 7. Replace Android APIs

**Platform abstraction layer:**

```javascript
// utils/platform.js
export class BrightSignPlatform {
    constructor() {
        this.deviceInfo = null;
        this.networkConfig = null;
        this.initialized = false;
        this.initPromise = this.initialize();
    }
    
    async initialize() {
        try {
            // Dynamic imports for BrightSign APIs
            const [
                { default: DeviceInfoClass },
                { default: NetworkConfigClass }
            ] = await Promise.all([
                import('@brightsign/deviceinfo'),
                import('@brightsign/networkconfiguration')
            ]);
            
            this.deviceInfo = new DeviceInfoClass();
            this.networkConfig = new NetworkConfigClass('eth0');
            this.initialized = true;
        } catch (error) {
            console.warn('BrightSign APIs not available, using fallbacks');
        }
    }
    
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initPromise;
        }
    }
    
    async getDeviceInfo() {
        await this.ensureInitialized();
        
        if (this.deviceInfo) {
            return {
                model: this.deviceInfo.model,
                osVersion: this.deviceInfo.osVersion,
                serial: this.deviceInfo.serialNumber
            };
        }
        return { model: 'MOCK', osVersion: 'MOCK', serial: 'MOCK' };
    }
    
    async savePreference(key, value) {
        await this.ensureInitialized();
        localStorage.setItem(key, JSON.stringify(value));
    }
    
    async getPreference(key, defaultValue = null) {
        await this.ensureInitialized();
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

export default new BrightSignPlatform();
```

---

# Common API Replacements

## Storage

| Android | BrightSign/JavaScript |
|---------|----------------------|
| `SharedPreferences.getString()` | `localStorage.getItem(key)` |
| `SharedPreferences.putString()` | `localStorage.setItem(key, value)` |
| Room Database | IndexedDB |

## Networking

| Android | BrightSign/JavaScript |
|---------|----------------------|
| Retrofit | `fetch()` API or `axios` |
| OkHttp | Native `fetch()` |
| Ktor Client (Android) | Ktor Client (JS) |

## UI

| Android | BrightSign/JavaScript |
|---------|----------------------|
| `Toast.makeText()` | `console.log()` or custom DOM element |
| `AlertDialog` | `window.confirm()` or custom modal |
| `TextView` | `<p>` or `<span>` |
| `Button` | `<button>` |
| `RecyclerView` | `<div>` with JavaScript templating |

## Device APIs

| Android | BrightSign |
|---------|-----------|
| `Build.MODEL` | `const { default: DeviceInfo } = await import('@brightsign/deviceinfo'); new DeviceInfo().model` |
| `MediaPlayer` | HTML5 `<video>` or `@brightsign/videooutput` |
| File I/O | Node.js `fs` module |

## Async Operations

| Android | JavaScript |
|---------|-----------|
| Kotlin Coroutines (`suspend fun`) | `async function` |
| `launch { }` | `await` |
| `Flow` | RxJS or async generators |

---

# Getting Started

## 1. Choose Your Migration Method

Answer these questions:

1. **Timeline**: How quickly do you need a working app?
   - Need a quick demo/prototype (1-2 weeks) → Method 1 (Transpilation)
   - Building for production (4-6 weeks) → Method 2 (Fresh Rebuild) ⭐

2. **Goal**: What's your primary objective?
   - Rapid proof-of-concept → Method 1 (then plan to rebuild)
   - Production deployment → Method 2 ⭐ **Recommended**
   - Specialized needs (multi-platform, high performance, offline-first) → See [Advanced Approaches](#advanced-migration-approaches)

3. **Team Skills**: What expertise does your team have?
   - Strong JavaScript/Node.js → Method 2 ⭐ **Best choice**
   - Kotlin expertise, limited JS → Method 1 for prototype, then Method 2

## 2. Analyze Your Android App

```bash
# Count components
find . -name "*.kt" | xargs grep -l "Activity" | wc -l
find . -name "*.kt" | xargs grep -l "Fragment" | wc -l

# List dependencies
grep "implementation" build.gradle > dependencies.txt

# Identify Android APIs
grep -r "import android\." . --include="*.kt"
```

## 3. Set Up Development Environment

```bash
# Install Node.js (v14+)
node --version

# Create project
mkdir brightsign-app && cd brightsign-app

# Initialize
npm init -y
npm install express
```

## 4. Start Migration

Follow the detailed steps for your chosen method (see sections above).

## 5. Test on BrightSign Device

- Enable remote debugging (port 2999)
- Deploy to SD card
- Test all functionality
- Monitor console logs

---

# Advanced Migration Approaches

> **Note**: The following approaches are for specialized use cases. For most projects, we recommend Method 2 (Fresh Rebuild).

## Method 3: Kotlin Multiplatform (KMM)

**⏱️ Timeline**: 2-3 weeks  
**🎯 Best for**: Teams with Kotlin expertise planning multi-platform support (Android, iOS, Web, BrightSign)

**When to use:**
- You're already using or planning to use Kotlin Multiplatform
- You need to share business logic across multiple platforms
- Your team has strong Kotlin expertise

**Project Structure:**
```
project/
├── shared/
│   ├── commonMain/    # Shared business logic
│   └── jsMain/        # BrightSign/JS specific
└── brightSignApp/
    └── ui/            # HTML/CSS
```

**Example:**
```kotlin
// shared/commonMain - Business logic
class UserService(private val repository: UserRepository) {
    suspend fun getUser(userId: String): User {
        return repository.fetchUser(userId)
    }
}

// shared/jsMain - Platform implementation
actual class PlatformStorage {
    actual fun save(key: String, value: String) {
        kotlinx.browser.localStorage.setItem(key, value)
    }
}
```

---

## Method 4: WebAssembly (WASM)

**⏱️ Timeline**: 3-5 weeks  
**🎯 Best for**: CPU-intensive operations (image processing, ML inference, encryption)

**When to use:**
- Your app has performance-critical compute operations
- Image/video processing requirements
- Complex algorithms or real-time data processing
- You need near-native performance

**Example: Image Processing**

```kotlin
@WasmExport
class ImageProcessor {
    fun applyFilter(pixels: IntArray, width: Int, height: Int): IntArray {
        val result = IntArray(pixels.size)
        for (i in pixels.indices) {
            result[i] = applyGrayscale(pixels[i])
        }
        return result
    }
    
    private fun applyGrayscale(pixel: Int): Int {
        val r = (pixel shr 16) and 0xFF
        val g = (pixel shr 8) and 0xFF
        val b = pixel and 0xFF
        val gray = (r + g + b) / 3
        return (gray shl 16) or (gray shl 8) or gray
    }
}
```

**JavaScript Integration:**
```javascript
async function processImage(imageData) {
    const wasmModule = await import('./imageProcessor.wasm');
    const processor = new wasmModule.ImageProcessor();
    
    const filtered = processor.applyFilter(
        new Int32Array(imageData.data.buffer),
        imageData.width,
        imageData.height
    );
    
    ctx.putImageData(new ImageData(
        new Uint8ClampedArray(filtered.buffer),
        imageData.width,
        imageData.height
    ), 0, 0);
}
```

---

## Method 5: Progressive Web App (PWA)

**⏱️ Timeline**: 2-3 weeks  
**🎯 Best for**: Apps requiring offline functionality and automatic updates

**When to use:**
- Your app must work offline
- You need automatic background updates
- You want app-like full-screen experience
- Content caching is critical for performance

**Key Features:**
- ✅ Offline support via Service Workers
- ✅ App-like experience (full-screen)
- ✅ Automatic background updates
- ✅ Content caching for performance

**Implementation:**

**manifest.json:**
```json
{
  "name": "BrightSign App",
  "short_name": "BSApp",
  "start_url": "/index.html",
  "display": "fullscreen",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

**Service Worker for Offline:**
```javascript
// service-worker.js
const CACHE_NAME = 'brightsign-app-v1';
const OFFLINE_URLS = ['/', '/index.html', '/app.js', '/styles.css'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(OFFLINE_URLS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
```

**IndexedDB for Large Data:**
```javascript
class OfflineDatabase {
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('BrightSignDB', 1);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore('videos', { keyPath: 'id' });
            };
        });
    }
    
    async saveVideo(videoBlob, metadata) {
        const transaction = this.db.transaction(['videos'], 'readwrite');
        await transaction.objectStore('videos').put({
            id: metadata.id,
            blob: videoBlob,
            metadata: metadata
        });
    }
}
```

---

# BrightSign Resources

**Essential Documentation:**
- [BrightSign Developer Portal](https://docs.brightsign.biz/developers)
- [JavaScript API Reference](https://docs.brightsign.biz/developers/javascript-apis)
- [Debugging Guide](https://docs.brightsign.biz/developers/debugging-htmlnode-apps)

**Example Applications:**
1. [Simple Node.js Server](https://github.com/brightsign/dev-cookbook/tree/main/examples/node-simple-server)
2. [IndexedDB Caching](https://github.com/brightsign/dev-cookbook/tree/main/examples/indexeddb-caching)
3. [Application Self-Updater](https://github.com/brightsign/dev-cookbook/tree/main/examples/bs-self-updater)

---

# Recommendations

## For Most Projects ⭐
**Use Method 2 (Fresh HTML/JS/Node.js Rebuild)**
- Best long-term value
- Easier debugging and maintenance
- Full BrightSign platform integration
- Clean, readable code
- Industry-standard web technologies

## For Rapid Prototyping
**Use Method 1 (Transpilation)**
- Fastest time to working prototype (1-2 weeks)
- Reuse existing business logic
- **Important**: Plan to refactor to Method 2 for production deployment

## For Specialized Use Cases
See [Advanced Migration Approaches](#advanced-migration-approaches) for:
- Multi-platform code sharing (Kotlin Multiplatform)
- CPU-intensive operations (WebAssembly)
- Offline-first requirements (PWA)

---

**Questions or need help?** Refer to [CLAUDE.md](CLAUDE.md) for AI automation patterns and detailed transformation rules.
