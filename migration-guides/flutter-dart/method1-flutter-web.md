# Method 1: Flutter Web to BrightSign Adaptation

[Back to Main Guide](README.md)

You already did the hard work. Your Flutter app runs. The `flutter build web` command produced a `build/web/` directory. Method 1 takes that output and makes it work on a BrightSign player.

This is not a rewrite. It is an adaptation. The code stays Flutter. The logic stays Dart-compiled. You are adjusting the edges: how the app launches, how fonts load, how video plays, what gets stripped out. The AI handles most of this automatically.

**Best for**: Existing Flutter Web apps that you want running on BrightSign with minimal changes
**Target platform**: BrightSign Chromium (Series 4 and Series 5)

Before using the prompt below:
- Ensure the [BrightDeveloper MCP server](https://github.com/BrightDevelopers/BrightDev/blob/main/README.md#install-the-brightsign-mcp-server) is connected
- Have your Flutter project accessible in the workspace (either source or `build/web/` output)
- Attach the [CLAUDE.md](CLAUDE.md) file to the AI context for transformation patterns
- Know your target BrightSign model (Series 4 or Series 5) before starting

---

## Understanding What You're Adapting

Before the AI can help, it helps to understand what Flutter Web actually produces. When you run `flutter build web`, you get:

```
build/web/
├── index.html              # Entry point, bootstraps Flutter
├── main.dart.js            # Your compiled Dart code (HTML renderer)
├── flutter.js              # Flutter engine loader
├── flutter_bootstrap.js    # Initialization script
├── canvaskit/              # Present if you used CanvasKit renderer
│   ├── canvaskit.js
│   └── canvaskit.wasm
└── assets/
    ├── AssetManifest.json
    ├── FontManifest.json
    └── fonts/              # Embedded fonts
```

Each of these files plays a role. The AI needs to understand which ones to keep, which to modify, and which to remove.

### Renderer Choice: Make This Decision First

Flutter supports two web renderers. Which one you used changes the adaptation work significantly.

**CanvasKit (default)**: Loads a 2-5 MB WebAssembly binary and uses WebGL to paint the entire UI. The output is pixel-perfect but heavy. The WASM file must load before anything appears on screen.

**HTML renderer**: Uses HTML elements and CSS with a small canvas layer. Lighter, faster initial load, more familiar to the browser. Less pixel-perfect but more than adequate for signage.

If you have not built yet, use the HTML renderer:

```bash
flutter build web --web-renderer html
```

If your `build/web/` already exists and contains a `canvaskit/` folder, you used CanvasKit. You have two options: rebuild with the HTML renderer, or proceed with CanvasKit adaptation (the prompt template handles both).

For most digital signage use cases, the HTML renderer produces a better result on BrightSign. Signage screens are not high-fidelity design canvases. They show content. The HTML renderer is more than good enough, and it loads faster on a device that may restart between content plays.

---

## The AI Migration Prompt

**This single prompt automates the entire adaptation process:**

```
First, read and analyze the automation patterns at migration-guides/flutter-dart/CLAUDE.md.

I need you to adapt my Flutter Web app for deployment on a BrightSign digital signage player using Method 1 (Flutter Web Adaptation).

Project Details:
- Flutter Project Path: {YOUR_FLUTTER_PROJECT_PATH}
- Build Output Path: {YOUR_BUILD_WEB_PATH or "not yet built"}
- Flutter Version: {FLUTTER_VERSION from flutter --version}
- Target BrightSign Model: {e.g., XT1144, HD1024, LS445, or "Series 5 / Series 4"}
- Web Renderer Used: {CanvasKit or HTML or "not yet built"}

App Description:
- App Name: {YOUR_APP_NAME}
- What it displays: {DESCRIBE what the signage screen shows, e.g., "rotating product images with price data from a REST API"}
- Screen layout: {DESCRIBE the layout, e.g., "full-screen video background with overlay text"}
- Number of screens/routes: {COUNT, e.g., "1" or "3 routes"}

Flutter Packages Used (list all from pubspec.yaml):
{PASTE YOUR DEPENDENCIES SECTION HERE}

Platform API Requirements:
- [ ] BrightSign device info (model, serial number)
- [ ] BrightSign video output control (advanced playback)
- [ ] BrightSign network configuration
- [ ] Serial port communication
- [ ] GPIO control
- [ ] Other: {SPECIFY}

Video Playback:
- Videos used: {YES/NO - if yes, describe: local files, URLs, formats, looping behavior}
- Current Flutter video solution: {e.g., video_player package, VideoPlayerController.network}

Network/Data:
- Fetches data from API: {YES/NO - if yes, specify endpoints or describe the data}
- Requires authentication: {YES/NO}
- Offline support needed: {YES/NO}

Migration Tasks:
1. Analyze my Flutter Web build output structure
   - Identify renderer type (CanvasKit or HTML)
   - Map all asset references in index.html and flutter_bootstrap.js
   - Identify any service worker registration code
   - Locate font loading configuration in FontManifest.json

2. Adapt index.html for BrightSign
   - Remove any service worker registration code
   - Remove meta viewport tags that assume a mobile browser
   - Adapt font loading to use local paths (no CDN fonts)
   - Ensure base href is compatible with file:/// loading
   - Remove any PWA manifest references

3. Handle the renderer
   - If CanvasKit: verify canvaskit.wasm is referenced by local path, not CDN
   - If CanvasKit: confirm WebGL is enabled in BrightSign autorun.brs configuration
   - If HTML renderer: no special handling needed beyond standard adaptation

4. Adapt video playback
   - If using video_player package: confirm web implementation uses HTML5 <video>
   - Ensure video elements are fullscreen-compatible
   - Handle BrightSign video overlay considerations (HTML5 video vs. BrightSign hardware video)
   - Add loop, autoplay, muted attributes as appropriate for signage

5. Handle Flutter plugins
   - Identify which packages have web implementations
   - Identify which packages stub out on web (no-op implementations)
   - For packages with no web support: create stub implementations or remove the feature
   - Document any packages that require manual adaptation

6. Create autorun.brs launcher
   - Configure roHtmlWidget for the Flutter Web app
   - Set nodejs_enabled based on whether any BrightSign Node.js APIs are needed
   - Configure inspector_server port 2999 for remote debugging
   - Set appropriate window rectangle (typically 0, 0, 1920, 1080)

7. Create webpack config (if needed for BrightSign API integration)
   - Only required if adding @brightsign/* Node.js APIs to the Flutter app
   - Configure CommonJS externals for all @brightsign/* modules
   - Bundle any BrightSign integration scripts separately

8. Package for SD card deployment
   - Describe the exact SD card file structure
   - Specify where build/web/ contents go on the SD card
   - Include autorun.brs at the SD card root
   - List any additional assets or configuration files needed

9. Document known issues
   - Identify any Flutter Web quirks specific to BrightSign Chromium
   - Note any features that may not work as expected
   - Provide workarounds for identified issues

Output Deliverables:
1. Adapted index.html with BrightSign-specific changes
2. autorun.brs launcher file
3. SD card file structure documentation
4. List of adapted files with explanation of each change
5. Plugin compatibility report (which packages work, which need attention)
6. Testing checklist for BrightSign deployment

Follow all transformation patterns from CLAUDE.md, including:
- CanvasKit vs HTML renderer handling
- Service worker removal
- Font loading adaptation
- Video element configuration

Output a complete, deployable BrightSign package.
```

---

## Customization Guide

**Replace the following placeholders in the prompt:**

| Placeholder | Example | Description |
|------------|---------|-------------|
| `{YOUR_FLUTTER_PROJECT_PATH}` | `/home/dev/my_flutter_app` | Absolute path to your Flutter project root |
| `{YOUR_BUILD_WEB_PATH}` | `/home/dev/my_flutter_app/build/web` | Path to the `build/web/` directory after running `flutter build web` |
| `{FLUTTER_VERSION}` | `3.19.0` | From running `flutter --version` |
| `{e.g., XT1144, HD1024, ...}` | `XT1144` or `Series 5` | Your target BrightSign player model |
| `{CanvasKit or HTML}` | `HTML` | Which renderer you used when building |
| `{YOUR_APP_NAME}` | `RetailSignage` | Your Flutter app name |
| `{DESCRIBE what the signage screen shows}` | `Rotating product promotions with live pricing from REST API` | What your screen displays |
| `{FLUTTER_VERSION from flutter --version}` | `3.19.0` | Your Flutter SDK version |
| `{PASTE YOUR DEPENDENCIES SECTION HERE}` | Contents of `dependencies:` in pubspec.yaml | Lets AI assess plugin compatibility |

**Checkbox instructions**: Mark `[x]` for features your app needs, leave `[ ]` for those it does not.

---

## Known Flutter Web Quirks on BrightSign

These are the issues that come up most often when adapting Flutter Web apps for BrightSign. The AI prompt handles most of them automatically, but knowing what to expect helps you validate the output.

### Font Loading

Flutter Web embeds font files in `assets/fonts/` and references them via `FontManifest.json`. The default behavior in Flutter Web includes a fallback to Google Fonts CDN if local fonts fail to load.

On BrightSign, there is no internet access guarantee during startup. If your app tries to load a font from `fonts.googleapis.com` and the network is slow or unavailable, the app stalls or shows fallback fonts.

The fix is to ensure all fonts load from local paths only. The AI will check your `FontManifest.json` and `index.html` for any CDN font references and remove them.

### Service Workers

Flutter Web registers a service worker by default for PWA (Progressive Web App) offline support. BrightSign does not need this. The service worker registration code in `flutter_bootstrap.js` can cause errors on BrightSign Chromium because the service worker caching API behaves differently.

The AI removes service worker registration from `index.html` and `flutter_bootstrap.js`.

### CanvasKit WASM Loading

If you built with the CanvasKit renderer, Flutter loads `canvaskit.wasm` at startup. By default, Flutter's `canvaskit.js` may try to load the WASM file from a CDN (specifically `https://unpkg.com/canvaskit-wasm/`) if the local path fails.

On BrightSign, you want all files to load locally. The AI patches the CanvasKit loader to use only the local path.

Additionally, CanvasKit requires WebGL. BrightSign Series 4 and Series 5 support WebGL, but the `autorun.brs` must not disable it. The generated autorun.brs will include the correct configuration.

### Canvas Performance

Flutter Web's CanvasKit renderer redraws the canvas on every frame, even when nothing changes. On a BrightSign player running continuously for days or weeks, this constant GPU activity is worth monitoring.

For static or low-animation signage, the HTML renderer avoids this entirely. For animation-heavy signage, CanvasKit is fine but you should test extended runs (several hours) on actual hardware.

### Video Playback and Overlays

Flutter's `video_player` package on web uses an HTML5 `<video>` element under the hood. This works on BrightSign.

The complication is z-index and layering. HTML5 `<video>` elements in Chromium are typically composited separately from the canvas. Depending on your Flutter Web renderer:

- **HTML renderer**: Video elements render in normal document flow. Overlaying Flutter widgets on top of video generally works.
- **CanvasKit renderer**: Flutter renders to a canvas element. Video elements are HTML, not canvas. Getting Flutter widgets to appear over video requires careful z-index management in the adapted HTML.

If your app does not overlay Flutter UI on top of video (for example, if video plays separately from the main UI), this is a non-issue. If it does, the AI will document the overlay strategy and provide the necessary CSS.

For signage apps that need precise video playback control (pausing on exact frames, hardware-accelerated decoding, zone-based video), Method 2 (fresh rebuild) is worth considering. HTML5 video in Flutter Web works, but it does not give you access to BrightSign's VideoOutput API.

---

## Plugin Compatibility Reference

Not all Flutter packages work on the web. Here is how to think about it:

**Works on web as expected**: Packages with a full web implementation. The migration is straightforward.

| Package | Web Status | Notes |
|---------|-----------|-------|
| `video_player` | Works | Uses HTML5 `<video>` on web |
| `http` | Works | Uses `XMLHttpRequest` or `fetch` on web |
| `dio` | Works | Full web support |
| `shared_preferences` | Works | Uses `localStorage` on web |
| `url_launcher` | Works (limited) | `window.open()` on web, less relevant for signage |
| `flutter_svg` | Works | SVG rendering works in browser |
| `cached_network_image` | Works | Browser caching handles this |
| `provider` / `riverpod` | Works | Pure Dart, no platform dependency |
| `go_router` | Works (not needed) | Routing works but signage apps rarely need it |
| `intl` | Works | Pure Dart |

**Stubbed on web (no-op)**: Packages that compile for web but do not do anything useful.

| Package | Web Status | Notes |
|---------|-----------|-------|
| `flutter_local_notifications` | Stub | No system notifications on web |
| `permission_handler` | Stub | Always returns granted on web |
| `camera` | Limited | Web camera works but not relevant for signage |
| `file_picker` | Limited | Uses file input on web |

**Not supported on web**: Packages that will cause build errors or runtime failures.

| Package | Web Status | Notes |
|---------|-----------|-------|
| `sqflite` | Not supported | Use `shared_preferences` or `idb_shim` for web |
| `path_provider` | Partial | `getTemporaryDirectory` not available on web |
| `flutter_blue_plus` | Not supported | Bluetooth not available in browsers |
| `serial_port` / GPIO | Not supported | Use `@brightsign/*` Node.js APIs via Method 2 |

If your app uses packages in the "not supported" list, the AI will flag them and suggest alternatives or workarounds. In some cases, removing the feature is the right call for signage. In others, Method 2 is a better path.

---

## Troubleshooting Common Issues

**App loads but shows a blank screen**: Usually a path issue. Check the browser console via Chrome DevTools (connect to `[DEVICE_IP]:2999`). Look for 404 errors on `main.dart.js` or `flutter.js`.

**CanvasKit fails to load**: The WASM file path is wrong or the CDN fallback is firing. Check that `canvaskit/canvaskit.wasm` exists in your SD card structure and that the loader references a local path.

**Fonts render incorrectly**: A font file is missing from the SD card or the path in `FontManifest.json` does not match the actual file location.

**Video does not play**: Check that the video source URL is accessible from the player. For local files, verify the path uses the BrightSign storage path format (`/storage/sd/`). Check that the `<video>` element has the `autoplay` and `muted` attributes if you want it to start automatically.

**App works in Chrome but not on BrightSign**: Usually a web API compatibility issue. BrightSign Chromium is slightly behind the latest Chrome. Check the browser console for specific errors.

---

## Next Steps After Migration

1. **Test in Chrome first**: Load `index.html` in a desktop Chrome tab from a local server (`python3 -m http.server 8080` or similar). Confirm the app works before deploying to hardware.
2. **Deploy to BrightSign**: Copy the SD card package to your player and power it on.
3. **Connect Chrome DevTools**: Open `[DEVICE_IP]:2999` in Chrome to access the remote debugger.
4. **Check the console**: Look for any errors on first run and address them.
5. **Test extended playback**: Let the player run for several hours and verify stability, especially if your app loops content.
6. **Consider Method 2**: If you hit persistent issues or need BrightSign device APIs that Flutter Web cannot access, [Method 2](method2-fresh-rebuild.md) is the path forward.
