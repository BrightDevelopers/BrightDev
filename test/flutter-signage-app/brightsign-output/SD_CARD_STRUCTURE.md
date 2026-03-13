# SD Card Structure - flutter_signage_app (Method 1: Flutter Web Adaptation)

Copy the following files to the root of your SD card:

```
SD:/
├── autorun.brs                         <- BrightSign launcher (launch this automatically)
├── index.html                          <- Flutter Web entry point (BrightSign-adapted)
├── flutter.js                          <- Flutter engine loader (unchanged)
├── flutter_bootstrap.js                <- Flutter init, service worker removed
├── main.dart.js                        <- Compiled Dart application (unchanged)
└── assets/
    ├── AssetManifest.json
    ├── FontManifest.json
    └── fonts/
        └── MaterialIcons-Regular.otf
```

## Files NOT included (intentionally excluded)

| File | Reason excluded |
|------|-----------------|
| `flutter_service_worker.js` | BrightSign Chromium does not support service workers |
| `manifest.json` | PWA manifest - not relevant for BrightSign |
| `favicon.png` | Not displayed on BrightSign |
| `icons/` | Not used on BrightSign |

## Renderer: HTML (no CanvasKit)

This app was built with `--web-renderer html`. No `canvaskit/` directory is present.
The HTML renderer is preferred for BrightSign because:
- No WebAssembly loading required
- Faster startup time
- Native `<video>` elements work correctly (no z-index issues)
- Lower memory usage

## Verification Steps

1. Insert SD card into BrightSign Series 5
2. Power on - autorun.brs launches automatically
3. App should display within 5-10 seconds of boot
4. Remote debugging: connect Chrome to `http://<player-ip>:2999`
5. Check DevTools console for any errors

## Known Issues to Watch For

- **Video not playing**: Check network access to commondatastorage.googleapis.com. If no internet, replace video URLs with local SD card paths.
- **App stuck loading**: Check DevTools console for JavaScript errors. Look for font loading failures.
- **Black screen**: Verify `main.dart.js` loaded (check Network tab in DevTools).
- **Wrong size**: Confirm viewport is 1920x1080 in DevTools Device Mode.
