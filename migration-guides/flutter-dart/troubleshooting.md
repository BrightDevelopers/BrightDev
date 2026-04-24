# Troubleshooting Flutter/Dart to BrightSign Migration

[Back to Main Guide](README.md) | [Method 1](method1-flutter-web.md) | [Method 2](method2-fresh-rebuild.md)

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

Since the HTML renderer no longer exists in Flutter 3.29+, you cannot opt out of CanvasKit. For static or low-animation signage, this is the main argument for Method 2 (fresh rebuild) if you hit performance issues. A plain HTML/CSS page does not have a rendering loop. For most signage apps, CanvasKit on Series 5 is fine. Test extended runs (several hours) on actual hardware to confirm stability.

### Video Playback and Overlays

Flutter's `video_player` package on web uses an HTML5 `<video>` element under the hood. This works on BrightSign.

The complication is z-index and layering. Since all Flutter Web builds now use CanvasKit, Flutter renders everything to a canvas element. HTML5 `<video>` elements sit in normal document flow. Getting Flutter widgets to appear over video requires careful z-index management in the adapted HTML.

If your app does not overlay Flutter UI on top of video, this is a non-issue. If it does, the adaptation prompt applies the necessary CSS fix automatically.

For signage apps that need precise video playback control (pausing on exact frames, hardware-accelerated decoding, zone-based video), Method 2 (fresh rebuild) is worth considering. HTML5 video in Flutter Web works, but it does not give you access to BrightSign's VideoOutput API.

---

## Common Issues

**App loads but shows a blank screen**: Check the browser console via Chrome DevTools (connect to `[DEVICE_IP]:2999`). Look for 404 errors on `main.dart.js` or `flutter.js`. This usually means a file is missing from the SD card or a relative path is wrong.

**CanvasKit fails to load**: The WASM file path is wrong or the CDN fallback is firing. Check that `canvaskit/canvaskit.wasm` exists in your SD card structure and that the loader references a local path.

**Fonts render incorrectly**: A font file is missing from the SD card or the path in `FontManifest.json` does not match the actual file location.

**Video does not play**: Check that the video source URL is accessible from the player. For local files, verify the path uses the BrightSign storage path format (`/storage/sd/`). Check that the `<video>` element has the `autoplay` and `muted` attributes if you want it to start automatically.

**App works in Chrome but not on BrightSign**: Usually a web API compatibility issue. BrightSign Chromium is slightly behind the latest Chrome. Check the browser console for specific errors.

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

## Chromium vs BrightSign Media Player

See [Media Player Selection](../media-player-selection.md) for guidance on when to use Chromium (the default) vs the BrightSign media player, and how to switch.

---

## Dart-to-JavaScript Gotchas (Method 2)

**Streams require a different mental model.** Flutter apps use Streams heavily for reactive UI updates. JavaScript has no equivalent of Dart's built-in stream infrastructure. The AI will convert `StreamController` to `EventEmitter` and `StreamBuilder` to manual event listener patterns. Review these conversions carefully. They usually work, but the error handling path is different.

**Null safety does not carry over.** Dart's null safety is enforced at compile time. JavaScript has no such guarantee. After conversion, add defensive checks where null values would cause runtime errors. The AI will note where `!` (force unwrap) was used in Dart. Those are the highest-risk spots.

**Dart `late` initialization has no direct equivalent.** Variables marked `late` in Dart are guaranteed to be set before first use. JavaScript has no such guarantee. The AI converts these to regular properties but you should verify initialization order in the output.

**Extension methods become utility functions.** Dart extension methods add behavior to existing types cleanly. In JavaScript, prefer standalone utility functions over prototype mutation. The AI will extract extensions into utility files.
