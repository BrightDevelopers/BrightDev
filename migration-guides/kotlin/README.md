# Kotlin Migration Guide

**🤖 AI-First Migration**: This guide is designed for AI-assisted migration. Instead of manually executing steps, you'll work with AI agents (like Claude via the BrightDeveloper MCP) to automate the entire migration process. For machine-readable patterns and automation schemas, see [CLAUDE.md](CLAUDE.md).

If you have not set up the BrightDeveloper MCP Server yet, follow the instructions in the [Installing the MCP server](https://github.com/BrightDevelopers/BrightDev/blob/main/README.md#install-the-brightsign-mcp-server) section of the main BrightDev README file.

> Note that not everything generated using AI agents and the BrightDeveloper MCP may be perfect on the first try. You may need to iterate with the AI, provide additional context, or make manual adjustments as needed.

## Overview

When migrating your Kotlin-based Android application to the BrightSign platform, you have **2 primary approaches**:

1. **[Method 1: Kotlin to JavaScript Transpilation](method1-transpilation.md)** - Quick prototyping (1-2 weeks)
2. **[Method 2: Fresh HTML/JS/Node.js Rebuild](method2-fresh-rebuild.md)** - Production quality (4-6 weeks) ⭐ **Recommended**

**BrightSign recommends Method 2 (Fresh Rebuild)** for production deployments due to superior debugging, easier maintenance, and better platform integration.

> **Note**: Advanced approaches (Kotlin Multiplatform, WebAssembly, PWA) are available for specialized use cases - see the [Advanced Migration Approaches](#advanced-migration-approaches) section below.

---

## Quick Decision Guide

**Choose your migration approach:**

| Your Goal | Recommended Method | Timeline | Use When |
|-----------|-------------------|----------|----------|
| **Rapid prototype** - Get something running quickly to demo | [Method 1: Transpilation](method1-transpilation.md) | 1-2 weeks | You need a proof-of-concept fast, plan to rebuild later |
| **Production app** - Long-term maintainability ⭐ | [Method 2: Fresh Rebuild](method2-fresh-rebuild.md) | 4-6 weeks | You want a production-ready application |

> **For specialized scenarios** (multi-platform code sharing, CPU-intensive operations, offline-first apps), see [Advanced Migration Approaches](#advanced-migration-approaches).

---

## Common API Replacements

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
| `Build.MODEL` | `const DeviceInfo = require('@brightsign/deviceinfo'); new DeviceInfo().model` (CommonJS for Node v18.18.2) |
| `MediaPlayer` | HTML5 `<video>` or `const VideoOutput = require('@brightsign/videooutput')` |
| File I/O | Node.js `fs` module |

## Async Operations

| Android | JavaScript |
|---------|-----------|
| Kotlin Coroutines (`suspend fun`) | `async function` |
| `launch { }` | `await` |
| `Flow` | RxJS or async generators |

---

# Getting Started with AI-Assisted Migration

## 1. Choose Your Migration Method

Answer these questions to guide the AI:

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

## 2. Let AI Analyze Your Android App

**Instead of running bash commands manually, use this AI prompt:**

```
Analyze my Kotlin Android application and provide a comprehensive inventory:

1. Count and list all Activities and Fragments
2. Extract all dependencies from build.gradle files
3. Identify all Android-specific APIs being used (imports starting with "android.")
4. Map out the application architecture (UI layer, data layer, business logic)
5. Identify which components can be reused vs. need complete rebuilds
6. Flag any complex dependencies that may need special handling
7. Estimate the complexity level (LOW/MEDIUM/HIGH) for migration

Provide results in a structured format with specific file paths and line numbers.
```

## 3. Let AI Set Up Your Development Environment

**Use this prompt instead of manual commands:**

```
Set up a BrightSign development environment for my Kotlin migration:

1. Verify Node.js is installed (v18.18.2) and show the version
2. Create a new BrightSign project with this structure:
   - src/ui/ for HTML/CSS/JavaScript
   - src/backend/ for Node.js server code
   - src/utils/ for helper functions
   - assets/ for media files
3. Initialize npm with appropriate package.json
4. Install required dependencies (express, webpack, etc.)
5. Set up webpack configuration for BrightSign
6. Create a basic autorun.brs launcher file

Provide the full project structure and all configuration files.
```

## 4. Start AI-Driven Migration

Follow the detailed AI prompts in your chosen method guide:
- [Method 1: AI-Assisted Transpilation →](method1-transpilation.md)
- [Method 2: AI-Driven Fresh Rebuild →](method2-fresh-rebuild.md) ⭐

## 5. Let AI Help Test and Deploy

**Use this prompt for testing:**

```
Help me test and deploy my BrightSign application:

1. Analyze the code for any common issues or bugs
2. Create a testing checklist for all features
3. Set up remote debugging configuration (port 2999)
4. Generate deployment instructions for SD card
5. Create monitoring and logging setup
6. Provide troubleshooting guide for common issues

Include specific commands and configurations needed.
```

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

## Next Steps

Choose your migration method and get started:
- **[Method 1: Kotlin to JavaScript Transpilation →](method1-transpilation.md)**
- **[Method 2: Fresh HTML/JS/Node.js Rebuild →](method2-fresh-rebuild.md)** ⭐ Recommended
