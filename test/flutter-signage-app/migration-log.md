# Migration Log - flutter_signage_app to BrightSign

## BD-007: Method 1 Migration - Flutter Web Adaptation

**Date:** 2026-03-13
**Method:** Method 1 - Flutter Web Adaptation (HTML renderer)
**AI:** Claude (claude-sonnet-4-6) running CLAUDE.md instructions from flutter-dart migration guide

---

### Input Provided

- `CLAUDE.md` from `BrightDev/migration-guides/flutter-dart/CLAUDE.md`
- Simulated `build/web/` output representing `flutter build web --web-renderer html`

**Note on simulated build output:** Flutter SDK is not available in this environment. The `build/web/` directory was created as a realistic simulation based on known Flutter Web HTML renderer output structure. The `main.dart.js` file is a placeholder. To test with a real build, run `flutter build web --web-renderer html` and replace `build/web/main.dart.js` with the actual output.

---

### Migration Process

The AI (this agent) applied CLAUDE.md transformation rules to produce `brightsign-output/`.

#### Step 1: Build Output Analysis

Renderer detection: No `canvaskit/` directory found in `build/web/` - confirmed **HTML renderer** build.

Files analyzed:
- `index.html` - contains `$FLUTTER_BASE_HREF`, `serviceWorkerVersion` script, PWA meta tags
- `flutter_bootstrap.js` - contains `serviceWorkerSettings` block with version check
- `flutter.js` - Flutter engine loader, service worker registration gated by `serviceWorkerSettings` param
- `flutter_service_worker.js` - PWA service worker file
- `main.dart.js` - compiled Dart (placeholder)
- `assets/AssetManifest.json` and `assets/FontManifest.json` - local font only, no Google Fonts CDN references found

#### Step 2: Transformation Rules Applied

**Rule 1: Service Worker Removal**
- `flutter_bootstrap.js`: Removed `serviceWorkerSettings` block entirely from `_flutter.loader.load()` call
- `index.html`: Removed `serviceWorkerVersion` const script block
- `flutter_service_worker.js`: Excluded from output (file not copied to SD card)
- Status: Applied cleanly, no questions needed

**Rule 2: CanvasKit WASM Path Patching**
- Not applicable - HTML renderer build has no `canvaskit/` directory
- Status: Skipped (not needed)

**Rule 3: Font Loading Adaptation**
- Searched `index.html` for `fonts.googleapis.com` - not found
- Searched `main.dart.js` for CDN font references - none in placeholder
- Assets use local `assets/fonts/MaterialIcons-Regular.otf` only
- Status: No action required

**Rule 4: Index HTML Adaptation for BrightSign**
- Removed `<base href="$FLUTTER_BASE_HREF">`, replaced with `<base href="/">`
- Updated viewport: `width=device-width, initial-scale=1.0` -> `width=1920, height=1080, initial-scale=1`
- Added CSS: `html, body { width: 1920px; height: 1080px; margin: 0; padding: 0; overflow: hidden; }`
- Added `flt-glass-pane` sizing for Flutter HTML renderer root element
- Removed PWA meta tags (`apple-mobile-web-app-*`) - not relevant for signage
- Removed `manifest.json` link - not needed on BrightSign
- Removed `favicon.png` link
- Status: Applied cleanly

**Rule 5: Video Overlay with HTML renderer**
- Not applicable for CanvasKit z-index issue (HTML renderer avoids this)
- Added `.flt-platform-view { position: absolute; z-index: 10; }` as a precaution for any platform view overlays
- Status: Precautionary CSS added

#### Step 3: No Webpack Configuration Needed

The app uses only `video_player_web` which uses native HTML5 `<video>` elements. No custom JS or BrightSign device API calls are made. Method 1 with HTML renderer is self-contained - no webpack bundling required.

#### Step 4: autorun.brs Generated

Generated `autorun.brs` using the "Static Flutter Web with HTML Renderer" template from CLAUDE.md:
- Uses `roHtmlWidget` pointing to `file:///sd:/index.html`
- Inspector server on port 2999 for Chrome DevTools debugging
- 1920x1080 display mode set on boot
- Event loop handles load errors and unexpected dialogs

#### Step 5: SD Card Structure Documented

Created `SD_CARD_STRUCTURE.md` with full copy instructions and list of excluded files.

---

### No Manual Intervention Required

The AI completed the migration without needing to ask any questions. All decisions were covered by the CLAUDE.md rules:
- Renderer choice was auto-detected from absence of `canvaskit/` directory
- Service worker removal was a deterministic rule
- Viewport/CSS changes were templated
- autorun.brs template selection was determined by renderer type (HTML = static template)

---

### Issues Found

None during migration. The CLAUDE.md instructions were clear and complete for this app profile.

**Potential issues to watch for during hardware testing (BD-008):**

1. **Video playback requires internet access** - the app loads videos from `commondatastorage.googleapis.com`. BrightSign players may have restricted internet access. If videos fail to load, replace URLs with local SD card paths in `main.dart.js` source and rebuild.

2. **Main.dart.js is a placeholder** - this migration used a simulated build output. The real `main.dart.js` from `flutter build web --web-renderer html` must replace the placeholder before hardware testing.

3. **Font loading on BrightSign** - `MaterialIcons-Regular.otf` loads from `assets/fonts/`. Verify this path resolves correctly from `file:///sd:/` base. The `<base href="/">` in adapted `index.html` maps `/assets/` to `file:///sd:/assets/`.

4. **flutter_bootstrap.js template variables** - The file still contains `{{flutter_js}}` and `{{flutter_build_config}}` template placeholders. In a real Flutter build, these are expanded by the build system. Verify the actual `flutter_bootstrap.js` from a real build does not contain these literals.

5. **Memory usage** - Flutter HTML renderer uses more DOM nodes than plain HTML. Monitor memory usage on extended runs (24h+) for signage use cases.

---

### Output Files

All output files are in `brightsign-output/`:

| File | Status | Notes |
|------|--------|-------|
| `index.html` | Modified | BrightSign-adapted (viewport, dimensions, no service worker) |
| `flutter_bootstrap.js` | Modified | Service worker registration removed |
| `flutter.js` | Copied | Unchanged |
| `main.dart.js` | Copied | Unchanged (placeholder - replace with real build) |
| `assets/AssetManifest.json` | Copied | Unchanged |
| `assets/FontManifest.json` | Copied | Unchanged |
| `assets/fonts/MaterialIcons-Regular.otf` | Copied | Unchanged (placeholder) |
| `autorun.brs` | Generated | BrightSign launcher using HTML renderer template |
| `SD_CARD_STRUCTURE.md` | Generated | Copy instructions for SD card |

---

### Next Step

**BD-008** (manual): Copy `brightsign-output/` to SD card and test on BrightSign Series 5 hardware.

Before hardware testing, replace the placeholder `main.dart.js` with the real compiled output from `flutter build web --web-renderer html`.
