# Troubleshooting: Tizen to BrightSign Migration

Common issues encountered when migrating a Samsung Tizen HTML/JS app to BrightSign, and how to fix them.

[← Back to Main Guide](README.md)
[← Back to Migration Guide](method1-refactor.md)

---

## Startup & Script Errors

### Error: "tizen is not defined" / "webapis is not defined"

**Symptom**: The app loads a blank/frozen screen, or key features (navigation, video) silently don't work, with `Uncaught ReferenceError: tizen is not defined` (or `webapis is not defined`) in the console.

**Cause**: `tizen` and `webapis` are runtime-injected globals that only exist inside the Tizen web runtime. Any unguarded reference throws immediately, which aborts the rest of the enclosing function - including code that has nothing to do with Tizen. A common pattern: an app's startup sequence never reaches its player/UI initialization because an earlier, unrelated-looking `tizen.`/`webapis.` reference threw first - or a video player's setup code calls `webapis.avplay.setListener()` unconditionally at page load, before any user interaction, killing the whole app before it ever renders.

**Solution**:
1. Find every reference: `grep -rn "tizen\.\|webapis\." --include="*.js" .`
2. For each one, wrap it in a guard before deciding whether to replace or remove it:
```javascript
// Before
tizen.tvinputdevice.registerKey('ColorF1Green');

// After
if (typeof tizen !== 'undefined' && tizen.tvinputdevice) {
  tizen.tvinputdevice.registerKey('ColorF1Green');
}
```
3. Once guarded, replace the call with its BrightSign/standard-API equivalent from [CLAUDE.md](CLAUDE.md)'s API Mapping Table, or delete it if there is none.
4. Re-test in a plain desktop browser with `tizen`/`webapis` genuinely undefined to confirm nothing else throws.

---

### My guard doesn't seem to help - it still throws

**Symptom**: You've added a `typeof tizen !== 'undefined'` guard, but the app still throws a different `TypeError` from the same code path.

**Cause**: The guard checks one global but unconditionally dereferences a different, unchecked one. This is a real pattern seen in Tizen codebases:
```javascript
// Looks defensive, but isn't:
this.api = (window.tizen && window.webapis.avplay) || {};
```
If `window.tizen` is undefined, the `&&` short-circuits and `window.webapis.avplay` is never evaluated - safe. But if `window.tizen` happens to be truthy while `window.webapis` itself is undefined, this throws `TypeError: Cannot read properties of undefined (reading 'avplay')`. A related variant is even worse: `this.api = (window.tizen && window.tizen.tvinputdevice) || {}` falls back to `{}` safely, but a later call to a method like `this.getSupportedKeys()` on that empty object throws `TypeError: this.getSupportedKeys is not a function` immediately after.

**Solution**: Check every global the expression actually dereferences, not just the first one in the chain:
```javascript
// Fixed
this.api = (window.tizen && window.webapis && window.webapis.avplay) || {};
```
Then guard every call site on `this.api` too - an empty-object fallback silently no-ops instead of crashing, which can hide missing functionality just as easily as it hides the crash.

---

## Video Playback Issues

### Video won't start playing automatically

**Symptom**: The player initializes without errors, but video never starts unless you manually call `.play()` from the console.

**Cause**: Many Tizen apps only ever trigger playback from a remote-control keydown (`MediaPlay`/`PlayPause`, keycodes like `10252`/`415`), which a normal keyboard doesn't produce. Nothing in the app calls `.play()` on its own.

**Solution**: Add an explicit autoplay call once metadata is ready. Chromium's autoplay policy requires the video to be muted if playback starts without a user gesture:
```javascript
videoElem.addEventListener('loadedmetadata', function() {
  videoElem.muted = true;
  videoElem.play();
});
```

---

### Video plays once and stops instead of looping

**Symptom**: Playback works correctly, but the content plays exactly once and then sits on the final frame (or a black screen) instead of continuing - the player needs a reboot or manual reload to play again.

**Cause**: The Tizen source's `onstreamcompleted`/`ended` handling (calling `stop()`/`pause()`) was ported over literally. That's the right behavior for an interactive Tizen app that expects a viewer to press a remote button next, but digital signage defaults to the opposite: content is meant to play continuously with no one there to press anything. Critically, **the fact that the original Tizen app was remote-interactive doesn't mean your BrightSign deployment is interactive** - BrightSign has no remote-control equivalent at all, so that signal from the source code doesn't tell you anything about the actual deployment.

**Solution**: Default to looping unless this specific BrightSign deployment has real interactive hardware (a touchscreen, GPIO buttons/sensors, etc.):
```javascript
videoElem.loop = true;
// Or, if you need an event hook (e.g. to also reset other UI state):
videoElem.addEventListener('ended', function() {
  videoElem.currentTime = 0;
  videoElem.play();
});
```
If you're not sure whether the deployment has interactive hardware, ask - it's a hardware/deployment fact, not something answerable from the app's source code.

---

### Sample or CMS media URL returns 403 / fails to load

**Symptom**: `webapis.avplay.onerror` fires, or the `<video>` element's `error` event fires, immediately on load.

**Cause**: Not always Tizen-specific - old Tizen sample apps commonly hardcode a demo video URL pointing at long-expired test infrastructure (some now return 403/404). If you're porting a real CMS, check whether any hardcoded/demo URLs are still pointing at dead infrastructure before assuming the player itself is broken.

**Solution**: Swap it for a known-working sample, such as `https://www.w3schools.com/html/mov_bbb.mp4`. Verify whichever URL you use with a **GET request using a browser User-Agent and a Range header**, not a bare `curl -I` HEAD request:
```bash
curl -A "Mozilla/5.0" -r 0-1024 -o /dev/null -w "%{http_code}\n" <url>
```
A plain `curl -I` can return 403 on some CDNs/demo hosts even when the file plays fine in a real `<video>` element - so don't let a HEAD-only check talk you out of a URL that actually works, or into swapping to one that only looks fine because you tested it wrong.

---

## Remote & Input Handling

### Color/channel buttons don't do anything

**Symptom**: Navigation that relied on Tizen's `ColorF1Green`/`ColorF2Yellow`/`ColorF3Blue`/`ChannelUp`/`ChannelDown` keys has no effect on BrightSign.

**Cause**: `tizen.tvinputdevice.registerKey()` and Tizen's color/channel keycodes assume a physical IR TV remote. BrightSign players target digital signage, not remote-controlled TVs, and have no equivalent hardware input or JS API for it. Only a keyboard-style subset (arrows, enter, escape) maps cleanly to standard `keydown` events.

**Solution**: Either drop this functionality if it's not load-bearing for your CMS, or redesign it as an on-screen touch/click control. Don't try to force a 1:1 keycode mapping - there isn't one.

---

### DRM-protected content won't play

**Symptom**: Content that plays fine under Tizen's `webapis.avplay` DRM flow won't play (or you're unsure whether it will) once ported to a standard `<video>` element.

**Cause**: No Widevine/PlayReady/EME support is documented in BrightSign's current developer documentation. In many Tizen apps, `ondrmevent` is typically just a logging stub with no real license-server integration, so confirm whether your CMS actually implements DRM before treating this as a blocker.

**Solution**: Treat this as an open question, not an assumed API mapping. Verify directly with BrightSign whether and how DRM-protected playback is supported before committing a DRM-dependent feature to this migration.

---

## Device & Manifest

### Screensaver/idle-suppression code has no effect

**Symptom**: Calls that used to suppress Tizen's screensaver (`setOnScreenSaver()`/`setOffScreenSaver()`/`setOnIdleEvent()`) do nothing on BrightSign, good or bad.

**Cause**: BrightSign players don't run a screensaver or idle-timeout behavior in the first place - there's nothing to suppress.

**Solution**: Remove these calls entirely; they're a no-op at best and dead code at worst.

---

### Privileges from config.xml don't seem to "port"

**Symptom**: Unsure what to do with `tizen:privilege`/`tizen:feature`/`tizen:profile` entries when writing `autorun.brs`.

**Cause**: BrightSign has no manifest/privilege declaration model. Permissions are enforced at the registry/OS level, not requested per-app.

**Solution**: Ignore the privilege strings themselves - map the underlying functionality they gated (e.g. `tv.inputdevice` → keyboard event listeners) to its BrightSign/standard-API replacement per [CLAUDE.md](CLAUDE.md)'s API Mapping Table.

---

## Packaging & Deployment

### autorun.zip doesn't launch the app - player falls through to Player Setup or provisioning

**Symptom**: You copied an `autorun.zip` onto the SD/USB drive, but the player boots straight to on-screen Player Setup (or just never launches your app) instead of running it.

**Cause**: The player only unpacks a zip named `autorun.zip` if it contains a script named exactly `autozip.brs` at the top level - not `autorun.brs`. `autozip.brs` is the only file the player automatically decompresses before running it, so it can't reference any other file in the archive; its entire job is to unpack everything else to storage and reboot. If your real `autorun.brs` was zipped in directly (with no `autozip.brs` wrapper), the player never finds what it's looking for.

**Solution**: Structure the package as:
```
autorun.zip
├── autozip.brs   (top-level unpack script - see below)
├── autorun.brs   (your real BrightSign entry point)
├── index.html
└── js/, css/, assets/...
```
`autozip.brs` boilerplate (from BrightSign's own documentation - shouldn't normally need modification):
```brightscript
package = CreateObject("roBrightPackage", "SD:/autorun.zip")
package.Unpack("SD:/")
MoveFile("SD:/autorun.zip", "SD:/autorun.zip_invalid")
RebootSystem()
```
This unpacks the zip's contents to the root of the storage device, renames the zip so it doesn't re-trigger on the next boot, and reboots. On that next boot, the player finds the now-unpacked `autorun.brs` (the one that writes the `use-brightsign-media-player` registry key and launches `roHtmlWidget`) and runs it normally. See [Autorun Files](https://docs.brightsign.biz/develop/autorun-files) for the full spec.

---

### autorun.zip unpacks fine, but the screen stays black

**Symptom**: The player reboots after unpacking `autorun.zip` (so `autozip.brs` clearly worked), but nothing ever displays - just a black screen, with no error printed anywhere.

**Cause**: `autorun.brs` constructed the `roHtmlWidget` incorrectly. The real signature is `CreateObject("roHtmlWidget", rect As roRectangle, properties As roAssociativeArray)` - it needs a real `roRectangle` as its **first** argument. A common mistake is passing a single associative array with no rectangle at all, e.g. `CreateObject("roHtmlWidget", { port: 2999 })` - that's not a valid call, and it silently produces a widget that renders nothing. `port` is also easy to get wrong: it must be an `roMessagePort` object (so the script can catch `load-started`/`load-finished`/`load-error` events), not a plain integer - don't confuse it with the unrelated web-inspector debug port setting.

**Solution**: Use the documented pattern:
```brightscript
sub Main()
  reg = CreateObject("roRegistrySection", "html")
  reg.Write("use-brightsign-media-player", "0")
  reg.Flush()

  msgPort = CreateObject("roMessagePort")
  vidmode = CreateObject("roVideoMode")
  r = CreateObject("roRectangle", 0, 0, vidmode.GetResX(), vidmode.GetResY())

  config = { url: "file:///sd:/index.html", port: msgPort }
  h = CreateObject("roHtmlWidget", r, config)
  h.Show()

  while true
    msg = wait(0, msgPort)
  end while
end sub
```
Sizing the rectangle from `roVideoMode.GetResX()`/`GetResY()` instead of hardcoding 1920x1080 also avoids letterboxing or a black screen on a player with a different native resolution. See [roHtmlWidget](https://docs.brightsign.biz/develop/rohtmlwidget) and [Autorun Files](https://docs.brightsign.biz/develop/autorun-files), or the [brightsign/dev-cookbook html-starter example](https://github.com/brightsign/dev-cookbook/tree/main/examples/browser/html-starter), for a verified reference. Don't hand-write this from memory - a malformed `CreateObject` call here fails completely silently.

Note: the `use-brightsign-media-player` write above is only valid on Series 5+. On Series 4 or earlier, omit it (that option doesn't exist there regardless of OS version) - the rest of the script is unchanged, and the app will use the default BrightSign media player.

---

### The AI deleted a project file while building the deployment package

**Symptom**: A file that existed before the migration session (commonly the original Tizen `.wgt` build artifact) is missing afterward, and it wasn't a file the AI created.

**Cause**: An overly broad or careless cleanup/rename command run as part of packaging (e.g. an `rm -f` intended for a scratch file that matched or was confused with an existing project file).

**Solution**: This should not happen - the guide's automation instructions explicitly say to build `autorun.zip` in a separate output directory and never delete/move/overwrite an existing project file during packaging. If it happens anyway: check whether the file is tracked in git (`git status`/`git log -- <file>`) before assuming it's unrecoverable, and if it's a Tizen `.wgt`, remember it's just a zip export of the same `config.xml`/`index.html`/`css/`/`js/` source - it can usually be re-exported from the Tizen IDE/CLI even if the binary itself is gone for good.

---

## Background/Service Model

### Logic that ran in a separate Tizen Service app doesn't run

**Symptom**: Background logic that used to run in a Tizen `<tizen:service>` Node.js process (declared via `onStart`/`onRequest`/`onExit`) has no obvious place to live once ported.

**Cause**: BrightSign has no separate background-process model. Its Node.js integration shares a single runtime with the page (enabled via `nodejs_enabled` in the `roHtmlWidget` config), not a distinct OS-managed process like Tizen's Service app.

**Solution**: Don't try to port the Service app 1:1. Redesign the logic to run inside the same `roHtmlWidget`'s Node.js context alongside the page.

---

## Getting More Help

1. Check [BrightSign's developer documentation](https://docs.brightsign.biz/) for the latest on the specific API you're replacing
2. Review [../media-player-selection.md](../media-player-selection.md) if you're unsure whether Chromium or the BrightSign media player is the right choice
3. Search the [BrightSign Developer Cookbook](https://github.com/brightsign/dev-cookbook) for worked examples
4. Ask in the BrightSign Partners support community
5. Contact BrightSign support directly for anything not covered in current documentation (notably DRM/EME support, which this guide could not confirm)
