# Kotlin Migration Guide

**🤖 AI-First Migration**: This guide is designed for AI-assisted migration. Instead of manually executing steps, you'll work with AI agents (like Claude via the BrightDeveloper MCP) to automate the entire migration process. For machine-readable patterns and automation schemas, see [CLAUDE.md](CLAUDE.md).

If you have not set up the BrightDeveloper MCP Server yet, follow the instructions in the [Installing the MCP server](https://github.com/BrightDevelopers/BrightDev/blob/main/README.md#install-the-brightsign-mcp-server) section of the main BrightDev README file.

> Note that not everything generated using AI agents and the BrightDeveloper MCP may be perfect on the first try. You may need to iterate with the AI, provide additional context, or make manual adjustments as needed.

> **Before you begin:** This guide defaults to the Chromium media player on Series 5 devices, which supports modern web APIs (service workers, Cache API, IndexedDB, etc.). If your app needs HDMI input, RTSP/UDP streams, frame-accurate sync, chroma key, or Series 4 support, read [Media Player Selection](../media-player-selection.md) first.

## Overview

When migrating your Kotlin-based Android application to the BrightSign platform, you have 2 primary approaches:

1. **[Method 1: Kotlin to JavaScript Transpilation](method1-transpilation.md)** - Quick prototyping
2. **[Method 2: Fresh HTML/JS/Node.js Rebuild](method2-fresh-rebuild.md)** - Production quality ⭐

**BrightSign recommends Method 2 (Fresh Rebuild)** for production deployments due to superior debugging, easier maintenance, and better platform integration.

**Note**: Advanced approaches (Kotlin Multiplatform, WebAssembly, PWA) are available for specialized use cases - see the [Advanced Migration Approaches](#advanced-migration-approaches) section below.

---

# Getting Started with AI-Assisted Migration

| Your Goal | Recommended Method |
|-----------|-------------------|
| **Rapid prototype** - Get something running quickly to demo | [Method 1: Transpilation](method1-transpilation.md) |
| **Production app** - Long-term maintainability | [Method 2: Fresh Rebuild](method2-fresh-rebuild.md) ⭐ |
| **Specialized needs** - Multi-platform sharing, performance-critical | [Advanced Approaches](#advanced-migration-approaches) |

## Tips for Best Results

When writing any AI prompts to assist with your migration, keep these tips in mind:

1. **Be Specific**: Provide accurate counts and detailed feature lists - AI uses this to estimate scope
2. **Include Dependencies**: Mention all third-party libraries - AI will find modern web equivalents or create abstractions
3. **Describe Custom Features**: Unique functionality needs clear description - AI can recreate if well-explained
4. **State Constraints**: Network, hardware, performance requirements - AI will design accordingly
5. **Review Architecture**: Let AI propose the architecture before coding - validate the approach
6. **Iterative Development**: Have AI build and test each feature incrementally
7. **Ask for Explanations**: If generated code seems complex, ask AI to explain its decisions
8. **Test Locally First**: Use webpack dev mode with mocks before deploying to BrightSign
9. **Use Chrome DevTools**: Take advantage of remote debugging (port 2999) - AI can help set this up
10. **Plan for Production**: If using Method 1, schedule a transition to Method 2 for production readiness

---

# Advanced Migration Approaches

## Method 3: Kotlin Multiplatform (KMM)

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

**When to use:**
- Your app has performance-critical compute operations (image processing, ML inference, encryption)
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

## Method 5: Offline Progressive Web App (PWA)

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

- [BrightSign Developer Portal](https://docs.brightsign.biz/developers)
- [JavaScript API Reference](https://docs.brightsign.biz/developers/javascript-apis)
- [Debugging HTML/Nodejs apps](https://docs.brightsign.biz/developers/debugging-htmlnode-apps)
