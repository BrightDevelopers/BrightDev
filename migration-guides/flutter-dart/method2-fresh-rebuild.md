# Method 2: Fresh HTML/JS/Node.js Rebuild

[Back to Main Guide](README.md)

Sometimes the best path forward is a clean slate. You take what your Flutter app does, not how it does it, and rebuild it in the native language of the web. No Dart compiler, no Flutter engine, no CanvasKit. Just HTML, JavaScript, and Node.js running directly on BrightSign.

This is the harder path upfront. It is the easier path for everything that comes after.

- **Best for**: Performance-critical signage, apps that need BrightSign device APIs, long-term maintainable deployments
- **Target platform**: BrightSign OS (Node.js v18.18.2 + Chromium)

---

## When a Fresh Rebuild Makes Sense

Flutter Web is a reasonable first choice. But there are situations where carrying the Flutter/Dart runtime into BrightSign creates more problems than it solves.

**Choose Method 2 if any of these apply:**

- Your signage loop needs to run for days or weeks without a restart. Flutter Web's CanvasKit renderer redraws constantly. A plain HTML/CSS layout does not.
- You need BrightSign device APIs: serial ports, GPIO pins, video output zones, device info. Flutter Web cannot call `@brightsign/*` Node.js modules. A fresh rebuild can.
- Your Flutter app is heavily dependent on packages that do not work on the web (sqflite, flutter_blue_plus, path_provider). Stripping those out and rebuilding the web layer is effectively the same work as rebuilding, but with more constraints.
- You want someone to be able to maintain this in two years without knowing Flutter. Plain JavaScript has no runway dependency.

If none of those apply and your Flutter Web build works today, Method 1 is probably fine. No need to over-engineer.

---

## What Success Looks Like

When this process completes, your project will have a `brightsign/` folder containing everything needed for SD card deployment:

```
your-flutter-app/
├── lib/
├── pubspec.yaml
├── src/                      # rebuilt HTML/JS source files
├── package.json
├── webpack.config.js
├── dist/                     # webpack build output
└── brightsign/               # NEW - everything that goes on the SD card
    ├── autorun.brs
    ├── index.html
    ├── bundle.js
    └── assets/
```

The `brightsign/` folder is the SD card. Copy its contents to the root of a FAT32-formatted SD card, insert into the player, and reboot. Nothing else is needed.

---

## AI-First Migration with BrightDeveloper MCP

Before using the prompt below:
- Ensure the [BrightDeveloper MCP server](https://github.com/BrightDevelopers/BrightDev/blob/main/README.md#install-the-brightsign-mcp-server) is connected
- Have your Flutter/Dart source code accessible in the workspace
- Attach the [CLAUDE.md](CLAUDE.md) file to the AI context for transformation patterns
- Know which BrightSign device APIs your app needs (serial, GPIO, video output, etc.)

**This single prompt automates the entire rebuild process:**

```
First, read and analyze the automation patterns at migration-guides/flutter-dart/CLAUDE.md.

I need you to rebuild my Flutter/Dart application in HTML/JavaScript/Node.js for BrightSign using Method 2 (Fresh Rebuild).

Success condition: Create a brightsign/ folder at the project root containing
everything needed for an SD card deployment. The brightsign/ folder IS the SD card:
- Copy its contents directly to the card root
- Insert the card into the player and reboot
- The app runs

Project Details:
- Flutter Project Path: {YOUR_FLUTTER_PROJECT_PATH}
- App Name: {YOUR_APP_NAME}
- Flutter Version: {FLUTTER_VERSION from flutter --version}
- Target BrightSign Model: {e.g., XT1144, HD1024, or "Series 5"}
- Team JavaScript Expertise: {e.g., "Moderate JavaScript, no Node.js experience"}

What the App Does:
- Number of screens/pages: {COUNT}
- What it displays: {DESCRIBE the signage content, e.g., "rotating product promotions with live pricing from REST API"}
- Screen layout: {DESCRIBE the layout, e.g., "full-screen video with text overlay panel on the left"}
- Data sources: {DESCRIBE how data enters the app, e.g., "REST API polled every 30 seconds"}

Flutter Packages Used (paste from pubspec.yaml):
{PASTE YOUR DEPENDENCIES SECTION HERE}

BrightSign Device APIs Needed:
- [ ] Device info (model, serial number, firmware version)
- [ ] Video output control (advanced playback, zones)
- [ ] Network configuration
- [ ] Serial port communication
- [ ] GPIO input/output
- [ ] Screenshot capture
- [ ] Other: {SPECIFY}

Rebuild Tasks:
1. Analyze the Flutter/Dart source code
   - Extract the complete feature inventory: screens, data flows, business logic
   - Map all Flutter packages to their JavaScript/npm equivalents
   - Identify which Dart patterns need translation (streams, futures, null safety)
   - Note any Flutter-specific patterns that require design decisions in JavaScript

2. Set up the BrightSign project structure
   - Create package.json with all required dependencies
   - Configure webpack with BrightSign API externals (CommonJS format)
   - Set up development mocks for @brightsign/* modules
   - Create src/ui/, src/backend/ (if needed), src/utils/ directory structure

3. Rebuild each screen as HTML/CSS/JavaScript
   - Convert Flutter widgets to HTML/CSS equivalents (see mapping table in CLAUDE.md)
   - Preserve the visual layout and design intent
   - Use CSS flexbox/grid to replace Column/Row/Stack layouts
   - Create JavaScript modules for each screen's logic

4. Rebuild the data layer
   - Convert Dart async/await and Streams to JavaScript async/await and EventEmitter
   - Replace http/dio with fetch() API
   - Replace shared_preferences with localStorage
   - Replace any sqflite usage with IndexedDB or Node.js SQLite

5. Integrate BrightSign device APIs
   - Create a BrightSignPlatform abstraction class using synchronous initialization
   - Implement @brightsign/* modules using CommonJS require() pattern
   - Create development mocks matching the same interface

6. Handle video playback
   - Replace video_player with HTML5 <video> elements for simple playback
   - For advanced control (zones, hardware decode), use @brightsign/videooutput

7. Create the launcher
   - Generate autorun.brs with nodejs_enabled: true
   - Configure inspector_server on port 2999 for remote debugging
   - Set window rectangle to 0, 0, 1920, 1080 (or your target resolution)

8. Package for deployment
   - Configure webpack to output directly to brightsign/ (no intermediate dist/ copy step)
   - Add autorun.brs at the brightsign/ root
   - The brightsign/ folder must be self-contained: copying it to an SD card root and rebooting the player is all that is needed to run the app
   - List any media assets that must also be placed in brightsign/ before deployment

Code Quality Requirements:
- Use modern ES6+ JavaScript with async/await throughout
- Create a BrightSignPlatform class that initializes synchronously using require()
- All @brightsign/* modules use CommonJS externals in webpack config
- Add console logging sufficient to debug issues via Chrome DevTools on port 2999
- Keep each module focused: one file per screen or feature

Output Deliverables:
1. Complete HTML/JavaScript source files for each screen
2. package.json with all dependencies
3. webpack.config.js configured for BrightSign deployment
4. A populated brightsign/ folder at the project root containing the complete SD card contents
5. The complete file tree of the brightsign/ folder
6. The content of brightsign/autorun.brs
7. Copy instructions: exactly what to copy to the SD card and how to boot the player
8. Dart-to-JavaScript translation notes for any non-obvious conversions
9. Testing checklist for BrightSign deployment

Follow all transformation patterns from CLAUDE.md, including:
- Synchronous BrightSign API initialization with require()
- CommonJS externals format for webpack
- Development mock structure
```

---

## Customization Guide

**Replace the following placeholders in the prompt:**

| Placeholder | Example | Description |
|------------|---------|-------------|
| `{YOUR_FLUTTER_PROJECT_PATH}` | `/home/dev/my_flutter_app` | Absolute path to your Flutter project root |
| `{YOUR_APP_NAME}` | `RetailSignage` | Your Flutter app name |
| `{FLUTTER_VERSION}` | `3.19.0` | From running `flutter --version` |
| `{COUNT}` | `3` | Number of screens or routes in your app |
| `{DESCRIBE the signage content}` | `Rotating product promotions with live pricing from REST API` | What your app displays |
| `{PASTE YOUR DEPENDENCIES SECTION HERE}` | Contents of `dependencies:` in pubspec.yaml | Lets AI map Flutter packages to npm equivalents |

**Checkbox instructions**: Mark `[x]` for BrightSign device APIs your app needs, leave `[ ]` for those it does not.

---

## Dart-to-JavaScript Pattern Mapping

When the AI translates your Dart code, these are the patterns it applies. Understanding them helps you review the output.

| Dart Pattern | JavaScript Equivalent | Notes |
|---|---|---|
| `class Foo { final String bar; }` | `class Foo { constructor(bar) { this.bar = bar; } }` | Dart classes map cleanly to JS classes |
| `data class` (with `==` and `hashCode`) | Plain object or class with manual equality | JS has no built-in value equality |
| `async/await` on Futures | `async/await` on Promises | Nearly identical syntax |
| `Stream<T>` and `StreamController` | `EventEmitter` or `ReadableStream` | Node.js EventEmitter is the closest match |
| `StreamBuilder` in Flutter | Event listener + DOM update function | No declarative reactive layer in plain JS |
| `T?` (nullable type) | `T | null | undefined` or optional chaining `?.` | JS has no null safety at compile time |
| `??` (null coalescing) | `??` | Same operator, same behavior in JS |
| `?.` (null-safe member access) | `?.` | Same operator, available in ES2020+ |
| `List<T>` | `Array` | Direct equivalent |
| `Map<K, V>` | `Object` or `Map` | JS `Map` for non-string keys, plain objects otherwise |
| `Set<T>` | `Set` | Direct equivalent |
| `where()` on collections | `.filter()` | Same concept |
| `map()` on collections | `.map()` | Same concept |
| `fold()` on collections | `.reduce()` | Same concept |
| `try { } catch (e) { }` | `try { } catch (e) { }` | Identical syntax |
| `enum Color { red, green }` | `const Color = Object.freeze({ red: 'red', green: 'green' })` | No native enum in JS |
| `extension StringX on String` | Utility function or prototype extension | Prefer utility functions over prototype mutation |
| `mixin Serializable` | Utility functions or class composition | No native mixins in JS |
| `late final` initialization | Class property set in constructor or `initialize()` | No lazy initialization guarantee in JS |
| `factory constructor` | Static factory method: `static create()` | Common pattern in both languages |
| `required` named parameter | Destructuring with validation | No built-in required check in plain JS |
| `const` value | `Object.freeze()` for objects, `const` for primitives | JS `const` only prevents reassignment |

---

## Flutter Widget to HTML/CSS Mapping

Each Flutter widget you used maps to an HTML/CSS equivalent. The AI uses this table to convert your UI layer.

| Flutter Widget | HTML/CSS Equivalent | Notes |
|---|---|---|
| `Scaffold` | `<body>` with a flex column layout | The outer shell of your page |
| `AppBar` | `<header>` with flexbox | Fixed or sticky positioning with CSS |
| `Column` | `<div style="display:flex; flex-direction:column">` | Direct flexbox mapping |
| `Row` | `<div style="display:flex; flex-direction:row">` | Direct flexbox mapping |
| `Stack` | `<div style="position:relative">` with `position:absolute` children | Z-index for layering |
| `Container` | `<div>` with CSS box model properties | Padding, margin, decoration all map to CSS |
| `Expanded` / `Flexible` | `flex: 1` or `flex-grow` CSS property | Same proportional sizing concept |
| `SizedBox` | `<div style="width:Xpx; height:Ypx">` or CSS gap | Fixed spacer |
| `Padding` | `padding` CSS property on the child element | No wrapper needed in HTML |
| `Center` | `display:flex; align-items:center; justify-content:center` | Flexbox centering |
| `Text` | `<p>`, `<span>`, `<h1>` through `<h6>` | Choose by semantic meaning |
| `RichText` | `<span>` elements with inline styles or CSS classes | Mix styles within a paragraph |
| `Image.asset` | `<img src="...">` with local path | Ensure asset is in SD card package |
| `Image.network` | `<img src="...">` with URL | Same behavior |
| `Icon` | SVG inline, icon font, or `<img>` | No built-in icon library on BrightSign |
| `VideoPlayer` | `<video autoplay loop muted>` | HTML5 video is the direct replacement |
| `ListView` | `<div style="overflow-y:auto">` with child items | Simple scrollable container |
| `GridView` | `<div style="display:grid">` with CSS grid template | CSS grid is a direct match |
| `Card` | `<div>` with box-shadow and border-radius CSS | Visual card pattern in CSS |
| `CircularProgressIndicator` | CSS animation or SVG spinner | No built-in loading indicator |
| `LinearProgressIndicator` | `<progress>` element or CSS animation | HTML5 progress element works well |
| `Navigator` (routing) | Page visibility toggle or single-page JS router | Signage apps rarely need full routing |
| `AnimatedContainer` | CSS transitions with `transition` property | CSS handles most simple animations |
| `GestureDetector` | `addEventListener('click', ...)` | Touch events also available |
| `FutureBuilder` | `async function` + DOM update on resolve | Fetch data, then update the DOM |
| `StreamBuilder` | EventEmitter listener + DOM update | Listen for events, then update the DOM |

---

## Flutter Package to npm Package Mapping

| Flutter Package | npm Equivalent | Notes |
|---|---|---|
| `http` | `fetch` (native) | Browser fetch API handles all HTTP methods |
| `dio` | `axios` | `npm install axios` - interceptors, cancellation support |
| `shared_preferences` | `localStorage` (browser) | Synchronous key-value storage built in |
| `video_player` | HTML5 `<video>` element | No package needed - use the element directly |
| `provider` / `riverpod` | Vanilla JS module state or simple pub/sub | Small apps: export a state object. Larger apps: EventEmitter-based pub/sub |
| `get_it` (service locator) | Module-level singleton export | `export const service = new Service();` |
| `flutter_svg` | `<img src="file.svg">` or inline SVG | Browsers render SVG natively |
| `cached_network_image` | Browser cache (automatic) | No package needed - browser caches images by default |
| `intl` | `Intl` (native browser API) | `Intl.DateTimeFormat`, `Intl.NumberFormat` built in |
| `go_router` | Hash routing or History API | Signage apps rarely need this - usually not worth porting |
| `sqflite` | `better-sqlite3` (Node.js) | `npm install better-sqlite3` - synchronous SQLite |
| `isar` / `hive` | IndexedDB or `lowdb` | `npm install lowdb` for simple JSON-file persistence |
| `connectivity_plus` | `navigator.onLine` or fetch error handling | Online status API in browser |
| `path_provider` | Node.js `path` module | `require('path')` - built into Node.js |
| `flutter_secure_storage` | Node.js `keytar` or encrypted file | `npm install keytar` for credential storage |
| `local_auth` | Not applicable for signage | Kiosks rarely need biometric auth |
| `permission_handler` | Not applicable | Browser handles permissions via its own prompts |
| `url_launcher` | `window.open()` or `window.location` | Available in BrightSign Chromium |
| `flutter_local_notifications` | Custom DOM overlay or console.log | No system notification API on BrightSign |
| `audioplayers` | HTML5 `<audio>` element or `@brightsign/audio` | Use `@brightsign/audio` for zone-based audio control |

---

For Dart-to-JavaScript conversion gotchas (streams, null safety, late init, extension methods), see **[Troubleshooting](troubleshooting.md#dart-to-javascript-gotchas-method-2)**.

---

## Next Steps After the Rebuild

1. **Test locally first.** Run `webpack-dev-server` and load the app in Chrome. Confirm all screens render and data loads before touching BrightSign hardware.
2. **Run `npm run build`** to produce the production bundle in `dist/`.
3. **Copy the `brightsign/` folder contents to an SD card.** Everything in `brightsign/` goes to the card root. `autorun.brs` is already there at the top level.
4. **Insert the SD card and reboot.** The player picks up `autorun.brs` on boot and launches the app.
5. **Connect Chrome DevTools.** Open `[DEVICE_IP]:2999` in Chrome to access the remote debugger on the player.
6. **Check the console.** The first boot may surface missing file errors (e.g., 404 on `bundle.js` or assets due to incorrect relative paths). Fix them, update `brightsign/`, and redeploy.
7. **Run for several hours.** Signage apps run continuously. Verify there are no memory leaks or rendering degradations after extended operation.

If you want to compare outputs, [Method 1](method1-flutter-web.md) is faster to get running but carries the Flutter runtime with it. Method 2 takes longer upfront and typically produces a more reliable long-term deployment.
