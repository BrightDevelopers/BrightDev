# Method 1: Flutter Web to BrightSign Adaptation

[Back to Main Guide](README.md)

You already did the hard work. Your Flutter app runs. The `flutter build web` command produced a `build/web/` directory. Method 1 takes that output and makes it work on a BrightSign player.

This is not a rewrite. It is an adaptation. The code stays Flutter. The logic stays Dart-compiled. You are adjusting the edges: how the app launches, how fonts load, how video plays, what gets stripped out. The AI handles most of this automatically.

**Best for**: Existing Flutter Web apps that you want running on BrightSign with minimal changes
**Target platform**: BrightSign Chromium (Series 4 and Series 5)

Before using the prompt below:
- Ensure the [BrightDeveloper MCP server](https://github.com/BrightDevelopers/BrightDev/blob/main/README.md#install-the-brightsign-mcp-server) is connected
- Have your Flutter project accessible in the workspace (either source or `build/web/` output)

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

### The Renderer Situation

Flutter used to offer two web renderers: CanvasKit and HTML. That choice no longer exists.

Flutter 3.22 deprecated the HTML renderer. Flutter 3.29 removed it entirely. All Flutter Web builds now use CanvasKit - a WebGL and WebAssembly rendering engine. If you are on a modern Flutter version, `flutter build web` is all you need. The `--web-renderer` flag does not exist anymore.

**What this means for BrightSign**: CanvasKit works on BrightSign Series 5. The player's Chromium runtime supports WebGL and WebAssembly. The main adaptation requirement is ensuring the CanvasKit WASM binary loads from the SD card rather than falling back to a CDN - BrightSign players may not have internet access, and even if they do, you do not want your signage app blocked on a network fetch at startup.

The prompt template below handles this automatically.

---

## What Success Looks Like

When this process completes, your project will have a new `brightsign/` folder sitting alongside your existing `build/` directory:

```
your-flutter-app/
├── lib/
├── pubspec.yaml
├── build/
│   └── web/                  # original Flutter Web output, untouched
└── brightsign/               # NEW - everything that goes on the SD card
    ├── autorun.brs
    ├── index.html
    ├── main.dart.js
    ├── flutter.js
    ├── flutter_bootstrap.js
    ├── canvaskit/             # only if CanvasKit renderer was used
    └── assets/
```

The `brightsign/` folder is the SD card. Copy its contents to the root of a FAT32-formatted SD card, insert into the player, and reboot. Nothing else is needed.

The original `build/web/` directory is never modified. You keep your normal Flutter Web output intact.

---

## The AI Migration Prompt

**This single prompt automates the entire adaptation process. No placeholders to fill in - paste it as-is:**

```
Fetch and internalize the automation patterns at https://raw.githubusercontent.com/BrightDevelopers/BrightDev/main/migration-guides/flutter-dart/CLAUDE.md before doing anything else.
If the URL is not yet live, check for a local copy at ../BrightDev/migration-guides/flutter-dart/CLAUDE.md relative to the project root.

Your task is to adapt the Flutter Web app in this workspace for deployment on a BrightSign Series 5 digital signage player using Method 1 (Flutter Web Adaptation). Work autonomously,
discover everything you need by reading the codebase.

Success condition: create a brightsign/ folder at the project root containing everything needed for an SD card deployment in the exact structure required. The brightsign/ folder IS
the SD card: its contents are copied directly to the card root, the player is inserted and rebooted, and the app runs. The build/web/ directory must not be modified during the copy
and transformation steps (Phases 2-4). A fresh flutter build web in Phase 1 is expected and allowed, as it produces the clean baseline.

Phase 1 - Discover the project

- Check whether pubspec.yaml exists in the current directory (do NOT search parent directories, subdirectories, or anywhere else in the workspace)
  - If it does not exist, stop immediately and output only this message: "No pubspec.yaml found in the current directory. Please open a terminal, cd into your Flutter project root,
and run this prompt again from there." Do not proceed further.
  - If it exists, treat the current directory as the project root
- Read pubspec.yaml to determine the app name and all dependencies
- Run flutter --version to determine the Flutter SDK version
- Check whether build/web/ exists under the project root
  - If it does not exist, run flutter build web to generate it
  - If it exists, use it as-is
- Check for a canvaskit/ subdirectory in build/web/ to determine the renderer in use. Note: Flutter 3.22+ removed the --web-renderer html flag. If the current Flutter SDK does not
support --web-renderer, do NOT attempt to switch renderers. Work with whatever renderer the build produced. Modern Flutter builds may include multiple renderer variants in canvaskit/
(canvaskit, skwasm, skwasm_heavy, wimp). This is normal. The build config in flutter_bootstrap.js determines which one is loaded at runtime. Keep all variants unless SD card space is
a concern.
- If CanvasKit is present, check the build config in flutter_bootstrap.js for useLocalCanvasKit. If true, the WASM already loads locally. If false or absent, patching is required.
- Scan index.html and flutter_bootstrap.js for: service worker registration, CDN font references, CDN asset references
- Scan pubspec.yaml dependencies against the plugin compatibility list in CLAUDE.md and flag any packages with no web support
- Search source files for: VideoPlayerController or video_player usage, @brightsign imports, Navigator.push or GoRoute definitions, http/dio API calls

Phase 2 - Build the brightsign/ output folder

- Create a brightsign/ directory at the project root (alongside build/)
- Copy the entire contents of build/web/ into brightsign/. Do not modify build/web/ at any point from here forward.
- Do NOT modify main.dart.js or any file under assets/ or canvaskit/. These are sealed build artifacts. CanvasKit loads text fonts (Roboto) from fonts.gstatic.com at runtime. On an
offline player the request times out and system fonts are used as fallback. Replacing the URL with a local path breaks text rendering because the font files are not bundled locally.
- In brightsign/, apply the following transformations to the wrapper/loader files only:
  - In flutter_bootstrap.js: find the _flutter.loader.load({...}) call and replace it with _flutter.loader.load({}) to remove the serviceWorkerSettings parameter. The service worker
class code will remain as dead code but is never invoked without settings.
  - In index.html: remove any <link> or <script> tags referencing flutter_service_worker.js (if present)
  - Delete the flutter_service_worker.js file from brightsign/
  - Remove CDN font <link> tags from index.html only (if present). Do NOT search or modify main.dart.js for font URLs.
  - Remove PWA manifest references from index.html and delete manifest.json
  - Delete build artifacts not needed at runtime: .last_build_id
  - Update viewport meta tag to: width=1920, height=1080, initial-scale=1
  - Add to body CSS: html, body { width:1920px; height:1080px; margin:0; padding:0; overflow:hidden; background:#000; }
  - If CanvasKit renderer: patch the CanvasKit base URL resolver in BOTH flutter_bootstrap.js AND flutter.js to remove the CDN fallback (https://www.gstatic.com/flutter-canvaskit).
The function to patch is the one that checks useLocalCanvasKit and falls back to a gstatic.com URL. Replace it to always return the local "canvaskit" path.
  - If video_player with CanvasKit: add z-index CSS fix: .flt-platform-view { position: absolute; z-index: 10; }
  - Optionally note that .symbols files in canvaskit/ are debug symbols and can be removed to save ~5MB of SD card space if not needed for debugging

Phase 3 - Add deployment files to brightsign/

- Write autorun.brs into brightsign/ using the appropriate template from CLAUDE.md (static HTML for most apps, Node.js server only if SPA routing is required)
- Create an empty brightsign-dumps/ directory inside brightsign/ with a .gitkeep file. This gives the player a writable location for crash logs.
- If BrightSign device APIs were found in the source: write webpack.config.js into the project root with @brightsign/* marked as CommonJS externals

Phase 4 - Validate

- Confirm no CDN infrastructure URLs remain in index.html, flutter_bootstrap.js, or flutter.js (gstatic.com, fonts.googleapis.com, cloudflare CDN, unpkg.com). Do not scan main.dart.js
  or canvaskit/*.js for this check, as those are sealed artifacts. App-level content URLs (API endpoints, video stream URLs defined in the source code) are expected and should be noted
  but not treated as failures.
- Confirm no service worker registration is active in brightsign/ (dead code in class definitions is acceptable if the load call passes no settings)
- Confirm all asset paths are relative (no absolute /storage/ paths in the HTML)
- Confirm build/web/ is identical to its state before Phase 2 began (untouched)
- Run through the brightsign_specific_checks list from CLAUDE.md and report pass/fail for each item that can be verified statically

Phase 5 - Generate build script

- Write a build-brightsign.js (Node.js) script at the project root that automates Phases 1-4 in a single node build-brightsign.js command. This allows the developer to regenerate
brightsign/ after any code change without re-running this prompt. The script must apply every transformation from Phase 2, write deployment files from Phase 3, and run validation from
  Phase 4.

Output

1. A summary of what was discovered in Phase 1 (renderer, packages flagged, features detected)
2. The complete file tree of the brightsign/ folder that was created
3. A list of every transformation applied in Phase 2 with a one-line description of each change
4. The content of brightsign/autorun.brs
5. The webpack.config.js if applicable
6. The Phase 4 validation report
7. Copy instructions: exactly what to copy to the SD card, how to boot the player, and a note that Chromium remote debugging must be enabled via autorun.brs or the local DWS
(Diagnostic Web Server) before the inspector port is accessible
```

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

Since the HTML renderer no longer exists in Flutter 3.29+, you cannot opt out of CanvasKit. For static or low-animation signage, this is the main argument for Method 2 (fresh rebuild) if you hit performance issues - a plain HTML/CSS page does not have a rendering loop. For most signage apps, CanvasKit on Series 5 is fine. Test extended runs (several hours) on actual hardware to confirm stability.

### Video Playback and Overlays

Flutter's `video_player` package on web uses an HTML5 `<video>` element under the hood. This works on BrightSign.

The complication is z-index and layering. Since all Flutter Web builds now use CanvasKit, Flutter renders everything to a canvas element. HTML5 `<video>` elements sit in normal document flow - they are HTML, not canvas pixels. Getting Flutter widgets to appear over video requires careful z-index management in the adapted HTML.

If your app does not overlay Flutter UI on top of video (for example, if video plays in a separate section from the main UI), this is a non-issue. If it does, the adaptation prompt applies the necessary CSS fix automatically.

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
