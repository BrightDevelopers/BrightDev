# Samsung Tizen to HTML/JavaScript Migration Guide

This guide provides a comprehensive roadmap for migrating your Samsung Tizen web application (the HTML/CSS/JS + Tizen APIs used by Tizen TV widgets) to native HTML/JavaScript that runs directly on BrightSign players. The migration process involves removing Tizen-proprietary APIs and manifest model, replacing them with standard web APIs and BrightSign platform features, and validating that nothing was silently depending on the Tizen runtime.

**🤖 AI-First Migration**: This guide is designed for AI-assisted migration. Instead of manually executing steps, you'll work with AI agents (like Claude via the BrightDeveloper MCP) to automate the entire migration process. For machine-readable patterns and automation schemas, see [CLAUDE.md](CLAUDE.md).

If you have not set up the BrightDeveloper MCP Server yet, follow the instructions in the [Installing the MCP server](https://github.com/BrightDevelopers/BrightDev/blob/main/README.md#install-the-brightsign-mcp-server) section of the main BrightDev README file.

> Note that not everything generated using AI agents and the BrightDeveloper MCP may be perfect on the first try. You may need to iterate with the AI, provide additional context, or make manual adjustments as needed.

> **Before you begin:** This guide's examples default to the Chromium media player, which supports modern web APIs (service workers, Cache API, IndexedDB, etc.) but only exists on **Series 5 and later** players. **Targeting a Series 4 or earlier player? This guide still applies to you** - just skip the one registry write that selects Chromium, and your app will use the default BrightSign media player instead, which fully supports standard `<video>` playback. Everything else (API mappings, remote-key handling, packaging) is identical either way. Also read [Media Player Selection](../media-player-selection.md) first if your app needs HDMI input, RTSP/UDP streams, frame-accurate sync, or chroma key - those need the BrightSign media player even on Series 5.

---

## ⚠️ Important: Why You Can't Just Repackage a Tizen App for BrightSign

Unlike migrating from another web-based platform, a Tizen `.wgt` widget can't be dropped onto BrightSign and made to run with a compatibility shim. There's no `roTizen` object and no polyfill that makes `tizen.*`/`webapis.*` calls resolve to something real off of a Samsung TV. **The right approach is a source-level refactor**: strip Tizen's proprietary APIs and manifest model, and replace them with the standard web APIs and BrightSign primitives that do the same job.

### Tizen Runtime Assumptions That Don't Hold Outside Tizen

- ❌ **`tizen` and `webapis` are runtime-injected globals** - They only exist inside the Tizen web runtime. Reference them from a plain browser or BrightSign's Chromium engine and you get an uncaught `ReferenceError`, not a missing feature.
- ❌ **Unguarded calls don't fail quietly** - An uncaught `ReferenceError` partway through a startup function (`onload`, `$(document).ready`, etc.) aborts everything after it in that function, including code that has nothing to do with Tizen. See [Method 1](method1-refactor.md) and [troubleshooting.md](troubleshooting.md) for real examples pulled from Samsung's own demo apps.
- ❌ **`config.xml` privilege declarations gate API access at the OS level** - `tizen:privilege` entries (e.g. `http://tizen.org/privilege/tv.inputdevice`) are enforced by Tizen's own packaging/signing pipeline. There's no equivalent gate on BrightSign, and no privilege string to port.
- ❌ **`.wgt` packaging assumes a Tizen-specific widget lifecycle** - `Common.API.Widget.sendReadyEvent()`/`blockNavigation()`/`sendExitEvent()` and `tizen.application.getCurrentApplication().exit()` assume an OS shell that's managing your app's ready/foreground/exit state. BrightSign has no such shell handshake.
- ⚠️ **Remote-control input assumes a physical IR remote** - `tizen.tvinputdevice.registerKey()` and Tizen's channel/color-button keycodes assume the end user is holding a TV remote. BrightSign takes a more flexible, peripheral-driven approach instead: arrow/enter-style navigation maps directly to standard keyboard events, and anything beyond that - color-button-style actions, presence detection, physical triggers - is built from whatever interactivity your deployment actually calls for (GPIO, touchscreen, USB HID), not a fixed remote model.

### What Refactoring to BrightSign HTML/JS Gets You

- ✅ **Runs on standard Chromium** - No Tizen-only globals, no runtime-injected script paths, no `$WEBAPIS` build macro.
- ✅ **Standard `<video>` + MSE playback** - No proprietary player object, no custom listener wiring.
- ✅ **No manifest/privilege model to maintain** - Deployment permissions are OS/registry-level, not declared per-app.
- ✅ **Works with plain keyboard/mouse/touch input** - No dependency on Tizen's keycode tables.
- ✅ **One process, no widget lifecycle handshake** - The app starts running as soon as it's loaded.
- ✅ **GPIO access Tizen never had** - BrightScript's `roGpioControlPort`/`roGpioButton` read physical GPIO pins (buttons, PIR/proximity sensors, relays, etc.) in `autorun.brs`, bridged into your HTML/JS page over `BSMessagePort`. That's real presence detection, occupancy sensors, or physical button/relay integration - not something a Tizen remote-control app could ever do.

---

## Overview

This guide helps you migrate a **Samsung Tizen web application (HTML/CSS/JS + Tizen APIs, packaged as a `.wgt` widget)** to **native HTML/JavaScript that runs directly on BrightSign players**, replacing Tizen-proprietary APIs with standard web APIs and BrightSign platform features.

**Migration Approach:**
- **[Method 1: Refactor & Replace](method1-refactor.md)** - Systematic removal of Tizen APIs and manifest model, replaced with standard web APIs and BrightSign primitives

**Target Platform**: BrightSign OS - Chromium media player by default (Series 5 and later), or the native BrightSign media player on Series 4 and earlier. Both are fully supported by this guide.

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
| `tizen.tvinputdevice.registerKey()` + remote keycodes | Standard `keydown`/`keyup` listeners for navigation; color/channel-style actions are built via GPIO, touchscreen, or USB HID peripherals - see [troubleshooting.md](troubleshooting.md) |
| `webapis.avplay` (AVPlay player, DRM/streaming) | HTML5 `<video>` + MSE via the Chromium media player |
| `<object type='application/avplayer'>` | `<video>` element |
| DRM (`ondrmevent`, Widevine/PlayReady license flow) | Confirm current support directly with your BrightSign contact before committing to a DRM-dependent CMS feature - this is worth a direct conversation rather than an assumption |
| `config.xml` (`tizen:application`, `tizen:privilege`, `tizen:feature`, `tizen:profile`) | `autorun.brs` + `roRegistrySection` (no manifest/privilege model to maintain) |
| `.wgt` packaging | `autorun.zip` containing `autozip.brs` (unpack script) + `autorun.brs` (app entry point) + app files, deployed via SD/USB/BrightSign Control |
| `Common.API.Widget` (`sendReadyEvent`/`blockNavigation`/`sendReturnEvent`/`sendExitEvent`) | Not needed - the app is simply running once loaded, no lifecycle handshake to satisfy |
| `tizen.application.getCurrentApplication().exit()` | Not typically needed - BrightSign players are built for continuous, always-on operation |
| Legacy `clsid:SAMSUNG-INFOLINK-*` plugin (`.Play()`, `.SetDisplayArea()`, `.GetIP()`, `.GetMAC()`, `.GetFirmware()`, `.GetEpochTime()`) | `<video>` element + `@brightsign/deviceinfo` |
| `setOnScreenSaver()`/`setOffScreenSaver()`, `setOnIdleEvent()`/`setOffIdleEvent()` | Not needed - BrightSign is purpose-built for always-on signage, so there's nothing to suppress in the first place |
| `webapis.audiocontrol.getVolume/setVolume/getMute/setMute` | Native `HTMLMediaElement.volume`/`.muted` on your `<video>`/`<audio>` element |
| `webapis.tv.info.getModel()`/`getProduct()` | `@brightsign/deviceinfo` (`model`, `family`, `serialNumber`) |
| Tizen Service app (`<tizen:service>`, separate background Node.js process) | Simpler by design: `nodejs_enabled` runs Node.js in the same `roHtmlWidget` as your page - one shared runtime instead of two processes to keep in sync |
| `document.addEventListener('tizenvisibilitychange', ...)` | Standard `visibilitychange` (reliable outside Tizen) |
| Tizen single-playthrough behavior (`onstreamcompleted` → `stop()`, driven by a remote-interactive app) | Defaults to `video.loop = true` for always-on signage - a remote-interactive Tizen app doesn't tell you whether this BrightSign deployment has interactive peripherals of its own |

---

## 🔁 Default Assumption: Signage Content Loops Continuously

BrightSign digital signage is purpose-built for always-on, unattended operation - content plays continuously by design, with no dependency on someone pressing a button to keep it going. Tizen apps, by contrast, are commonly built assuming a physical remote control drives navigation, pause, and resume. That distinction matters for migration: **a Tizen app being remote-interactive is not evidence that your BrightSign deployment is interactive.** BrightSign's flexible, peripheral-driven architecture means interactivity comes from whatever hardware a given deployment actually calls for - GPIO sensors and buttons, a touchscreen, a USB HID device - rather than a fixed built-in remote model, so a Tizen app's remote usage doesn't tell you what (if anything) this particular deployment has.

Default video/media playback to loop (`video.loop = true`) rather than stopping after one playthrough, unless your specific BrightSign deployment has real interactive hardware of its own - a touchscreen, GPIO buttons/sensors, a USB HID remote receiver, or similar. That's a fact about your hardware deployment, not something derivable from the Tizen source, so [CLAUDE.md](CLAUDE.md) asks about it directly rather than guessing from how the original app used its remote.

---

## 🎯 Decisions This Migration Needs From You

A handful of Tizen features map to a design decision rather than a drop-in replacement. Don't let an AI-assisted migration silently guess at these - each one is worth a deliberate call from you (and in one case, a direct check with BrightSign) before you ship:

- **Remote color/channel buttons** (`ColorF1Green`/`ColorF2Yellow`/`ColorF3Blue`, `ChannelUp`/`ChannelDown`, etc.) - BrightSign's interactivity is peripheral-driven rather than built around a fixed remote model, so this is a hardware and design choice, not a limitation. Decide whether this functionality is actually required by your CMS; if so, this deployment can use a USB HID remote/RF receiver or a GPIO-wired IR receiver for real button input, or you can redesign it as an on-screen touch/click control - whichever fits the deployment.
- **DRM-protected playback** (`ondrmevent`, Widevine/PlayReady) - If your CMS plays protected content, confirm current support directly with your BrightSign contact before committing to this migration path - DRM capabilities are worth a direct conversation rather than an assumption either way.
- **Screensaver / idle-timeout suppression** (`setOnScreenSaver()`/`setOffScreenSaver()`, `setOnIdleEvent()`/`setOffIdleEvent()`) - BrightSign players are purpose-built for always-on signage, so there's nothing here to suppress. Confirm that assumption holds for your specific use case before removing these calls.
- **Tizen Service app** (a separate background Node.js process declared via `<tizen:service>`) - BrightSign's Node.js integration runs in the same `roHtmlWidget` as your page - simpler to build and maintain than juggling two processes, but it does mean redesigning this piece rather than porting it line-for-line.

[CLAUDE.md](CLAUDE.md) is written to raise each of these as an explicit question rather than assume an answer - see its API Mapping Table and AI Automation Instructions sections.

---

## Getting Started with AI-Assisted Migration

[CLAUDE.md](CLAUDE.md) is itself the migration prompt - just copy its contents, run your AI tool from the root of the Tizen project you want to migrate, and paste it in. No separate prompt, no placeholders to fill in first.
- **[Method 1: Refactor & Replace →](method1-refactor.md)** for the exact steps, prerequisites, and what happens next

## Tips for Best Results

1. **Grep before you assume**: Search your entire codebase for `tizen.` and `webapis.` before assuming a file is safe to leave alone
2. **Read every config.xml**: Its privilege/feature declarations tell you exactly which Tizen APIs are actually exercised, not just referenced in dead code
3. **Don't trust an existing guard**: Verify it against the actual runtime state - a guard that checks the wrong global still throws (see [troubleshooting.md](troubleshooting.md))
4. **Say which remote functionality is essential**: Tell the AI which remote-control behavior your CMS truly needs, so it picks the right peripheral (GPIO, USB HID, on-screen control) instead of guessing at a color-button mapping
5. **Flag DRM dependencies early**: This needs direct verification with BrightSign, not an assumed API mapping
6. **Test with `tizen`/`webapis` genuinely undefined**: Use a plain desktop browser first to catch every unguarded reference before deploying to hardware
7. **Check for the muted-autoplay pattern**: If your CMS expects video to start without a remote keypress, confirm the refactored code adds it
8. **Specify your target BrightSign player series**: Series 5+ gets the Chromium media player by default; Series 4 or earlier just skips that one registry write and uses the native BrightSign media player instead - the rest of the migration is unaffected
9. **Test incrementally**: Validate the manifest/`autorun.brs` conversion before moving on to media/input replacement
10. **Ask questions**: If the AI's proposed replacement for a legacy `clsid:SAMSUNG-INFOLINK-*` call seems unclear, request an explanation
11. **Verify `roHtmlWidget` construction against the docs, not from memory**: `CreateObject("roHtmlWidget", rect, config)` requires a real `roRectangle` first argument - a malformed call renders nothing but throws no error, so a black screen on hardware won't tell you what's wrong
12. **Review file changes before accepting them, especially around packaging**: an AI assembling a deployment package can get overzealous with cleanup commands - watch for anything touching files you didn't ask it to touch, particularly your original Tizen build artifacts
13. **Say whether your deployment has interactive hardware**: touchscreen, GPIO buttons/sensors, USB HID, etc. Don't let the AI infer this from the Tizen app's remote-control usage - BrightSign's interactivity comes from whatever peripherals a deployment actually has, and that's independent of what the original Tizen app assumed. Without confirmed hardware, expect (and want) media to default to looping

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
