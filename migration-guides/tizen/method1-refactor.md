# Method 1: Refactor & Replace

[← Back to Main Guide](README.md)

Systematically identify every Tizen-specific API in your codebase and replace it with its standard web or BrightSign equivalent, guided by the API Mapping Table in CLAUDE.md.

**🎯 Best for**: Tizen web apps built with plain HTML/JS (with or without a game framework like Phaser/MelonJS), including apps still carrying the legacy samsung.js/`clsid:SAMSUNG-INFOLINK-*` shim

**📦 Target Platform**: BrightSign OS - Chromium media player by default (Series 5+), or the native BrightSign media player on Series 4 and earlier (see ../media-player-selection.md). This guide applies to both; only one registry key differs.

Before using this prompt:
- ✅ BrightDeveloper MCP server connected (see main [BrightDev README](https://github.com/BrightDevelopers/BrightDev))
- ✅ Your Tizen project's source is accessible to the AI (repo checked out, or files attached)
- ✅ **Attach CLAUDE.md to your AI context** - the API Mapping Table and transformation rules it contains are what make this prompt reliable
- ✅ Have BrightSign test hardware available for final validation (any series works - Series 5+ if you're using the default Chromium media player, Series 4 or earlier if you're using the native BrightSign media player instead)

Copy the following prompt, fill in the placeholders, and run it against your project with CLAUDE.md attached:

```
I need to migrate a Samsung Tizen web application to run natively as HTML/JavaScript on a BrightSign player. Please read the CLAUDE.md file at [PATH_TO_CLAUDE_MD] first - it contains the complete API mapping table and transformation rules you should follow.

Project Details:
- App name: {APP_NAME}
- Current entry point: {ENTRY_HTML_FILE}
- Uses a game/UI framework: {YES/NO - e.g. Phaser, MelonJS, jQuery, none}
- Packaged as: {.wgt widget / plain HTML+JS folder}

Application Architecture:
- Number of HTML pages/screens: {COUNT}
- Estimated tizen./webapis. call sites found so far: {COUNT}
- Uses the legacy samsung.js / clsid:SAMSUNG-INFOLINK-* shim: {YES/NO}

Tizen APIs Used (check all that apply):
- [ ] tizen.tvinputdevice.registerKey() / unregisterKey() (remote-key handling)
- [ ] webapis.avplay (AVPlay video player)
- [ ] <object type='application/avplayer'> embed tag
- [ ] DRM-protected playback (ondrmevent, Widevine/PlayReady)
- [ ] config.xml tizen:privilege / tizen:feature / tizen:profile declarations
- [ ] Common.API.Widget (sendReadyEvent/blockNavigation/sendReturnEvent/sendExitEvent)
- [ ] tizen.application.getCurrentApplication().exit()
- [ ] Legacy clsid:SAMSUNG-INFOLINK-* plugin (.Play(), .SetDisplayArea(), .GetIP(), .GetMAC(), .GetFirmware(), .GetEpochTime())
- [ ] Common.API.Plugin.setOnScreenSaver()/setOffScreenSaver()/setOnIdleEvent()/setOffIdleEvent()
- [ ] webapis.audiocontrol (getVolume/setVolume/getMute/setMute)
- [ ] webapis.tv.info.getModel()/getProduct()
- [ ] Tizen Service app (<tizen:service>, separate background Node.js process)
- [ ] tizenvisibilitychange
- [ ] Other: {SPECIFY}

BrightSign Platform Features Needed:
- [ ] Chromium media player (default on Series 5+ - HTML5 <video>, MSE, modern web APIs)
- [ ] Native BrightSign media player instead (required on Series 4 or earlier - Chromium video decode does not exist on those players regardless of OS version; also needed for HDMI input, RTSP/UDP, sync, or chroma key even on Series 5 - see ../media-player-selection.md)
- [ ] @brightsign/deviceinfo (device model/serial, replacing webapis.tv.info or legacy GetFirmware/GetIP/GetMAC)
- [ ] Node.js (nodejs_enabled) - only if porting logic from a Tizen Service app
- [ ] Interactive input hardware on this deployment (touchscreen, GPIO buttons/sensors, USB HID, etc.) - only check this if the physical BrightSign deployment actually has one; the Tizen app using a remote control does NOT count, since BrightSign has no remote-control equivalent at all
- [ ] Other: {SPECIFY}

Application Requirements:
- Must support DRM-protected playback: {YES/NO - if YES, flag for direct verification with BrightSign, do not assume support}
- Must retain color/channel remote-button functionality: {YES/NO - if YES, note there is no BrightSign hardware equivalent}
- Target BrightSign player model/series: {MODEL} - if Series 4 or earlier, skip the Chromium registry write entirely and use the native BrightSign media player; nothing else in this migration changes
- Offline/no-network operation required: {YES/NO}
- Content should loop continuously (typical "set and forget" signage) rather than stop after one playthrough: {YES/NO/UNSURE - default to YES (loop) unless the deployment has confirmed interactive hardware checked above. Do NOT base this on whether the Tizen source used remote-control input - that has no BrightSign equivalent and isn't evidence either way}

Features With No Direct BrightSign Equivalent - Do Not Silently Resolve These:
Whenever you encounter one of the following, stop and raise an explicit AI_QUESTION for me instead of assuming an answer or quietly dropping the functionality:
- Remote color/channel button functionality (`ColorF1Green`, `ChannelUp`/`ChannelDown`, etc.) - there is no BrightSign IR remote hardware or API equivalent
- DRM-protected playback (`ondrmevent`, Widevine/PlayReady) - not documented in current BrightSign developer docs
- Screensaver/idle-suppression calls (`setOnScreenSaver()`, `setOnIdleEvent()`, etc.) - BrightSign has no screensaver or idle timeout to suppress
- A Tizen Service app or other separate background process (`<tizen:service>`) - no direct BrightSign equivalent; this needs a redesign, not a port

Also Always Ask - This One Can't Be Inferred From the Source at All:
- Whether this specific BrightSign deployment has interactive hardware (touchscreen, GPIO buttons/sensors, USB HID, etc.). The Tizen app using a remote control tells you nothing about this - BrightSign has no remote-control equivalent, so remote-driven interactivity in the source is not evidence the deployment is interactive. Without confirmed interactive hardware, default all media playback to loop continuously (typical "set and forget" signage) rather than stopping after one playthrough.

Migration Tasks:
1. **Inventory** - Grep the entire codebase for tizen. and webapis. references, and list every config.xml privilege/feature/profile declaration. Document every call site and which startup function it runs in.
2. **Guard and verify** - Wrap every tizen./webapis. reference in a typeof/existence guard (follow patterns from CLAUDE.md). Check any existing guard for the broken-guard pattern (checks one global, dereferences a different unchecked one). Confirm in a plain browser with tizen/webapis genuinely undefined that no uncaught ReferenceError remains.
3. **Replace media playback** - Replace webapis.avplay and <object type='application/avplayer'> with a standard <video> element and its native events (follow patterns from CLAUDE.md). Add muted autoplay or an explicit in-app control anywhere playback depended on a remote PLAY keydown. Default end-of-playback to looping (video.loop = true, or restart on 'ended') unless interactive hardware was confirmed above - do not port Tizen's stop-at-end behavior unexamined.
4. **Replace remote-key handling** - Replace tizen.tvinputdevice.registerKey()-driven navigation with keydown/keyup listeners where a keyboard equivalent exists (arrows, enter). If color/channel-button-only logic is found, raise an AI_QUESTION rather than removing or redesigning it yourself - there is no BrightSign equivalent, so this is my call to make.
5. **Replace legacy plugin usage** - If the codebase still has a clsid:SAMSUNG-INFOLINK-* embed or the samsung.js shim, replace .Play()/.SetDisplayArea() with a <video> element and .GetIP()/.GetMAC()/.GetFirmware() with @brightsign/deviceinfo (or @brightsign/networkconfiguration).
6. **Remove widget lifecycle calls** - Delete Common.API.Widget.sendReadyEvent()/blockNavigation()/sendReturnEvent()/sendExitEvent() and tizen.application.getCurrentApplication().exit() - BrightSign has no widget lifecycle handshake to satisfy.
7. **Replace signage device control** - Replace webapis.audiocontrol volume/mute calls with native HTMLMediaElement.volume/.muted, and webapis.tv.info.getModel()/getProduct() with @brightsign/deviceinfo. If setOnScreenSaver()/setOnIdleEvent() calls are found, raise an AI_QUESTION confirming it's safe to remove them rather than deleting them silently - BrightSign has nothing to suppress, but confirm that assumption holds for this app.
8. **Convert the manifest** - Turn config.xml's privilege/feature/profile declarations into an autorun.brs that loads your HTML via roHtmlWidget. If targeting Series 5+, write the use-brightsign-media-player registry key as 0 to use Chromium; if targeting Series 4 or earlier, skip that write entirely (Chromium video decode doesn't exist there regardless of OS version) and the app will use the default BrightSign media player instead - nothing else in the pattern changes. Use CreateObject("roHtmlWidget", rect, config) with a real roRectangle as the first argument - never a bare associative array - and verify this against the roHtmlWidget/Autorun Files docs (or CLAUDE.md's boilerplate) rather than writing it from memory. A malformed call here fails completely silently: no error, just a black screen.
9. **Handle a Service app, if present** - If the app has a Tizen Service app (<tizen:service>), don't port it as-is and don't silently redesign it either. Raise an AI_QUESTION describing what the Service app does and propose a redesign around nodejs_enabled in the same roHtmlWidget, and wait for my confirmation before implementing it.
10. **Package as autorun.zip** - In a separate build/output directory (not in place in this project folder), assemble a single autorun.zip. It must contain the standard autozip.brs unpack script at the top level (not autorun.brs directly) - autozip.brs is the only file the player auto-decompresses before running it, and its only job is to unpack everything else (your real autorun.brs, index.html, js/, assets) to storage and reboot. After reboot the player finds the now-unpacked autorun.brs and runs it normally. Follow the autozip.brs boilerplate from CLAUDE.md - it shouldn't normally need modification. Do not delete, move, or overwrite any existing file in this project (including the original .wgt) while doing this.
11. **Test incrementally** - Validate in a plain desktop browser first (with tizen/webapis undefined), then on actual BrightSign hardware. If replacing a dead sample/CMS media URL, verify the replacement with a GET request using a browser User-Agent and a Range header, not a bare curl -I HEAD request - some CDNs return 403 to HEAD requests even for URLs that play back fine.
12. **Document open questions** - List every AI_QUESTION and AI_PLACEHOLDER raised, and confirm each of the four no-equivalent features above (remote color/channel buttons, DRM, screensaver/idle suppression, Service app) was explicitly flagged rather than silently resolved.

Code Quality Requirements:
- Use modern JS (ES6+: const/let, arrow functions, template literals) where the existing codebase already does
- Add try/catch around any BrightSign API call that can fail at runtime (network, filesystem)
- Use AI_PLACEHOLDER comments for anything requiring hardware testing to confirm
- Use AI_QUESTION for anything requiring a decision only I can make (e.g. DRM support, which remote functionality is essential vs decorative)
- Preserve existing code style and structure where it isn't Tizen-specific
- Never delete, move, or overwrite an existing project file as a side effect of packaging or cleanup - build the deployment package in a separate directory

Output Deliverables:
1. Complete list of every tizen./webapis. call site found, with its replacement or removal justified
2. Refactored HTML/JS with all Tizen APIs replaced per the mapping table
3. A generated autorun.brs implementing the equivalent of the original config.xml
4. Confirmation that no uncaught ReferenceError occurs with tizen/webapis undefined
5. An explicit AI_QUESTION for each of the four no-equivalent features if found in this app: remote color/channel buttons, DRM-protected playback, screensaver/idle suppression, and a Tizen Service app - none of these should be silently removed, redesigned, or assumed away
6. An explicit AI_QUESTION about whether this deployment has interactive hardware (touchscreen/GPIO), plus confirmation of what looping default was applied to media playback as a result
7. A flagged list of every other AI_QUESTION item requiring my input
8. A deployment-ready autorun.zip structure (autozip.brs at the top level, plus autorun.brs, index.html, and app assets for it to unpack)
9. Notes on anything that still needs manual/hardware verification (AI_PLACEHOLDER items)
10. A summary of what was removed outright (widget lifecycle, dead legacy plugin code) vs replaced
11. Updated documentation reflecting the new BrightSign-native architecture
12. A closing instruction telling me exactly what to physically do next - not a question. Once autorun.zip is built, end with something like: "Copy autorun.zip to the root of an SD card (or USB drive), insert it into the BrightSign player, and reboot the player - it will unpack automatically and launch the app." Do not end the response with "let me know what you'd like to do" or any other open-ended question - you cannot do the hardware step yourself, but the instruction for it is always the same, so state it plainly.

Follow all transformation patterns from CLAUDE.md, including:
- Guard-then-replace for every Tizen global reference
- The muted-autoplay pattern for playback that previously relied on a remote PLAY keydown
- No manifest/privilege model - map functionality, not privilege strings
- Raise an explicit AI_QUESTION - never silently drop or assume an answer - for remote color/channel buttons, DRM support, screensaver/idle suppression, and a Tizen Service app
- Ask about interactive hardware (touchscreen/GPIO) rather than inferring it from the Tizen app's remote-control usage, and default media playback to loop unless that hardware is confirmed
- End with a concrete physical deployment instruction, not an open-ended question

Output a production-ready BrightSign HTML/JS application with complete documentation.
```

---

## Customization Guide

Replace the following placeholders in the prompt:

| Placeholder | Example | Description |
|---|---|---|
| `[PATH_TO_CLAUDE_MD]` | `./migration-guides/tizen/CLAUDE.md` | Path to this guide's CLAUDE.md so the AI can read the mapping table |
| `{APP_NAME}` | `StoreMenuBoard` | Your application's name |
| `{ENTRY_HTML_FILE}` | `index.html` | The file config.xml's `<content src=...>` points to |
| `{COUNT}` | `12` | Numeric estimates - rough is fine, the AI will refine them during inventory |
| `{MODEL}` | `XT1144` | Target BrightSign player model |
| `{YES/NO}` | `NO` | Direct yes/no answers |
| `{SPECIFY}` | `Tizen's setOnIdleEvent()` | Free-text detail |

**Checkbox Instructions:** Change `[ ]` to `[x]` for every Tizen API and BrightSign feature that applies to your app before pasting the prompt.

---

## Troubleshooting

See [troubleshooting.md](troubleshooting.md) for detailed fixes, including:
- Uncaught `ReferenceError` from unguarded `tizen.`/`webapis.` calls
- Guards that check the wrong global and still throw
- Video that won't autoplay without a remote keypress
- Dead/expired sample media URLs
- DRM playback with no confirmed BrightSign support
- `autorun.zip` that doesn't launch because it's missing the `autozip.brs` wrapper script
- A black screen after `autorun.zip` unpacks successfully (malformed `roHtmlWidget` construction)
- False-positive "dead" media URLs from testing with a bare `curl -I` instead of a real GET request

---

## Next Steps After Migration

1. **Remove dead code** - delete the samsung.js shim, legacy clsid:SAMSUNG-INFOLINK-* embeds, and any now-unused config.xml if they're no longer referenced anywhere
2. **Re-test every remote-key-driven interaction** with a real keyboard, not just visually
3. **Confirm the Chromium vs BrightSign media player choice** is still correct for your final feature set (see ../media-player-selection.md)
4. **Verify DRM support directly with BrightSign** if your CMS plays protected content - don't ship on an assumption
5. **Verify the autorun.zip actually launches and renders on a real device** - unzip it locally first and confirm autozip.brs sits at the top level (not autorun.brs), and double-check autorun.brs's roHtmlWidget construction against the docs (rect first, port as an roMessagePort) before burning a boot cycle on hardware - a malformed call here boots fine but shows a black screen with no error
6. **Load-test 24/7 playback** - Tizen TVs and BrightSign players have different reboot/idle assumptions
7. **Update internal documentation** to reflect the new single-runtime architecture
8. **Set up BrightSign Control** for fleet deployment if you were previously side-loading .wgt files manually
