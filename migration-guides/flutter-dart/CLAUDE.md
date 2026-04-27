# AI Migration Instructions for Flutter/Dart to HTML/JavaScript/Node.js (BrightSign)

> **Purpose**: This file contains machine-readable instructions, automation rules, and transformation patterns for AI systems performing automated migration of Flutter/Dart applications to HTML/JavaScript/Node.js for BrightSign platforms.
>
> **Human-Readable Guide**: See [README.md](README.md) for the main documentation.

---

## Document Metadata

```json
{
  "document_type": "ai_migration_instructions",
  "version": "1.0",
  "target_platform": "brightsign",
  "source_platform": "flutter_dart",
  "automation_level": "full_auto_with_placeholders",
  "primary_methods": ["flutter_web_adaptation", "fresh_rebuild"],
  "recommended_method": "flutter_web_adaptation",
  "fresh_rebuild_method": "fresh_rebuild",
  "flutter_renderer_note": "HTML renderer deprecated in Flutter 3.22, removed in Flutter 3.29. All builds now use CanvasKit. Do not attempt --web-renderer html on Flutter 3.29+.",
  "target_nodejs_version": "18.18.2",
  "target_runtime": "chromium_brightsign",
  "note": "Method 1 is recommended for existing Flutter Web apps. Method 2 is for performance-critical signage or apps needing BrightSign device APIs."
}
```

---

## Migration Method Selection Decision Tree

```json
{
  "decision_tree": {
    "root": {
      "question": "Do you have an existing Flutter Web app (flutter build web works)?",
      "options": {
        "yes": {
          "next": "check_method1_constraints"
        },
        "no": {
          "result": "METHOD_2_FRESH_REBUILD",
          "note": "No Flutter Web output to adapt. Rebuild from Dart source."
        }
      }
    },
    "check_method1_constraints": {
      "question": "Does your app require any of the following?",
      "options": {
        "needs_brightsign_device_apis": {
          "result": "METHOD_2_FRESH_REBUILD",
          "note": "Flutter Web cannot call @brightsign/* Node.js modules. Rebuild required."
        },
        "needs_24_7_stability_for_weeks": {
          "result": "METHOD_2_FRESH_REBUILD",
          "note": "CanvasKit redraws constantly. Plain HTML is more stable for long-running signage."
        },
        "uses_incompatible_packages": {
          "result": "METHOD_2_FRESH_REBUILD",
          "note": "If sqflite, flutter_blue_plus, path_provider, or other non-web packages are core, rebuild."
        },
        "none_of_above": {
          "result": "METHOD_1_FLUTTER_WEB_ADAPTATION",
          "note": "Recommended path. Adapt the existing Flutter Web build output."
        }
      }
    }
  }
}
```

---

## Method 1: Flutter Web Adaptation

```json
{
  "method_id": "flutter_web_adaptation",
  "difficulty": "low-medium",
  "time_to_first_run": "1-3 days",
  "maintenance_complexity": "medium",
  "debugging_ease": "medium",
  "brightsign_recommendation": "primary_for_existing_flutter_web_apps",
  "production_ready": true,
  "migration_plan": [
    "analyze_flutter_web_build_output",
    "choose_renderer",
    "remove_flutter_web_incompatibilities",
    "adapt_index_html_for_brightsign",
    "patch_canvaskit_wasm_path_if_needed",
    "adapt_font_loading",
    "handle_video_playback",
    "configure_webpack_if_needed",
    "generate_autorun_brs",
    "package_for_sd_card"
  ],
  "outputs": [
    "adapted_build_web_directory",
    "autorun.brs",
    "SD_CARD_STRUCTURE.md"
  ]
}
```

---

## Method 2: Fresh Rebuild

```json
{
  "method_id": "fresh_rebuild",
  "difficulty": "medium-high",
  "time_to_first_run": "1-3 weeks",
  "maintenance_complexity": "low",
  "debugging_ease": "high",
  "brightsign_recommendation": "production_for_device_api_apps",
  "production_ready": true,
  "migration_plan": [
    "analyze_dart_flutter_source",
    "extract_business_logic",
    "map_flutter_widgets_to_html_css",
    "map_dart_patterns_to_javascript",
    "map_flutter_packages_to_npm",
    "build_html_ui_layer",
    "build_nodejs_backend",
    "bundle_client_code",
    "setup_node_server_if_spa_routing",
    "generate_autorun_brs",
    "package_for_sd_card"
  ],
  "outputs": [
    "html_css_ui",
    "javascript_modules",
    "bundle.js",
    "autorun.brs",
    "server.bundle.js (only if SPA routing needed)",
    "SD_CARD_STRUCTURE.md"
  ]
}
```

---

## Flutter Web Build Output Analysis

```json
{
  "analyze_flutter_web_build_output": {
    "expected_directory": "build/web/",
    "expected_files": {
      "index.html": "Entry point. Bootstraps Flutter engine. Must be adapted for BrightSign.",
      "main.dart.js": "Compiled Dart code. Keep as-is.",
      "flutter.js": "Flutter engine loader. Keep as-is.",
      "flutter_bootstrap.js": "Initialization script. Contains service worker registration - MUST be patched.",
      "canvaskit/canvaskit.js": "CanvasKit renderer. Present only if CanvasKit renderer was used.",
      "canvaskit/canvaskit.wasm": "WebAssembly binary for CanvasKit. Must load from local path, not CDN.",
      "assets/AssetManifest.json": "Lists all bundled assets. Keep as-is.",
      "assets/FontManifest.json": "Lists bundled fonts. Keep as-is.",
      "assets/fonts/": "Embedded font files. Keep as-is."
    },
    "renderer_detection": {
      "canvaskit_always_present": "Flutter 3.29+ removed the HTML renderer. All builds use CanvasKit. canvaskit/ will always be present.",
      "legacy_html_renderer": "If canvaskit/ is absent, the build was produced by Flutter older than 3.22 using the HTML renderer. This is rare on modern projects.",
      "check_command": "Look for 'canvaskit' directory in build/web/. Expect it to be present on any modern Flutter build."
    }
  }
}
```

---

## Flutter Web Transformation Rules

### Rule 1: Service Worker Removal

```json
{
  "rule_id": "remove_service_worker",
  "applies_to": "METHOD_1",
  "files_to_check": ["flutter_bootstrap.js", "index.html"],
  "patterns_to_remove": [
    "navigator.serviceWorker.register",
    "serviceWorkerVersion",
    "flutter_service_worker.js"
  ],
  "transformation": {
    "flutter_bootstrap.js": "Remove the entire serviceWorkerVersion check block and service worker registration call.",
    "index.html": "Remove any <link> or <script> tags referencing flutter_service_worker.js.",
    "reason": "BrightSign Chromium does not support service workers. They cause silent failures."
  }
}
```

### Rule 2: CanvasKit WASM Path Patching

```json
{
  "rule_id": "patch_canvaskit_wasm_path",
  "applies_to": "METHOD_1, CanvasKit builds only",
  "problem": "CanvasKit defaults to loading canvaskit.wasm from a CDN URL. BrightSign has no internet access.",
  "detection": "Look for 'https://www.gstatic.com/flutter-canvaskit/' in canvaskit/canvaskit.js",
  "transformation": {
    "action": "Replace CDN URL with local relative path",
    "find": "https://www.gstatic.com/flutter-canvaskit/",
    "replace": "./canvaskit/",
    "file": "canvaskit/canvaskit.js"
  },
  "recommendation": "CanvasKit is now the only renderer in Flutter 3.29+. Always apply this patch for modern Flutter builds."
}
```

### Rule 3: Font Loading Adaptation

```json
{
  "rule_id": "adapt_font_loading",
  "applies_to": "METHOD_1",
  "problem": "Flutter Web may attempt to load fonts from fonts.googleapis.com or other CDN sources.",
  "detection": "Search index.html and main.dart.js for 'fonts.googleapis.com' or 'fonts.gstatic.com'",
  "transformation": {
    "action": "Remove Google Fonts CDN links. Flutter bundles fonts in assets/fonts/ - use those.",
    "verify": "assets/FontManifest.json lists all embedded fonts",
    "index_html": "Remove <link rel='stylesheet' href='https://fonts.googleapis.com/...'> tags"
  }
}
```

### Rule 4: Index HTML Adaptation for BrightSign

```json
{
  "rule_id": "adapt_index_html",
  "applies_to": "METHOD_1",
  "transformations": [
    {
      "action": "update_viewport",
      "find": "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
      "replace": "<meta name=\"viewport\" content=\"width=1920, height=1080, initial-scale=1\">"
    },
    {
      "action": "set_body_dimensions",
      "css": "html, body { width: 1920px; height: 1080px; margin: 0; padding: 0; overflow: hidden; background: #000; }"
    },
    {
      "action": "remove_base_href_if_relative",
      "note": "Change <base href='/'> to match SD card structure if needed"
    }
  ]
}
```

### Rule 5: Video Playback with CanvasKit

```json
{
  "rule_id": "video_overlay_canvaskit",
  "applies_to": "METHOD_1, CanvasKit builds using video_player package",
  "problem": "CanvasKit renders the entire UI on a single canvas. HTML5 <video> elements sit behind the canvas by default.",
  "solution": {
    "note": "The HTML renderer was removed in Flutter 3.29. CanvasKit is now the only renderer. Apply the CSS z-index fix below, or consider Method 2 for video-heavy apps.",
    "workaround": [
      "video_player package on web uses a <video> element with platform view",
      "Flutter Web injects the video as a platform view overlay on top of the canvas",
      "Verify z-index: the video div needs z-index higher than the canvas element",
      "CSS: .flt-platform-view { position: absolute; z-index: 10; }",
      "Always apply this fix for any Flutter 3.29+ build using video_player"
    ]
  }
}
```

---

## Dart/Flutter to JavaScript/HTML API Mapping

```json
{
  "api_mappings": [
    {
      "dart_flutter": "Widget build(BuildContext context)",
      "javascript_html": "function renderComponent() { return document.createElement(...) }",
      "category": "widget_lifecycle"
    },
    {
      "dart_flutter": "StatefulWidget + setState()",
      "javascript_html": "Plain JS object with event listeners or pub/sub state",
      "category": "state_management"
    },
    {
      "dart_flutter": "StatelessWidget",
      "javascript_html": "Pure function returning DOM element",
      "category": "state_management"
    },
    {
      "dart_flutter": "Scaffold",
      "javascript_html": "<div class='app-root' style='width:1920px;height:1080px;position:relative'>",
      "category": "layout_widget"
    },
    {
      "dart_flutter": "AppBar",
      "javascript_html": "<header style='position:absolute;top:0;width:100%;height:56px'>",
      "category": "layout_widget"
    },
    {
      "dart_flutter": "Column",
      "javascript_html": "<div style='display:flex;flex-direction:column'>",
      "category": "layout_widget"
    },
    {
      "dart_flutter": "Row",
      "javascript_html": "<div style='display:flex;flex-direction:row'>",
      "category": "layout_widget"
    },
    {
      "dart_flutter": "Stack",
      "javascript_html": "<div style='position:relative'>",
      "category": "layout_widget"
    },
    {
      "dart_flutter": "Positioned",
      "javascript_html": "<div style='position:absolute;top:X;left:Y'>",
      "category": "layout_widget"
    },
    {
      "dart_flutter": "Container(width, height, decoration)",
      "javascript_html": "<div style='width:Xpx;height:Ypx;background:Z;border-radius:Rpx'>",
      "category": "layout_widget"
    },
    {
      "dart_flutter": "Padding",
      "javascript_html": "CSS padding property on parent element",
      "category": "layout_widget"
    },
    {
      "dart_flutter": "SizedBox",
      "javascript_html": "<div style='width:Xpx;height:Ypx'>",
      "category": "layout_widget"
    },
    {
      "dart_flutter": "Expanded / Flexible",
      "javascript_html": "CSS flex-grow: 1 or flex: 1",
      "category": "layout_widget"
    },
    {
      "dart_flutter": "Text(string, style: TextStyle(...))",
      "javascript_html": "<span style='font-size:Xpx;color:Y;font-weight:Z'>string</span>",
      "category": "display_widget"
    },
    {
      "dart_flutter": "Image.asset(path)",
      "javascript_html": "<img src='assets/path'>",
      "category": "display_widget"
    },
    {
      "dart_flutter": "Image.network(url)",
      "javascript_html": "<img src='url'>",
      "category": "display_widget"
    },
    {
      "dart_flutter": "Icon(Icons.play_arrow)",
      "javascript_html": "<span class='icon'>&#9654;</span> or SVG icon",
      "category": "display_widget"
    },
    {
      "dart_flutter": "CircularProgressIndicator",
      "javascript_html": "CSS spinner: <div class='spinner'></div>",
      "category": "display_widget"
    },
    {
      "dart_flutter": "ListView / ListView.builder",
      "javascript_html": "<ul style='overflow-y:auto'> or virtual scroll with JS",
      "category": "list_widget"
    },
    {
      "dart_flutter": "GridView",
      "javascript_html": "<div style='display:grid;grid-template-columns:repeat(N,1fr)'>",
      "category": "list_widget"
    },
    {
      "dart_flutter": "GestureDetector / InkWell",
      "javascript_html": "addEventListener('click', handler)",
      "category": "interaction_widget"
    },
    {
      "dart_flutter": "Navigator.push(context, route)",
      "javascript_html": "Show/hide div sections or update window.location.hash",
      "category": "navigation"
    },
    {
      "dart_flutter": "Navigator.pop(context)",
      "javascript_html": "Hide current section, show previous section",
      "category": "navigation"
    },
    {
      "dart_flutter": "Future<T>",
      "javascript_html": "Promise<T>",
      "category": "async"
    },
    {
      "dart_flutter": "async / await",
      "javascript_html": "async / await (identical pattern)",
      "category": "async"
    },
    {
      "dart_flutter": "Stream<T>",
      "javascript_html": "EventEmitter (Node.js) or ReadableStream (browser)",
      "category": "async"
    },
    {
      "dart_flutter": "StreamController",
      "javascript_html": "new EventEmitter() in Node.js",
      "category": "async"
    },
    {
      "dart_flutter": "StreamBuilder",
      "javascript_html": "emitter.on('event', () => updateDOM())",
      "category": "async"
    },
    {
      "dart_flutter": "class Foo extends Bar",
      "javascript_html": "class Foo extends Bar (ES6 identical)",
      "category": "language"
    },
    {
      "dart_flutter": "int / double / num",
      "javascript_html": "number",
      "category": "language"
    },
    {
      "dart_flutter": "String?",
      "javascript_html": "string | null (no enforcement - validate manually)",
      "category": "language"
    },
    {
      "dart_flutter": "late final String name",
      "javascript_html": "let name; // flag for deferred init - document risk",
      "category": "language"
    },
    {
      "dart_flutter": "List<T>",
      "javascript_html": "Array (no type enforcement)",
      "category": "language"
    },
    {
      "dart_flutter": "Map<K,V>",
      "javascript_html": "Object or Map",
      "category": "language"
    },
    {
      "dart_flutter": "Set<T>",
      "javascript_html": "new Set()",
      "category": "language"
    },
    {
      "dart_flutter": "extension methods on type",
      "javascript_html": "Standalone utility function (do NOT mutate prototype)",
      "category": "language"
    },
    {
      "dart_flutter": "print(msg)",
      "javascript_html": "console.log(msg)",
      "category": "debugging"
    },
    {
      "dart_flutter": "debugPrint(msg)",
      "javascript_html": "console.log(msg)",
      "category": "debugging"
    }
  ]
}
```

---

## Flutter Package to npm Package Mapping

```json
{
  "package_mappings": [
    {
      "flutter_package": "http",
      "npm_equivalent": "fetch (built-in) or axios",
      "notes": "Use native fetch on BrightSign Chromium. No install needed."
    },
    {
      "flutter_package": "dio",
      "npm_equivalent": "axios",
      "notes": "axios has interceptors similar to Dio."
    },
    {
      "flutter_package": "shared_preferences",
      "npm_equivalent": "localStorage (browser) or JSON file (Node.js)",
      "notes": "localStorage is available in BrightSign Chromium."
    },
    {
      "flutter_package": "video_player",
      "npm_equivalent": "HTML5 <video> element (no package needed)",
      "notes": "Use <video autoplay loop> with src. Works natively in BrightSign Chromium."
    },
    {
      "flutter_package": "chewie",
      "npm_equivalent": "HTML5 <video> with custom controls overlay",
      "notes": "Build a simple JS controls layer over <video>."
    },
    {
      "flutter_package": "provider",
      "npm_equivalent": "Vanilla JS module with callbacks or a simple pub/sub pattern",
      "notes": "No dependency needed. A small EventEmitter is sufficient."
    },
    {
      "flutter_package": "riverpod",
      "npm_equivalent": "Vanilla JS module with callbacks or nanostores",
      "notes": "nanostores is lightweight. Or use simple pub/sub for signage apps."
    },
    {
      "flutter_package": "bloc / flutter_bloc",
      "npm_equivalent": "XState or vanilla JS state machine",
      "notes": "XState has a BLoC-like pattern. Vanilla state object is simpler for signage."
    },
    {
      "flutter_package": "get_it",
      "npm_equivalent": "Module-level singleton exports (Node.js modules are cached)",
      "notes": "No DI container needed. Import the singleton module directly."
    },
    {
      "flutter_package": "go_router / auto_route",
      "npm_equivalent": "Show/hide divs or hash-based routing",
      "notes": "For signage, show/hide sections is usually sufficient. No routing library needed."
    },
    {
      "flutter_package": "intl",
      "npm_equivalent": "Intl (built-in JS API)",
      "notes": "Intl.DateTimeFormat, Intl.NumberFormat are built into modern browsers and Node.js."
    },
    {
      "flutter_package": "url_launcher",
      "npm_equivalent": "window.open() or anchor tag",
      "notes": "Rarely needed on signage. BrightSign Chromium supports window.open()."
    },
    {
      "flutter_package": "image_picker",
      "npm_equivalent": "Not applicable for signage",
      "notes": "Digital signage does not use file pickers. Remove this feature."
    },
    {
      "flutter_package": "camera",
      "npm_equivalent": "navigator.mediaDevices.getUserMedia()",
      "notes": "Web API works if camera is connected to BrightSign."
    },
    {
      "flutter_package": "path_provider",
      "npm_equivalent": "path.resolve(__dirname) in Node.js",
      "notes": "File system access via Node.js. Use __dirname for relative paths."
    },
    {
      "flutter_package": "sqflite",
      "npm_equivalent": "better-sqlite3 (Node.js) or IndexedDB (browser)",
      "notes": "better-sqlite3 is synchronous and works well on BrightSign Node.js."
    },
    {
      "flutter_package": "hive",
      "npm_equivalent": "localStorage (simple) or better-sqlite3 (structured)",
      "notes": "localStorage for small data, SQLite for large collections."
    },
    {
      "flutter_package": "firebase_core / cloud_firestore",
      "npm_equivalent": "firebase (npm) or REST API calls",
      "notes": "Firebase JS SDK works in Node.js. Use REST API for simpler deployments."
    },
    {
      "flutter_package": "connectivity_plus",
      "npm_equivalent": "window.ononline / window.onoffline or @brightsign/networkconfiguration",
      "notes": "For BrightSign device network status, use @brightsign/networkconfiguration."
    },
    {
      "flutter_package": "package_info_plus",
      "npm_equivalent": "Read package.json directly",
      "notes": "const pkg = require('./package.json'); pkg.version"
    }
  ]
}
```

---

## Webpack Configuration Patterns

### Method 1: Static Flutter Web Adaptation (No Webpack Needed Typically)

```json
{
  "method1_webpack_note": "Most Flutter Web adaptations do NOT require webpack. The build/web/ output is already self-contained. Webpack is only needed if you are adding custom JavaScript modules on top of the Flutter output.",
  "when_webpack_is_needed": [
    "Adding BrightSign device API calls in a custom JS wrapper",
    "Adding a Node.js server layer for SPA routing",
    "Bundling additional npm packages alongside the Flutter output"
  ]
}
```

### Method 1: Custom JS Additions (If Needed)

```javascript
// webpack.config.js - Only use if adding custom JS to Flutter Web output
const path = require('path');

module.exports = {
  entry: './src/brightsign-bridge.js',
  output: {
    filename: 'brightsign-bridge.bundle.js',
    path: path.resolve(__dirname, 'build/web'),
    publicPath: '/'
  },
  mode: 'production',
  target: 'web',

  // CRITICAL: Mark BrightSign APIs as externals - provided by the runtime
  externals: {
    '@brightsign/deviceinfo': 'commonjs @brightsign/deviceinfo',
    '@brightsign/networkconfiguration': 'commonjs @brightsign/networkconfiguration',
    '@brightsign/screenshot': 'commonjs @brightsign/screenshot',
    '@brightsign/registry': 'commonjs @brightsign/registry'
    // Add other @brightsign/* modules as needed
  }
};
```

### Method 2: Full Client Bundle

```javascript
// webpack.config.js - Bundles all HTML/JS rebuild client code
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  mode: 'production',

  // CRITICAL: Mark BrightSign APIs as externals
  externals: {
    '@brightsign/deviceinfo': 'commonjs @brightsign/deviceinfo',
    '@brightsign/networkconfiguration': 'commonjs @brightsign/networkconfiguration',
    '@brightsign/screenshot': 'commonjs @brightsign/screenshot',
    '@brightsign/registry': 'commonjs @brightsign/registry',
    '@brightsign/videooutput': 'commonjs @brightsign/videooutput',
    '@brightsign/hid': 'commonjs @brightsign/hid'
    // Add other @brightsign/* modules as needed
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|ttf|eot)$/i,
        type: 'asset/resource'
      }
    ]
  }
};
```

### Method 2: Node.js Server Bundle (Only If SPA Routing Needed)

```javascript
// webpack.server.config.js - Only needed for SPA with client-side routing
const path = require('path');

module.exports = {
  entry: './server.js',
  output: {
    filename: 'server.bundle.js',
    path: path.resolve(__dirname),
    libraryTarget: 'commonjs2'
  },
  target: 'node',
  mode: 'production',

  externals: {
    '@brightsign/deviceinfo': 'commonjs @brightsign/deviceinfo'
    // Add other @brightsign/* modules used in server code
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
```

---

## autorun.brs Templates

### Method 1: Static Flutter Web (HTML renderer - Recommended)

```brightscript
' autorun.brs - Flutter Web adaptation using HTML renderer
' Use this for most Flutter Web adaptations
Sub Main()
    msgPort = CreateObject("roMessagePort")

    ' Use Chromium media player for full web API support (Series 5 onwards only)
    ' See ../media-player-selection.md if you need Series 4 support, HDMI input,
    ' sync, UDP/RTP, or chroma key
    registrySection = CreateObject("roRegistrySection", "html")
    registrySection.Write("use-brightsign-media-player", "0")
    registrySection.Flush()

    htmlRect = CreateObject("roRectangle", 0, 0, 1920, 1080)
    htmlConfig = {
        url: "file:///sd:/index.html",
        port: msgPort,
        inspector_server: { port: 2999 }
    }
    html = CreateObject("roHtmlWidget", htmlRect, htmlConfig)
    html.Show()

    while true
        msg = wait(0, msgPort)
    end while
End Sub
```

### Method 1: Static Flutter Web (CanvasKit renderer - Only if required)

```brightscript
' autorun.brs - Flutter Web adaptation using CanvasKit renderer
' CanvasKit requires more memory and loads slower. Use HTML renderer if possible.
Sub Main()
    msgPort = CreateObject("roMessagePort")

    ' Use Chromium media player for full web API support (Series 5 onwards only)
    ' See ../media-player-selection.md if you need Series 4 support, HDMI input,
    ' sync, UDP/RTP, or chroma key
    registrySection = CreateObject("roRegistrySection", "html")
    registrySection.Write("use-brightsign-media-player", "0")
    registrySection.Flush()

    ' CanvasKit needs more GPU memory allocation
    htmlRect = CreateObject("roRectangle", 0, 0, 1920, 1080)
    htmlConfig = {
        url: "file:///sd:/index.html",
        port: msgPort,
        inspector_server: { port: 2999 },
        javascript_enabled: true
    }
    html = CreateObject("roHtmlWidget", htmlRect, htmlConfig)
    html.Show()

    while true
        msg = wait(0, msgPort)
    end while
End Sub
```

### Method 2: Fresh Rebuild - Static HTML

```brightscript
' autorun.brs - Fresh HTML/JS rebuild, static deployment
Sub Main()
    msgPort = CreateObject("roMessagePort")

    ' Use Chromium media player for full web API support (Series 5 onwards only)
    ' See ../media-player-selection.md if you need Series 4 support, HDMI input,
    ' sync, UDP/RTP, or chroma key
    registrySection = CreateObject("roRegistrySection", "html")
    registrySection.Write("use-brightsign-media-player", "0")
    registrySection.Flush()

    htmlRect = CreateObject("roRectangle", 0, 0, 1920, 1080)
    htmlConfig = {
        url: "file:///sd:/index.html",
        port: msgPort,
        inspector_server: { port: 2999 }
    }
    html = CreateObject("roHtmlWidget", htmlRect, htmlConfig)
    html.Show()

    while true
        msg = wait(0, msgPort)
    end while
End Sub
```

### Method 2: Fresh Rebuild - Node.js Server (Only for SPA Routing)

```brightscript
' autorun.brs - Fresh rebuild with Node.js server for SPA routing
' Use ONLY if app has client-side routing
Sub Main()
    msgPort = CreateObject("roMessagePort")

    ' Use Chromium media player for full web API support (Series 5 onwards only)
    ' See ../media-player-selection.md if you need Series 4 support, HDMI input,
    ' sync, UDP/RTP, or chroma key
    registrySection = CreateObject("roRegistrySection", "html")
    registrySection.Write("use-brightsign-media-player", "0")
    registrySection.Flush()

    node = CreateObject("roNodeJs", "server.bundle.js", {message_port: msgPort})
    sleep(3000)

    htmlRect = CreateObject("roRectangle", 0, 0, 1920, 1080)
    htmlConfig = {
        nodejs_enabled: true,
        url: "http://localhost:8080",
        port: msgPort,
        inspector_server: { port: 2999 }
    }
    html = CreateObject("roHtmlWidget", htmlRect, htmlConfig)
    html.Show()

    while true
        msg = wait(0, msgPort)
    end while
End Sub
```

---

## SD Card Structure

### Method 1: Flutter Web Adaptation

```
SD_CARD/
├── autorun.brs             # BrightSign launcher
├── index.html              # Flutter entry point (adapted)
├── main.dart.js            # Compiled Dart code
├── flutter.js              # Flutter engine loader
├── flutter_bootstrap.js    # Initialization (service worker removed)
├── canvaskit/              # ONLY if CanvasKit renderer (prefer HTML renderer)
│   ├── canvaskit.js        # WASM path patched to local
│   └── canvaskit.wasm
└── assets/
    ├── AssetManifest.json
    ├── FontManifest.json
    └── fonts/
```

### Method 2: Fresh Rebuild - Static

```
SD_CARD/
├── autorun.brs             # BrightSign launcher
├── index.html              # Entry point
├── bundle.js               # All client code bundled
├── styles.css              # (if not inlined in bundle.js)
└── assets/
    ├── images/
    └── fonts/
```

### Method 2: Fresh Rebuild - Node.js Server

```
SD_CARD/
├── autorun.brs             # BrightSign launcher (Node.js version)
├── server.bundle.js        # Express server bundled
└── dist/
    ├── index.html
    ├── bundle.js
    └── assets/
```

---

## Validation Framework

```json
{
  "pre_migration_checks": [
    "Flutter Web build exists at build/web/ or can be generated with flutter build web",
    "Identify renderer: check for canvaskit/ directory",
    "List all plugins used: check pubspec.yaml dependencies",
    "Identify plugins with web support vs. plugins without web support",
    "Identify any CDN font or asset references in index.html",
    "Confirm target BrightSign model (Series 4 or Series 5)"
  ],
  "compilation_checks": [
    "No build errors from flutter build web (if rebuilding)",
    "All files present in build/web/ output",
    "webpack build succeeds with no errors (if webpack was added)",
    "No missing module errors in bundle output"
  ],
  "runtime_checks": [
    "No console errors on BrightSign remote debugger (port 2999)",
    "Flutter engine initializes within 10 seconds",
    "No CORS errors (all assets are local)",
    "No CDN requests timing out (all external URLs removed)",
    "Fonts render correctly (no missing font fallback)",
    "Video plays at expected resolution and framerate"
  ],
  "brightsign_specific_checks": [
    "autorun.brs launches roHtmlWidget without errors",
    "inspector_server accessible on port 2999 for debugging",
    "No service worker registration attempts in console",
    "CanvasKit WASM loads from local path (not CDN) if CanvasKit used",
    "App displays at correct 1920x1080 resolution",
    "Video playback uses HTML5 <video> element (not Flash or other)",
    "Memory usage stable over 30 minutes (no growing leak)",
    "@brightsign/* modules load correctly if used in Method 2"
  ]
}
```

---

## Common Pitfalls and Solutions

```json
{
  "common_pitfalls": [
    {
      "pitfall": "CanvasKit WASM fails to load",
      "symptom": "Blank screen or 'Failed to load canvaskit.wasm' in console",
      "cause": "Default CDN URL in canvaskit.js not accessible on BrightSign",
      "solution": "Patch canvaskit.js to use local relative path. Or switch to HTML renderer."
    },
    {
      "pitfall": "Service worker registration fails",
      "symptom": "Console error: 'Service worker not supported' or silent failure",
      "cause": "BrightSign Chromium does not support service workers",
      "solution": "Remove all service worker registration code from flutter_bootstrap.js"
    },
    {
      "pitfall": "Google Fonts fail to load",
      "symptom": "Text renders in fallback font, console shows failed network requests",
      "cause": "BrightSign player has no internet access to fonts.googleapis.com",
      "solution": "Remove CDN font links. Use fonts bundled in assets/fonts/ instead."
    },
    {
      "pitfall": "Video hidden behind CanvasKit canvas",
      "symptom": "Video plays (audio works) but video frame is invisible",
      "cause": "Canvas element covers the HTML5 video element in z-order",
      "solution": "Apply Flutter platform view CSS fix: .flt-platform-view { position: absolute; z-index: 10; }. The HTML renderer no longer exists in Flutter 3.29+."
    },
    {
      "pitfall": "App freezes after 30+ minutes of operation",
      "symptom": "UI becomes unresponsive, BrightSign player requires power cycle",
      "cause": "Memory leak in CanvasKit or Flutter animation loop",
      "solution": "Consider Method 2 (fresh rebuild in plain HTML/JS) if long-running stability is critical. The HTML renderer no longer exists in Flutter 3.29+. Add an auto-refresh every 24 hours as a safety net for Method 1 deployments."
    },
    {
      "pitfall": "Assets fail to load at runtime",
      "symptom": "Images missing, icons blank",
      "cause": "base href or publicPath not matching SD card structure",
      "solution": "Ensure <base href='/'> in index.html. Verify SD card root has all asset dirs."
    },
    {
      "pitfall": "Flutter plugin uses platform channels with no web impl",
      "symptom": "MissingPluginException in browser console",
      "cause": "Plugin (e.g., sqflite, path_provider) has no web implementation",
      "solution": "Replace plugin usage with web-compatible alternative or remove if unused in signage context"
    },
    {
      "pitfall": "App loads but keyboard/touch input is captured by BrightSign OS",
      "symptom": "Input events do not reach the Flutter app",
      "cause": "BrightSign input routing configuration",
      "solution": "Configure roHtmlWidget input_port or use BrightSign keyboard event passthrough"
    },
    {
      "pitfall": "Dart null safety errors compiled to JS throw at runtime",
      "symptom": "TypeError: Cannot read property of null in console",
      "cause": "Null safety violations not caught at compile time in web mode",
      "solution": "Add null checks around network responses and optional widget data. Test with actual data."
    },
    {
      "pitfall": "@brightsign/* modules not found in Method 2 client code",
      "symptom": "Module not found: @brightsign/deviceinfo",
      "cause": "@brightsign/* modules are Node.js modules, not browser modules",
      "solution": "Mark all @brightsign/* imports as externals in webpack config. Use commonjs externals pattern."
    }
  ]
}
```

---

## AI Automation Instructions

```json
{
  "ai_automation_phases": {
    "phase_1_analysis": {
      "description": "Analyze the Flutter source and build output",
      "steps": [
        "Read pubspec.yaml to identify all dependencies",
        "Check build/web/ directory structure",
        "Identify renderer (CanvasKit vs HTML) from presence of canvaskit/ dir",
        "Scan index.html for CDN font or asset references",
        "Scan flutter_bootstrap.js for service worker registration",
        "List plugins that lack web support",
        "Flag any video_player usage for z-index handling"
      ],
      "output": "Analysis report: renderer type, CDN refs, service worker presence, plugin compatibility"
    },
    "phase_2_transformation": {
      "description": "Apply transformation rules to the Flutter Web output",
      "steps": [
        "Apply Rule 1: Remove service worker from flutter_bootstrap.js",
        "Apply Rule 2: Patch CanvasKit WASM path (if CanvasKit build)",
        "Apply Rule 3: Remove CDN font links from index.html",
        "Apply Rule 4: Update viewport and body dimensions in index.html",
        "Apply Rule 5: Fix video z-index (if video_player with CanvasKit)",
        "Add BrightSign signage CSS: overflow hidden, black background, fixed dimensions"
      ],
      "output": "Modified build/web/ files ready for BrightSign"
    },
    "phase_3_deployment_generation": {
      "description": "Generate BrightSign deployment files",
      "steps": [
        "Generate autorun.brs (static HTML version for Method 1)",
        "Generate SD_CARD_STRUCTURE.md",
        "Verify no CDN URLs remain in any file",
        "Verify no service worker registration remains"
      ],
      "output": "autorun.brs and deployment documentation"
    },
    "phase_4_validation": {
      "description": "Run validation checks before packaging",
      "steps": [
        "Run all pre_migration_checks",
        "Run all compilation_checks",
        "Document any items requiring manual verification (runtime and BrightSign-specific checks)",
        "List any pitfalls detected during analysis"
      ],
      "output": "Validation report with pass/fail per check"
    }
  }
}
```

---

## Plugin Compatibility Reference

```json
{
  "plugin_compatibility": {
    "fully_compatible_web": [
      "http",
      "dio",
      "shared_preferences",
      "video_player",
      "url_launcher",
      "intl",
      "provider",
      "riverpod",
      "flutter_bloc",
      "go_router",
      "auto_route",
      "cached_network_image",
      "flutter_svg",
      "google_fonts"
    ],
    "partial_web_support": [
      {
        "package": "image_picker",
        "notes": "Web version prompts file picker. Not useful for digital signage. Remove."
      },
      {
        "package": "camera",
        "notes": "Uses navigator.mediaDevices. Works if camera hardware is present."
      },
      {
        "package": "file_picker",
        "notes": "Web version uses browser file picker. Not useful for signage. Remove."
      }
    ],
    "no_web_support": [
      "sqflite",
      "path_provider",
      "flutter_blue_plus",
      "wifi_iot",
      "permission_handler",
      "local_auth",
      "flutter_secure_storage",
      "open_file"
    ],
    "action_for_incompatible": "Replace with web-compatible alternative from package_mappings or remove if feature is not needed in signage context."
  }
}
```
