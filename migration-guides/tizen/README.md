# Samsung Tizen to HTML/JavaScript Migration Guide

This guide provides a comprehensive roadmap for migrating your Samsung Tizen web application (the HTML/CSS/JS + Tizen APIs used by Tizen TV widgets) to native HTML/JavaScript that runs directly on BrightSign players. The migration process involves removing Tizen-proprietary APIs and manifest model, replacing them with standard web APIs and BrightSign platform features, and validating that nothing was silently depending on the Tizen runtime.

**🤖 AI-First Migration**: This guide is designed for AI-assisted migration. Instead of manually executing steps, you'll work with AI agents (like Claude via the BrightDeveloper MCP) to automate the entire migration process. For machine-readable patterns and automation schemas, see [CLAUDE.md](CLAUDE.md).

If you have not set up the BrightDeveloper MCP Server yet, follow the instructions in the [Installing the MCP server](https://github.com/BrightDevelopers/BrightDev/blob/main/README.md#install-the-brightsign-mcp-server) section of the main BrightDev README file.

> Note that not everything generated using AI agents and the BrightDeveloper MCP may be perfect on the first try. You may need to iterate with the AI, provide additional context, or make manual adjustments as needed.

> **Before you begin:** This guide defaults to the Chromium media player on Series 5 devices, which supports modern web APIs (service workers, Cache API, IndexedDB, etc.). If your app needs HDMI input, RTSP/UDP streams, frame-accurate sync, chroma key, or Series 4 support, read [Media Player Selection](../media-player-selection.md) first.

---

## ⚠️ Important: Why You Can't Just Repackage a Tizen App for BrightSign

Unlike migrating from another web-based platform, a Tizen `.wgt` widget can't be dropped onto BrightSign and made to run with a compatibility shim. There's no `roTizen` object and no polyfill that makes `tizen.*`/`webapis.*` calls resolve to something real off of a Samsung TV. **The right approach is a source-level refactor**: strip Tizen's proprietary APIs and manifest model, and replace them with the standard web APIs and BrightSign primitives that do the same job.

### Tizen Runtime Assumptions That Don't Hold Outside Tizen

- ❌ **`tizen` and `webapis` are runtime-injected globals** - They only exist inside the Tizen web runtime. Reference them from a plain browser or BrightSign's Chromium engine and you get an uncaught `ReferenceError`, not a missing feature.
- ❌ **Unguarded calls don't fail quietly** - An uncaught `ReferenceError` partway through a startup function (`onload`, `$(document).ready`, etc.) aborts everything after it in that function, including code that has nothing to do with Tizen. See [Method 1](method1-refactor.md) and [troubleshooting.md](troubleshooting.md) for real examples pulled from Samsung's own demo apps.
- ❌ **`config.xml` privilege declarations gate API access at the OS level** - `tizen:privilege` entries (e.g. `http://tizen.org/privilege/tv.inputdevice`) are enforced by Tizen's own packaging/signing pipeline. There's no equivalent gate on BrightSign, and no privilege string to port.
- ❌ **`.wgt` packaging assumes a Tizen-specific widget lifecycle** - `Common.API.Widget.sendReadyEvent()`/`blockNavigation()`/`sendExitEvent()` and `tizen.application.getCurrentApplication().exit()` assume an OS shell that's managing your app's ready/foreground/exit state. BrightSign has no such shell handshake.
- ⚠️ **Remote-control input assumes a physical IR remote** - `tizen.tvinputdevice.registerKey()` and Tizen's channel/color-button keycodes assume the end user is holding a TV remote. Digital signage players aren't controlled this way; only a subset (arrow/enter-style navigation) has a clean keyboard-event equivalent.

### What Refactoring to BrightSign HTML/JS Gets You

- ✅ **Runs on standard Chromium** - No Tizen-only globals, no runtime-injected script paths, no `$WEBAPIS` build macro.
- ✅ **Standard `<video>` + MSE playback** - No proprietary player object, no custom listener wiring.
- ✅ **No manifest/privilege model to maintain** - Deployment permissions are OS/registry-level, not declared per-app.
- ✅ **Works with plain keyboard/mouse/touch input** - No dependency on Tizen's keycode tables.
- ✅ **One process, no widget lifecycle handshake** - The app starts running as soon as it's loaded.

---

## Overview

This guide helps you migrate a **Samsung Tizen web application (HTML/CSS/JS + Tizen APIs, packaged as a `.wgt` widget)** to **native HTML/JavaScript that runs directly on BrightSign players**, replacing Tizen-proprietary APIs with standard web APIs and BrightSign platform features.

**Migration Approach:**
- **[Method 1: Refactor & Replace](method1-refactor.md)** - Systematic removal of Tizen APIs and manifest model, replaced with standard web APIs and BrightSign primitives

**Target Platform**: BrightSign OS with Chromium media player (Series 5 and later)

---

## Key Differences: Tizen vs. BrightSign HTML/JS

### Architecture Transformation

**Before (Tizen):**
```
┌────────────────────────────────────────────┐
│        Tizen Widget (.wgt package)          │
│                                            │
│  ┌──────────────┐       ┌──────────────┐   │
│  │  config.xml  │       │  index.html  │   │
│  │  (manifest,  │◄─────►│  + tizen.*/  │   │
│  │  privileges) │       │  webapis.*   │   │
│  └──────────────┘       └──────────────┘   │
│      Tizen Web Runtime (Samsung TV)         │
└────────────────────────────────────────────┘
```

**After (BrightSign):**
```
┌────────────────────────────────────────────┐
│      BrightSign Chromium + autorun.brs      │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │   Single HTML/JS Application         │  │
│  │                                      │  │
│  │   Standard web APIs +                │  │
│  │   BrightSign Device APIs             │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

### What Changes

| Tizen Feature | BrightSign Replacement |
|----------------|------------------------|
| `tizen.tvinputdevice.registerKey()` + remote keycodes | Standard `keydown`/`keyup` listeners; **no equivalent** for color/channel buttons - see [troubleshooting.md](troubleshooting.md) |
| `webapis.avplay` (AVPlay player, DRM/streaming) | HTML5 `<video>` + MSE via the Chromium media player |
| `<object type='application/avplayer'>` | `<video>` element |
| DRM (`ondrmevent`, Widevine/PlayReady license flow) | **Not documented** in current BrightSign developer docs - verify directly with BrightSign before committing to a DRM-dependent CMS feature |
| `config.xml` (`tizen:application`, `tizen:privilege`, `tizen:feature`, `tizen:profile`) | `autorun.brs` + `roRegistrySection` (no manifest/privilege model) |
| `.wgt` packaging | `autorun.zip` containing `autozip.brs` (unpack script) + `autorun.brs` (app entry point) + app files, deployed via SD/USB/BrightSign Control |
| `Common.API.Widget` (`sendReadyEvent`/`blockNavigation`/`sendReturnEvent`/`sendExitEvent`) | Not needed - no widget lifecycle handshake |
| `tizen.application.getCurrentApplication().exit()` | Not typically needed (signage players run 24/7) |
| Legacy `clsid:SAMSUNG-INFOLINK-*` plugin (`.Play()`, `.SetDisplayArea()`, `.GetIP()`, `.GetMAC()`, `.GetFirmware()`, `.GetEpochTime()`) | `<video>` element + `@brightsign/deviceinfo` |
| `setOnScreenSaver()`/`setOffScreenSaver()`, `setOnIdleEvent()`/`setOffIdleEvent()` | **Not applicable** - BrightSign has no screensaver/idle timeout to suppress |
| `webapis.audiocontrol.getVolume/setVolume/getMute/setMute` | Native `HTMLMediaElement.volume`/`.muted` on your `<video>`/`<audio>` element |
| `webapis.tv.info.getModel()`/`getProduct()` | `@brightsign/deviceinfo` (`model`, `family`, `serialNumber`) |
| Tizen Service app (`<tizen:service>`, separate background Node.js process) | **No direct equivalent** - closest is `nodejs_enabled` in the same `roHtmlWidget` (shared runtime, not a separate process) |
| `document.addEventListener('tizenvisibilitychange', ...)` | Standard `visibilitychange` (reliable outside Tizen) |
| Tizen single-playthrough behavior (`onstreamcompleted` → `stop()`, driven by a remote-interactive app) | Defaults to `video.loop = true` - a remote-interactive Tizen app is not evidence the BrightSign deployment is interactive, since there's no BrightSign remote equivalent at all |

---

## 🔁 Default Assumption: Signage Content Loops Continuously

BrightSign digital signage is normally "set and forget" - content plays continuously with no one present to interact with it. Tizen apps, by contrast, are commonly built assuming a physical remote control drives navigation, pause, and resume. That distinction matters for migration: **a Tizen app being remote-interactive is not evidence that your BrightSign deployment is interactive** - BrightSign has no remote-control equivalent at all, so that signal simply doesn't carry over.

Default video/media playback to loop (`video.loop = true`) rather than stopping after one playthrough, unless your specific BrightSign deployment has real interactive hardware of its own - a touchscreen, GPIO buttons/sensors, or similar. That's a fact about your hardware deployment, not something derivable from the Tizen source, so [Method 1](method1-refactor.md)'s AI prompt asks about it directly rather than guessing from how the original app used its remote.

---

## ⚠️ Flag These for Manual Review: No Direct BrightSign Equivalent

A handful of Tizen features genuinely have no BrightSign equivalent. Don't let an AI-assisted migration silently drop or guess at these - each one needs an explicit decision from you (and in one case, from BrightSign directly) before you ship:

- **Remote color/channel buttons** (`ColorF1Green`/`ColorF2Yellow`/`ColorF3Blue`, `ChannelUp`/`ChannelDown`, etc.) - Signage players have no IR remote model at all. Decide whether this functionality is actually required by your CMS and, if so, how you want it redesigned (typically an on-screen touch/click control).
- **DRM-protected playback** (`ondrmevent`, Widevine/PlayReady) - Not documented anywhere in current BrightSign developer documentation. If your CMS plays protected content, verify support directly with BrightSign before committing to this migration path.
- **Screensaver / idle-timeout suppression** (`setOnScreenSaver()`/`setOffScreenSaver()`, `setOnIdleEvent()`/`setOffIdleEvent()`) - BrightSign has no screensaver or idle timeout to suppress. Confirm it's genuinely safe to just remove these calls for your use case rather than assuming it is.
- **Tizen Service app** (a separate background Node.js process declared via `<tizen:service>`) - No direct equivalent. This needs a real redesign around `nodejs_enabled` in the same `roHtmlWidget`, not a line-for-line port - decide how before continuing.

[Method 1](method1-refactor.md)'s AI prompt is written to raise each of these as an explicit question rather than assume an answer - see its "Application Requirements" and "Migration Tasks" sections.

---

## Getting Started with AI-Assisted Migration

Follow the detailed AI prompt in the migration method guide:
- **[Method 1: Refactor & Replace →](method1-refactor.md)**

## Tips for Best Results

1. **Grep before you assume**: Search your entire codebase for `tizen.` and `webapis.` before assuming a file is safe to leave alone
2. **Read every config.xml**: Its privilege/feature declarations tell you exactly which Tizen APIs are actually exercised, not just referenced in dead code
3. **Don't trust an existing guard**: Verify it against the actual runtime state - a guard that checks the wrong global still throws (see [troubleshooting.md](troubleshooting.md))
4. **Say which remote functionality is essential**: Tell the AI which remote-control behavior your CMS truly needs, so it doesn't try to force a color-button mapping that has no BrightSign equivalent
5. **Flag DRM dependencies early**: This needs direct verification with BrightSign, not an assumed API mapping
6. **Test with `tizen`/`webapis` genuinely undefined**: Use a plain desktop browser first to catch every unguarded reference before deploying to hardware
7. **Check for the muted-autoplay pattern**: If your CMS expects video to start without a remote keypress, confirm the refactored code adds it
8. **Specify your target BrightSign player series**: The Chromium media player requires Series 5+
9. **Test incrementally**: Validate the manifest/`autorun.brs` conversion before moving on to media/input replacement
10. **Ask questions**: If the AI's proposed replacement for a legacy `clsid:SAMSUNG-INFOLINK-*` call seems unclear, request an explanation
11. **Verify `roHtmlWidget` construction against the docs, not from memory**: `CreateObject("roHtmlWidget", rect, config)` requires a real `roRectangle` first argument - a malformed call renders nothing but throws no error, so a black screen on hardware won't tell you what's wrong
12. **Review file changes before accepting them, especially around packaging**: an AI assembling a deployment package can get overzealous with cleanup commands - watch for anything touching files you didn't ask it to touch, particularly your original Tizen build artifacts
13. **Say whether your deployment has interactive hardware**: touchscreen, GPIO buttons/sensors, etc. Don't let the AI infer this from the Tizen app's remote-control usage - that has no BrightSign equivalent and isn't evidence either way. Without it, expect (and want) media to default to looping

---

## Troubleshooting

See [troubleshooting.md](troubleshooting.md) for common migration issues and solutions.

---

## Resources

- [HTML Video](https://docs.brightsign.biz/develop/html-video)
- [HTML Playback by Player Series](https://docs.brightsign.biz/develop/html-playback-by-player-series)
- [keyboard](https://docs.brightsign.biz/develop/keyboard)
- [Autorun Files](https://docs.brightsign.biz/develop/autorun-files)
- [deviceinfo](https://docs.brightsign.biz/develop/deviceinfo)
- [audio](https://docs.brightsign.biz/develop/audio)
- [Node.js](https://docs.brightsign.biz/develop/nodejs)
- [BrightSign Developer Cookbook](https://github.com/brightsign/dev-cookbook)
