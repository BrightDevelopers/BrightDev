# AI Migration Instructions for Samsung Tizen to HTML/JavaScript (BrightSign)

> **Purpose**: This file contains machine-readable instructions, automation rules, and transformation patterns for AI systems performing automated migration of Samsung Tizen web applications to native HTML/JavaScript for BrightSign platforms.
>
> **Human-Readable Guide**: See [README.md](README.md) for the main documentation.

---

## Instructions for the AI Reading This File

If you're seeing this file as attached/loaded project context and the user asks you to migrate, continue, or execute this guide - or if this file was handed to you directly with little or no other message - **do not just summarize it and ask what to do next. Begin the migration now**:

1. Identify the Tizen project in the current working directory - look for `config.xml`, `.wgt`/`.tproject` files, and `tizen.`/`webapis.` references in the source.
2. Work through the "AI Automation Instructions" phases below (1_analysis through 7_handoff) against that project's actual files, applying every rule in the "Architecture Transformation Rules" and "API Mapping Table" sections as you go - don't stop to ask permission for each individual replacement.
3. Whenever you hit one of the four features with no direct BrightSign equivalent - remote color/channel buttons, DRM-protected playback, screensaver/idle suppression, or a Tizen Service app - raise the specific `AI_QUESTION` given for it in the API Mapping Table and wait for an answer before resolving that piece. Everything else, keep moving on your own.
4. Separately, always ask whether this BrightSign deployment has interactive hardware (touchscreen, GPIO buttons/sensors, etc.) before deciding whether media should loop at the end. A Tizen app being remote-interactive is NOT evidence the BrightSign deployment is interactive - BrightSign has no remote-control equivalent at all, so that signal doesn't carry over. Without confirmed interactive hardware, default media playback to loop continuously (typical "set and forget" signage) rather than stopping after one playthrough.
5. Produce the deliverables described in "AI Automation Instructions": refactored HTML/JS, a generated `autorun.brs`, and a deployment-ready `autorun.zip` (`autozip.brs` at the top level, per the packaging pattern below) - not just a plan or a summary.
6. Build the `autorun.zip` package in a separate build/output directory, not in place in the project folder. Never delete, move, or overwrite an existing project file (including the original `.wgt`) as a side effect of packaging or cleanup - if a stray/temp file genuinely needs removing, say out loud what it is and why before removing it.
7. **End your final summary with the exact physical next step, stated as an instruction, not a question.** You cannot deploy to hardware yourself - that's the one part of this task that is inherently the user's to do - but that doesn't mean the migration ends ambiguously. Once the autorun.zip is built, close with something like: "Copy autorun.zip to the root of an SD card (or USB drive), insert it into the BrightSign player, and reboot the player - it will unpack automatically and launch the app." Do not end with "let me know what you'd like to do next" or an open-ended question - the deployment step is known and always the same; say it plainly.

Only stop to ask a general question if there's genuinely no Tizen project in the working directory to migrate, or if you can't find any source files at all. A loaded project with Tizen source in it is not an ambiguous situation - it's the task.

---

## Document Metadata

```json
{
  "document_type": "ai_migration_instructions",
  "version": "1.0",
  "target_platform": "brightsign",
  "source_platform": "tizen",
  "automation_level": "full_auto_with_placeholders",
  "primary_method": "refactor_and_replace",
  "recommended_method": "refactor_and_replace",
  "target_runtime": "chromium_brightsign_or_brightsign_media_player",
  "note": "tizen.*/webapis.* are runtime-injected globals with no BrightSign equivalent, and config.xml's privilege/manifest model has no BrightSign analogue. This is a source-level refactor, not a repackage. target_runtime defaults to Chromium (Series 5+) for these examples, but this entire guide applies equally to Series 4 and earlier - those players just use the default BrightSign media player instead (see the signage_defaults/app_manifest categories in the API mapping table). Player series affects one registry key, not eligibility for this migration."
}
```

---

## Migration Strategy

```json
{
  "migration_approach": {
    "strategy": "refactor_and_replace",
    "difficulty": "low_to_medium",
    "time_to_first_run": "1-2 weeks for a plain HTML/JS app with light Tizen usage; longer if AVPlay/DRM or a Tizen Service app is involved",
    "maintenance_complexity": "low",
    "debugging_ease": "high",
    "brightsign_recommendation": "strongly_recommended",
    "production_ready": true,
    "key_transformations": [
      "guard_or_remove_tizen_and_webapis_globals",
      "replace_avplay_with_html5_video",
      "replace_remote_key_registration_with_keyboard_events",
      "replace_config_xml_manifest_with_autorun_brs",
      "replace_legacy_infolink_plugin_with_video_and_deviceinfo",
      "remove_widget_lifecycle_calls",
      "verify_drm_support_directly_with_brightsign"
    ]
  }
}
```

---

## Architecture Transformation Rules

### Rule 1: Guard or Remove Every tizen./webapis. Reference

```json
{
  "rule_id": "eliminate_unguarded_tizen_globals",
  "description": "tizen and webapis only exist inside the Tizen web runtime. An unguarded reference throws an uncaught ReferenceError that aborts the rest of the enclosing function, silently breaking unrelated code that runs after it.",
  "transformation_steps": [
    {
      "step": "find_all_references",
      "pattern": "grep -rn 'tizen\\.' or 'webapis\\.' across all JS files",
      "action": "List every call site and which startup function it runs in"
    },
    {
      "step": "classify_each_call",
      "pattern": "Does this call have a BrightSign/web-standard replacement (see API Mapping Table) or is it truly Tizen-only?",
      "action": "Mark for replacement or removal"
    },
    {
      "step": "remove_or_replace",
      "action": "Delete Tizen-only calls (widget lifecycle, IR remote registration with no keyboard equivalent) or replace with the mapped BrightSign/standard API"
    },
    {
      "step": "verify_no_dangling_references",
      "pattern": "grep -rn 'tizen\\.' or 'webapis\\.' again",
      "action": "Confirm zero remaining references before moving to manifest conversion"
    }
  ]
}
```

### Rule 2: Convert config.xml Manifest to autorun.brs + Registry

```json
{
  "rule_id": "convert_config_xml_to_autorun",
  "patterns_to_detect": [
    "<tizen:application id=... package=... required_version=.../>",
    "<tizen:privilege name=\"http://tizen.org/privilege/...\"/>",
    "<feature name=\"http://tizen.org/feature/...\"/>",
    "<tizen:profile name=\"tv\"/>"
  ],
  "transformation": {
    "action": "extract_privileges_and_replace_with_autorun_brs",
    "replacement_strategy": "see_api_mapping_table",
    "note": "There is no privilege/feature declaration model on BrightSign - permissions are enforced by registry keys and OS-level settings, not an app-declared manifest."
  }
}
```

### Rule 3: Default Media Playback to Loop Unless the BrightSign Deployment Has Real Interactive Hardware

```json
{
  "rule_id": "default_playback_to_loop_for_signage",
  "description": "Tizen apps are commonly built assuming a remote control as the interaction model - remote-driven menus, pause/resume, navigation. BrightSign has no remote-control equivalent at all (see remote_key_handling category - there is no BrightSign hardware or API for this). That means a Tizen app being remote-interactive is NOT evidence that the resulting BrightSign deployment is interactive. BrightSign digital signage defaults to 'set and forget': content plays continuously with no viewer present, unless the specific deployment adds real interactive hardware of its own - a touchscreen, GPIO buttons/sensors, or similar HID input.",
  "transformation_steps": [
    {
      "step": "identify_end_of_playback_handling",
      "pattern": "webapis.avplay onstreamcompleted, or a <video> 'ended' listener, that calls stop()/pause() or otherwise halts on completion",
      "action": "Do not port the stop-at-end behavior as-is"
    },
    {
      "step": "do_not_infer_interactivity_from_the_tizen_source",
      "action": "Remote-key-driven menus/navigation in the Tizen source are not a signal that this BrightSign deployment is interactive - remote control doesn't carry over to BrightSign at all. Do not use the presence of Tizen remote-key handling to justify skipping the loop default."
    },
    {
      "step": "ask_about_deployment_hardware",
      "action": "Ask whether this specific BrightSign deployment includes a touchscreen, GPIO buttons/sensors, or other interactive input hardware. This is a deployment/hardware fact that cannot be determined from the Tizen source code - always ask if it hasn't already been specified, rather than guessing from how the Tizen app used to behave."
    },
    {
      "step": "default_to_loop",
      "action": "If the deployment has no confirmed interactive hardware (the common case - most BrightSign signage is set-and-forget), default to looping: video.loop = true, or restart playback on 'ended'. Only preserve single-playthrough/stop-at-end behavior if interactive hardware is confirmed and something meaningful is meant to happen when playback ends."
    }
  ]
}
```

---

## Tizen to BrightSign API Mapping Table

```json
{
  "api_mappings": [
    {
      "category": "remote_key_handling",
      "tizen_api": "tizen.tvinputdevice.registerKey()",
      "brightsign_replacement": "window keydown listeners (standard keyboard events)",
      "code_pattern": {
        "tizen": "if (typeof tizen === 'undefined' || !tizen.tvinputdevice) { return; } tizen.tvinputdevice.registerKey('MediaPlay'); tizen.tvinputdevice.registerKey('ColorF1Green');",
        "brightsign": "window.addEventListener('keydown', function(e) { if (e.key === ' ' || e.key === 'MediaPlay') { togglePlayback(); } });"
      },
      "notes": "Guard the Tizen call before removing it entirely. There is no BrightSign equivalent for color/channel buttons since signage players have no IR remote model - only arrow/enter-style navigation keys map cleanly to keyboard events.",
      "requires_user_decision": true,
      "ai_question": "AI_QUESTION: This app registers Tizen remote color/channel buttons, which have no BrightSign hardware or API equivalent. Is this functionality required? If so, how should it be redesigned (e.g. an on-screen control)?"
    },
    {
      "category": "remote_key_handling",
      "tizen_api": "tizen.tvinputdevice.unregisterKey()",
      "brightsign_replacement": "removeEventListener('keydown', handler)",
      "code_pattern": {
        "tizen": "tizen.tvinputdevice.unregisterKey('VolumeUp'); tizen.tvinputdevice.unregisterKey('VolumeDown');",
        "brightsign": "window.removeEventListener('keydown', volumeKeyHandler);"
      }
    },
    {
      "category": "media_playback",
      "tizen_api": "webapis.avplay.open()/prepare()/play()/pause()/stop()",
      "brightsign_replacement": "HTML5 <video> element (.src, .load(), .play(), .pause())",
      "code_pattern": {
        "tizen": "webapis.avplay.open(url); webapis.avplay.prepare(); webapis.avplay.play();",
        "brightsign": "var video = document.getElementById('player'); video.src = url; video.muted = true; video.loop = true; video.play();"
      },
      "notes": "video.muted = true is required to satisfy Chromium's autoplay policy if playback should start without a user gesture - see the worked example below. video.loop = true reflects a default assumption worth calling out: Tizen apps are frequently built as one-shot interactive experiences, but digital signage content is expected to play continuously with no user present. Default to looping unless the app has genuine interactivity around this video - see the signage_defaults category below."
    },
    {
      "category": "media_playback",
      "tizen_api": "webapis.avplay.setDisplayRect(x, y, w, h) / setDisplayArea()",
      "brightsign_replacement": "CSS width/height/position on the <video> element",
      "code_pattern": {
        "tizen": "webapis.avplay.setDisplayRect(0, 0, 1920, 1080);",
        "brightsign": "video.style.position = 'absolute'; video.style.left = '0'; video.style.top = '0'; video.style.width = '1920px'; video.style.height = '1080px';"
      }
    },
    {
      "category": "media_playback",
      "tizen_api": "webapis.avplay.setStreamingProperty('SET_MODE_4K')",
      "brightsign_replacement": "Not needed - Chromium negotiates resolution/decode automatically",
      "code_pattern": {
        "brightsign": "// No call needed; verify 4K decode support for your target player series in HTML Playback by Player Series"
      },
      "notes": "Confirm hardware-accelerated decode support for your target resolution/codec on the specific BrightSign player series you're deploying to."
    },
    {
      "category": "media_playback",
      "tizen_api": "webapis.avplay.setListener({onbufferingstart, onbufferingprogress, onbufferingcomplete, onstreamcompleted, oncurrentplaytime, onerror, ondrmevent})",
      "brightsign_replacement": "<video> element events (waiting, progress, canplay, ended, timeupdate, error)",
      "code_pattern": {
        "tizen": "webapis.avplay.setListener({ onbufferingstart: function() { }, onstreamcompleted: function() { webapis.avplay.stop(); }, oncurrentplaytime: function(t) { }, onerror: function(e) { } });",
        "brightsign": "video.addEventListener('waiting', function() { }); video.addEventListener('timeupdate', function() { }); video.addEventListener('error', function(e) { });"
      },
      "notes": "ondrmevent has no mapping - see the drm category below. It's frequently just a logging stub in Tizen demos, not a real license-server integration, so check whether your CMS actually implements DRM before treating this as a blocker. Do NOT translate onstreamcompleted to an 'ended' handler that pauses/stops - see signage_defaults below for why looping, not stopping, is the right default for signage content."
    },
    {
      "category": "signage_defaults",
      "tizen_api": "N/A - a behavioral default worth flagging, not a specific Tizen API to map",
      "brightsign_replacement": "video.loop = true (or an 'ended' listener that restarts playback) unless the BrightSign deployment has confirmed interactive hardware (touchscreen, GPIO, etc.)",
      "code_pattern": {
        "brightsign": "video.loop = true;\n// Equivalent, if you need an event hook instead:\n// video.addEventListener('ended', function() { video.currentTime = 0; video.play(); });"
      },
      "notes": "Tizen apps are commonly built assuming a remote control as the interaction model. BrightSign has no remote-control equivalent at all, so a Tizen app being remote-interactive is NOT evidence the BrightSign deployment is interactive - that signal simply doesn't carry over. BrightSign signage defaults to 'set and forget': content plays continuously with no viewer present. The only thing that should override the loop default is confirmed interactive hardware on the BrightSign side itself - a touchscreen, GPIO buttons/sensors, or similar HID input - which is a deployment fact, not something inferable from the Tizen source. Always ask whether such hardware is present if it hasn't been specified; do not infer interactivity (or the lack of it) from how the original Tizen app used its remote."
    },
    {
      "category": "media_playback",
      "tizen_api": "<object type='application/avplayer'> embed tag",
      "brightsign_replacement": "<video> element",
      "code_pattern": {
        "tizen": "<object id='av-player' type='application/avplayer' style='width:1920px;height:1080px;'></object>",
        "brightsign": "<video id='player' style='width:1920px;height:1080px;' playsinline></video>"
      }
    },
    {
      "category": "media_playback",
      "tizen_api": "$WEBAPIS/webapis/webapis.js script injection",
      "brightsign_replacement": "Not needed - resolved by the Tizen build/packaging pipeline and doesn't exist outside it",
      "code_pattern": {
        "tizen": "<script src='$WEBAPIS/webapis/webapis.js'></script>",
        "brightsign": "// Remove this script tag entirely"
      },
      "notes": "Even after removing the tizen.*/webapis.* calls that depend on it, leaving this tag in will 404 on BrightSign - it's a build-time macro Tizen's packager resolves, not a real path."
    },
    {
      "category": "drm",
      "tizen_api": "webapis.avplay ondrmevent / Widevine/PlayReady license flow",
      "brightsign_replacement": "Not documented - verify directly with BrightSign before relying on it",
      "code_pattern": {
        "brightsign": "// No confirmed EME/Widevine/PlayReady API found in current BrightSign developer docs at the time this guide was written"
      },
      "notes": "This is the one category in this guide without a verified answer. If your CMS plays DRM-protected content, treat this as an open question for BrightSign rather than assuming Chromium's standard EME surface is fully supported end-to-end.",
      "requires_user_decision": true,
      "ai_question": "AI_QUESTION: This app's DRM/EME support is not documented in current BrightSign developer docs. Does this app play DRM-protected content? If so, this must be verified directly with BrightSign before relying on this migration path."
    },
    {
      "category": "app_manifest",
      "tizen_api": "config.xml (<tizen:application>, <tizen:privilege>, <feature>, <tizen:profile>)",
      "brightsign_replacement": "autorun.brs + roRegistrySection (no manifest/privilege declaration model)",
      "code_pattern": {
        "tizen": "<tizen:application id='MKSuoBISnk.VideoPlayer' package='MKSuoBISnk' required_version='2.3'/> <tizen:privilege name='http://tizen.org/privilege/tv.inputdevice'/> <tizen:profile name='tizen'/>",
        "brightsign": "sub Main()\n  reg = CreateObject(\"roRegistrySection\", \"html\")\n  reg.Write(\"use-brightsign-media-player\", \"0\")\n  reg.Flush()\n\n  msgPort = CreateObject(\"roMessagePort\")\n  vidmode = CreateObject(\"roVideoMode\")\n  r = CreateObject(\"roRectangle\", 0, 0, vidmode.GetResX(), vidmode.GetResY())\n\n  config = { url: \"file:///sd:/index.html\", port: msgPort }\n  h = CreateObject(\"roHtmlWidget\", r, config)\n  h.Show()\n\n  while true\n    msg = wait(0, msgPort)\n  end while\nend sub"
      },
      "notes": "Registry key use-brightsign-media-player = 0 selects the Chromium media player - but this option genuinely does not exist on Series 4 or earlier players, regardless of OS version (confirmed in BrightSign's own docs). If the target player is Series 4 or earlier, skip that registry write entirely (or set it to \"1\", which is the same as omitting it) and use the default BrightSign media player instead - every other part of this pattern (roRectangle, roMessagePort, roHtmlWidget) is unchanged, and standard <video> playback works the same either way. This is a media-decode-engine choice, not a gate on whether this migration guide applies to your player - see ../media-player-selection.md."
    },
    {
      "category": "app_manifest",
      "tizen_api": ".wgt packaging",
      "brightsign_replacement": "autorun.zip containing autozip.brs (unpack script) + autorun.brs (app entry point) + app files, deployed via SD/USB or BrightSign Control",
      "code_pattern": {
        "brightsign": "// autozip.brs - top-level unpack script, cannot reference any other file in the archive:\npackage = CreateObject(\"roBrightPackage\", \"SD:/autorun.zip\")\npackage.Unpack(\"SD:/\")\nMoveFile(\"SD:/autorun.zip\", \"SD:/autorun.zip_invalid\")\nRebootSystem()"
      },
      "notes": "The final deliverable is a single autorun.zip, but it must contain autozip.brs at the top level, not autorun.brs directly - autozip.brs is the only file the player auto-decompresses before running it, so its only job is to unpack the rest of the zip (your real autorun.brs, index.html, js/, assets/) to storage and reboot. After reboot the player finds the now-unpacked autorun.brs and runs it normally - that's the one from the config.xml mapping above (registry write + roHtmlWidget). See Autorun Files (https://docs.brightsign.biz/develop/autorun-files)."
    },
    {
      "category": "app_lifecycle",
      "tizen_api": "Common.API.Widget.sendReadyEvent()/blockNavigation()/sendReturnEvent()/sendExitEvent()",
      "brightsign_replacement": "Not needed - no widget lifecycle handshake with an OS shell",
      "code_pattern": {
        "tizen": "widgetAPI.sendReadyEvent();",
        "brightsign": "// Remove; the app is considered running as soon as autorun.brs loads it"
      }
    },
    {
      "category": "app_lifecycle",
      "tizen_api": "tizen.application.getCurrentApplication().exit()",
      "brightsign_replacement": "Not typically needed (signage players run 24/7)",
      "code_pattern": {
        "tizen": "if (keyCode === TIZEN_KEY_RETURN) { tizen.application.getCurrentApplication().exit(); }",
        "brightsign": "// Signage apps generally shouldn't self-exit; if you need to reset state, reload the page instead"
      }
    },
    {
      "category": "legacy_plugin",
      "tizen_api": "clsid:SAMSUNG-INFOLINK-PLAYER (.Play(url), .SetDisplayArea(x,y,w,h), .Stop(), .Pause())",
      "brightsign_replacement": "HTML5 <video> element",
      "code_pattern": {
        "tizen": "document.getElementById('player').Play(url); document.getElementById('player').SetDisplayArea(0, 0, 1920, 1080);",
        "brightsign": "var video = document.getElementById('player'); video.src = url; video.play(); video.style.cssText = 'position:absolute;left:0;top:0;width:1920px;height:1080px;';"
      },
      "notes": "This is a 2011-2013-era ActiveX-like shim, often still present as dead code in older partner codebases. If you see classid=\"clsid:SAMSUNG-INFOLINK-...\" anywhere, it can be deleted along with its polyfill and replaced outright."
    },
    {
      "category": "legacy_plugin",
      "tizen_api": "clsid:SAMSUNG-INFOLINK-NETWORK (.GetIP(), .GetMAC())",
      "brightsign_replacement": "@brightsign/deviceinfo or @brightsign/networkconfiguration (Node.js)",
      "code_pattern": {
        "tizen": "var ip = document.getElementById('network').GetIP(); var mac = document.getElementById('network').GetMAC();",
        "brightsign": "// Requires Node.js enabled (nodejs_enabled: true) in autorun.brs\nconst NetworkConfiguration = require('@brightsign/networkconfiguration'); const netConfig = new NetworkConfiguration();"
      }
    },
    {
      "category": "legacy_plugin",
      "tizen_api": "clsid:SAMSUNG-INFOLINK-TVMW (.GetFirmware(), .GetEpochTime())",
      "brightsign_replacement": "@brightsign/deviceinfo (osVersion, bootVersion) + Date.now()",
      "code_pattern": {
        "tizen": "var fw = document.getElementById('tvmw').GetFirmware(); var epoch = document.getElementById('tvmw').GetEpochTime();",
        "brightsign": "const DeviceInfo = require('@brightsign/deviceinfo'); const deviceInfo = new DeviceInfo(); const fw = deviceInfo.osVersion; const epoch = Date.now();"
      }
    },
    {
      "category": "signage_device_control",
      "tizen_api": "Common.API.Plugin.setOnScreenSaver()/setOffScreenSaver(), setOnIdleEvent()/setOffIdleEvent()",
      "brightsign_replacement": "Not applicable - no screensaver/idle timeout to suppress",
      "code_pattern": {
        "tizen": "pluginAPI.setOnScreenSaver();",
        "brightsign": "// Remove; BrightSign players don't run a screensaver, so there's nothing to disable"
      },
      "requires_user_decision": true,
      "ai_question": "AI_QUESTION: This app calls Tizen screensaver/idle-suppression APIs, which have no BrightSign equivalent because BrightSign doesn't run a screensaver. Confirm it's safe to simply remove these calls for this app rather than assuming it."
    },
    {
      "category": "signage_device_control",
      "tizen_api": "webapis.audiocontrol.getVolume()/setVolume()/getMute()/setMute()",
      "brightsign_replacement": "Native HTMLMediaElement.volume / .muted",
      "code_pattern": {
        "tizen": "webapis.audiocontrol.setVolume(80); webapis.audiocontrol.setMute(true);",
        "brightsign": "video.volume = 0.8; video.muted = true;"
      },
      "notes": "This one is simpler than it looks on Tizen: the Chromium media player's <video>/<audio> elements already expose volume/mute natively, so no BrightSign-specific API call is needed at all."
    },
    {
      "category": "signage_device_control",
      "tizen_api": "webapis.tv.info.getModel()/getProduct()",
      "brightsign_replacement": "@brightsign/deviceinfo (model, family, serialNumber) or roDeviceInfo",
      "code_pattern": {
        "tizen": "var model = webapis.tv.info.getModel(); var product = webapis.tv.info.getProduct();",
        "brightsign": "const DeviceInfo = require('@brightsign/deviceinfo'); const deviceInfo = new DeviceInfo(); const model = deviceInfo.model;"
      }
    },
    {
      "category": "dual_app_model",
      "tizen_api": "<tizen:service> background Node.js Service app (onStart/onRequest/onExit)",
      "brightsign_replacement": "Not directly portable - closest is nodejs_enabled in the same roHtmlWidget",
      "code_pattern": {
        "tizen": "module.exports.onRequest = function() { };",
        "brightsign": "// autorun.brs: config = { nodejs_enabled: true, nodejs_main_script: \"app.js\" }\n// app.js runs in the same runtime as the page, not a separate background process"
      },
      "notes": "This is a structurally different model, not a drop-in replacement. A Tizen Service app is a genuinely separate background process managed by the OS; BrightSign's Node.js integration shares a single runtime with the page. Redesign this piece rather than porting it line-for-line.",
      "requires_user_decision": true,
      "ai_question": "AI_QUESTION: This app uses a separate Tizen Service app with no direct BrightSign equivalent. Describe what it does and propose a redesign around nodejs_enabled in the same roHtmlWidget - do not implement it without confirmation."
    },
    {
      "category": "dual_app_model",
      "tizen_api": "document.addEventListener('tizenvisibilitychange', handler)",
      "brightsign_replacement": "document.addEventListener('visibilitychange', handler)",
      "code_pattern": {
        "tizen": "document.addEventListener('tizenvisibilitychange', function(event) { if (event.detail.visible) { resume(); } });",
        "brightsign": "document.addEventListener('visibilitychange', function() { if (!document.hidden) { resume(); } });"
      },
      "notes": "tizenvisibilitychange exists only because Samsung's own docs describe standard visibilitychange as unreliable at launch time on Tizen. The standard event works normally outside Tizen, so no special handling is needed."
    }
  ]
}
```

---

## Code Transformation Patterns

### Pattern 1: Guard Every tizen./webapis. Reference Before Removing It

```json
{
  "rule": "guard_before_remove",
  "steps": [
    {
      "detect": "Any bare reference to tizen. or webapis. in a startup path (onload, $(document).ready, top-level script execution)",
      "pattern": "tizen.tvinputdevice.registerKey(...) with no preceding typeof check",
      "extract": ["The enclosing function", "Everything that runs after the unguarded call in that function"]
    },
    {
      "action": "Add a typeof/existence guard before removing the call outright, so you can confirm nothing downstream depended on it silently succeeding",
      "example": {
        "before": "tizen.tvinputdevice.registerKey('ColorF1Green');",
        "after": "if (typeof tizen !== 'undefined' && tizen.tvinputdevice) { tizen.tvinputdevice.registerKey('ColorF1Green'); }"
      }
    },
    {
      "action": "Once verified safe, replace the guarded block with its BrightSign/standard-API equivalent from the API Mapping Table, or delete it if there is none",
      "note": "Don't leave a dead guarded block - either it maps to something or it doesn't belong in this build"
    }
  ]
}
```

### Pattern 2: Watch for Guards That Check the Wrong Global

```json
{
  "rule": "fix_broken_guards",
  "description": "A guard is only as good as the global it actually checks. A guard that checks tizen but then dereferences webapis unconditionally still throws.",
  "detect": {
    "patterns": [
      "(window.tizen && window.webapis.avplay) || {}",
      "any pattern that short-circuits on one global but dereferences a different, unchecked one"
    ]
  },
  "transformation": {
    "before": "this.api = (window.tizen && window.webapis.avplay) || {};",
    "after": "this.api = (window.tizen && window.webapis && window.webapis.avplay) || {};",
    "steps": [
      "Identify every global the expression actually dereferences",
      "Make sure each one is checked before use, not just the first one in the chain",
      "Prefer guarding again at the call site rather than relying on an empty-object fallback to mask missing functionality"
    ]
  }
}
```

### Pattern 3: Replace webapis.avplay with a `<video>` Element

```json
{
  "rule": "replace_avplay_with_video_element",
  "tizen_code": {
    "setup": "webapis.avplay.open(url); webapis.avplay.setDisplayRect(0, 0, 1920, 1080); webapis.avplay.prepare(); webapis.avplay.play();"
  },
  "brightsign_replacement": {
    "html": "<video id='player' style='width:1920px;height:1080px;'></video>",
    "javascript": "var video = document.getElementById('player'); video.src = url; video.muted = true; video.addEventListener('loadedmetadata', function() { video.play(); });"
  },
  "notes": "Autoplay in Chromium requires muted = true unless playback starts from a user gesture. If your Tizen app only ever started playback from a remote PLAY keydown, add this explicit .play() call - don't assume it happens automatically outside Tizen."
}
```

### Pattern 4: Convert config.xml to autorun.brs

```json
{
  "rule": "convert_config_xml_to_autorun_brs",
  "tizen_code": {
    "config_xml": "<tizen:privilege name='http://tizen.org/privilege/tv.inputdevice'/> <tizen:profile name='tizen'/>"
  },
  "brightsign_replacement": {
    "autorun_brs": "sub Main()\n  reg = CreateObject(\"roRegistrySection\", \"html\")\n  reg.Write(\"use-brightsign-media-player\", \"0\")\n  reg.Flush()\n\n  msgPort = CreateObject(\"roMessagePort\")\n  vidmode = CreateObject(\"roVideoMode\")\n  r = CreateObject(\"roRectangle\", 0, 0, vidmode.GetResX(), vidmode.GetResY())\n\n  config = { url: \"file:///sd:/index.html\", port: msgPort }\n  h = CreateObject(\"roHtmlWidget\", r, config)\n  h.Show()\n\n  while true\n    msg = wait(0, msgPort)\n  end while\nend sub"
  },
  "notes": "CreateObject(\"roHtmlWidget\", ...) requires an roRectangle as its first argument and an associative array as the second - it is NOT a single associative array with a port number. port must be an roMessagePort object (for catching load-started/load-finished/load-error events), not an integer - don't confuse it with the unrelated web-inspector debug port. Verify against the roHtmlWidget and Autorun Files docs before treating any autorun.brs as final; a malformed CreateObject call here renders nothing and produces a black screen with no error message. There's no privilege string to carry over - BrightSign doesn't gate JS APIs behind a manifest declaration. If a Tizen privilege corresponds to real functionality (e.g. tv.inputdevice), what changes is the API you call, not a permission you request. The use-brightsign-media-player write shown here is for Series 5+ targets only - on Series 4 or earlier, omit it (or write \"1\"); the rest of this autorun.brs is identical either way."
}
```

### Pattern 5: Remove Widget Lifecycle Calls

```json
{
  "rule": "remove_widget_lifecycle_calls",
  "reason": "Common.API.Widget and tizen.application.getCurrentApplication().exit() assume an OS shell managing your app's ready/foreground/exit state, which BrightSign doesn't have.",
  "steps": [
    {
      "action": "Identify widget lifecycle calls",
      "pattern": "widgetAPI.sendReadyEvent() / blockNavigation() / sendReturnEvent() / sendExitEvent(), tizen.application.getCurrentApplication().exit()"
    },
    {
      "action": "Delete sendReadyEvent/sendExitEvent calls outright",
      "note": "The app is considered running as soon as it loads; there's no ready handshake to perform"
    },
    {
      "action": "Replace blockNavigation only if it was preventing an unwanted back/return action",
      "note": "BrightSign HTML apps don't have a system back button to block by default"
    }
  ]
}
```

---

## Migration Validation Framework

```json
{
  "validation_framework": {
    "pre_migration_checks": [
      {
        "check_id": "detect_tizen_webapis_usage",
        "description": "Find every tizen./webapis. reference",
        "command": "grep -rn \"tizen\\.\\|webapis\\.\" --include=\"*.js\" .",
        "validation": "All Tizen API usage identified and documented",
        "failure_action": "AI_QUESTION: Document all Tizen/webapis usage before proceeding"
      },
      {
        "check_id": "inventory_config_xml_privileges",
        "description": "List every tizen:privilege/feature/profile in config.xml",
        "command": "grep -n \"tizen:privilege\\|feature name\\|tizen:profile\" config.xml",
        "validation": "Full privilege/feature inventory created",
        "failure_action": "Document manifest requirements for replacement strategy"
      },
      {
        "check_id": "detect_legacy_infolink_plugin",
        "description": "Check for legacy clsid:SAMSUNG-INFOLINK-* plugin usage",
        "command": "grep -rn \"SAMSUNG-INFOLINK\" .",
        "validation": "All legacy plugin usage identified",
        "failure_action": "AI_PLACEHOLDER: Confirm legacy plugin code is dead/unused before deleting"
      },
      {
        "check_id": "detect_avplay_and_drm",
        "description": "Check for webapis.avplay and any DRM/license-server wiring",
        "command": "grep -rn \"avplay\\|ondrmevent\\|drm\" --include=\"*.js\" .",
        "validation": "AVPlay/DRM usage identified and DRM dependency flagged for direct verification with BrightSign",
        "failure_action": "AI_QUESTION: Does this app play DRM-protected content? If so, verify Chromium EME/Widevine/PlayReady support with BrightSign directly."
      },
      {
        "check_id": "flag_features_with_no_brightsign_equivalent",
        "description": "Confirm every detected feature with no direct BrightSign equivalent was raised as an explicit AI_QUESTION rather than silently dropped, redesigned, or assumed",
        "features_to_check": ["remote_color_channel_buttons", "drm_protected_playback", "screensaver_idle_suppression", "tizen_service_app"],
        "validation": "An AI_QUESTION exists for each of the four features that is actually present in this app",
        "failure_action": "AI_QUESTION: [Name the specific no-equivalent feature found] has no direct BrightSign equivalent - confirm with the user how to proceed before continuing"
      }
    ],
    "compilation_checks": [
      {
        "check_id": "no_tizen_references_remain",
        "description": "Ensure no tizen./webapis. references remain after refactor",
        "command": "grep -rn \"tizen\\.\\|webapis\\.\" --include=\"*.js\" .",
        "validation": "Zero remaining Tizen API references",
        "failure_action": "Replace or remove remaining references per the API Mapping Table"
      },
      {
        "check_id": "no_dollar_webapis_script_tag",
        "description": "Ensure the $WEBAPIS script injection tag is removed",
        "command": "grep -rn \"\\$WEBAPIS\" --include=\"*.html\" .",
        "validation": "No $WEBAPIS script tags remain",
        "failure_action": "Remove <script src='$WEBAPIS/...'> tags"
      }
    ],
    "runtime_checks": [
      {
        "check_id": "local_browser_test_with_tizen_undefined",
        "description": "Test in Chrome/Edge with tizen and webapis genuinely undefined",
        "validation": "App runs without uncaught ReferenceError",
        "failure_action": "AI_PLACEHOLDER: Find and guard/remove the remaining unguarded reference"
      },
      {
        "check_id": "autoplay_policy_check",
        "description": "Verify video playback starts as expected without relying on a remote PLAY keydown",
        "validation": "Video plays via muted autoplay or an explicit in-app control, not a Tizen remote key",
        "failure_action": "AI_PLACEHOLDER: Add muted autoplay or an on-screen/keyboard play control"
      },
      {
        "check_id": "brightsign_device_test",
        "description": "Test on actual BrightSign player",
        "validation": "App runs on BrightSign hardware",
        "failure_action": "AI_PLACEHOLDER: Debug BrightSign-specific issues"
      }
    ],
    "brightsign_specific_checks": [
      {
        "check_id": "autorun_brs_configured",
        "description": "Verify autorun.brs launches the app correctly",
        "validation": "autorun.brs exists and configured properly",
        "required_fields": ["roHtmlWidget or nodejs_enabled", "url or nodejs_main_script", "registry write use-brightsign-media-player 0 - Series 5+ targets only, omit on Series 4 or earlier since the option doesn't exist there"],
        "failure_action": "AI_PLACEHOLDER: Create autorun.brs from template"
      },
      {
        "check_id": "autorun_zip_structure_correct",
        "description": "Verify the final deployment package is a correctly structured autorun.zip",
        "validation": "autorun.zip contains autozip.brs at the top level (not autorun.brs directly); autozip.brs references no other file and only unpacks + reboots; the real autorun.brs, index.html, and assets are bundled alongside it for autozip.brs to unpack",
        "required_fields": ["autozip.brs (top-level unpack script)", "autorun.brs (real entry point, unpacked by autozip.brs)", "index.html and app assets"],
        "failure_action": "AI_PLACEHOLDER: The player looks for autozip.brs specifically inside autorun.zip - restructure the package so autozip.brs is present at the zip root"
      },
      {
        "check_id": "brightsign_apis_work",
        "description": "Test BrightSign device APIs replacing legacy Tizen calls",
        "apis_to_test": ["deviceinfo (model/getProduct replacement)", "audio volume/mute (if used)", "networkconfiguration (if legacy INFOLINK-NETWORK usage existed)"],
        "validation": "All BrightSign APIs return expected data",
        "failure_action": "AI_PLACEHOLDER: Debug BrightSign API integration"
      }
    ]
  }
}
```

---

## Common Pitfalls and Solutions

```json
{
  "common_pitfalls": [
    {
      "pitfall": "Leaving an unguarded tizen./webapis. call anywhere in a startup function",
      "impact": "Uncaught ReferenceError aborts the rest of that function silently - this reliably breaks keydown listener attachment, video initialization, and any other setup code that happens to run after the offending line",
      "solution": "Guard every reference with a typeof/existence check, then replace or remove it",
      "detection": "grep -rn \"tizen\\.\\|webapis\\.\" --include=\"*.js\" ."
    },
    {
      "pitfall": "Writing a guard that checks one global but dereferences a different, unchecked one",
      "impact": "The guard looks defensive but still throws (e.g. (window.tizen && window.webapis.avplay) || {} throws if webapis itself is undefined)",
      "solution": "Check every global the expression actually dereferences, not just the first one in the chain"
    },
    {
      "pitfall": "Assuming a remote PLAY keydown will still trigger playback outside Tizen",
      "impact": "Video never starts because nothing in the app calls .play() itself",
      "solution": "Add an explicit muted autoplay call (or an in-app control) - a normal keyboard has no key mapped to Tizen's MediaPlay keycode"
    },
    {
      "pitfall": "Porting Tizen's stop-at-end / single-playthrough behavior (onstreamcompleted calling stop(), or an 'ended' handler that pauses) unchanged, or assuming a remote-interactive Tizen app means the BrightSign deployment is interactive too",
      "impact": "Content plays once and then sits on a dead frame instead of looping - the Tizen app's remote-driven interactivity doesn't carry over (BrightSign has no remote equivalent at all), so treating it as evidence the deployment is interactive silently produces exactly this bug",
      "solution": "Default to video.loop = true (or restart playback on 'ended'). Only skip the loop if confirmed interactive hardware (touchscreen, GPIO, etc.) is present on the BrightSign side - ask about that directly rather than inferring it from how the Tizen app used its remote"
    },
    {
      "pitfall": "Treating config.xml privilege strings as something to port",
      "impact": "There's nothing to port - BrightSign has no manifest/privilege model at all",
      "solution": "Map the underlying functionality (not the privilege string) to its BrightSign/standard-API replacement"
    },
    {
      "pitfall": "Silently removing or redesigning remote color/channel button logic without asking",
      "impact": "The developer loses functionality (or gets an unrequested redesign) without ever being told there was no BrightSign equivalent to begin with",
      "solution": "Raise an explicit AI_QUESTION describing the feature and ask whether it's required and how to redesign it - do not resolve this one unilaterally"
    },
    {
      "pitfall": "Assuming Widevine/PlayReady DRM will just work through Chromium's standard EME",
      "impact": "No confirmed support was found in current BrightSign developer documentation",
      "solution": "Raise an explicit AI_QUESTION and verify directly with BrightSign before committing a DRM-dependent CMS feature to this migration",
      "note": "Don't guess here - this is the one area of this guide without a verified answer"
    },
    {
      "pitfall": "Silently deleting screensaver/idle-suppression calls without confirming it's safe",
      "impact": "Usually harmless since BrightSign has nothing to suppress, but the developer should confirm this assumption for their specific app rather than have it made for them",
      "solution": "Raise an explicit AI_QUESTION confirming removal is safe before deleting these calls"
    },
    {
      "pitfall": "Porting a Tizen Service app as if it maps to a BrightSign background process",
      "impact": "BrightSign's Node.js integration shares a runtime with the page; there's no separate background process to receive the ported logic",
      "solution": "Raise an explicit AI_QUESTION describing what the Service app does and propose a redesign using nodejs_enabled in the same roHtmlWidget - wait for confirmation before implementing it"
    },
    {
      "pitfall": "Leaving a dead <object classid='clsid:SAMSUNG-INFOLINK-...'> embed and its polyfill in the codebase",
      "impact": "Confuses future maintainers into thinking it's load-bearing when it's usually 2011-2013-era dead code with a working <video> already alongside it",
      "solution": "Delete the legacy embed and its shim once confirmed unused; replace any real calls with a <video> element"
    },
    {
      "pitfall": "Zipping the real autorun.brs directly into autorun.zip without an autozip.brs wrapper",
      "impact": "The player looks for a script named exactly autozip.brs inside autorun.zip, not autorun.brs - it won't find or run one packed at the wrong name, so the app never launches and the player falls through to on-screen Player Setup or provisioning",
      "solution": "Include the standard autozip.brs unpack boilerplate at the zip's top level (it just unpacks the rest of the archive and reboots); put the real autorun.brs alongside the app files it unpacks",
      "detection": "unzip -l autorun.zip | grep autozip.brs"
    },
    {
      "pitfall": "Constructing roHtmlWidget as CreateObject(\"roHtmlWidget\", { url: ..., port: <integer> }) - a single associative array with no rectangle",
      "impact": "roHtmlWidget requires an roRectangle as its first argument; passing only an associative array produces a malformed widget that renders nothing - a black screen with no error printed anywhere, which is very hard to diagnose from the symptom alone",
      "solution": "Always pass CreateObject(\"roHtmlWidget\", rect, config) with rect built from roRectangle (ideally sized from roVideoMode.GetResX()/GetResY() rather than hardcoded), and put port: <roMessagePort> inside config rather than confusing it with a debug/inspector port number",
      "note": "Verify this pattern against the roHtmlWidget and Autorun Files docs (or the brightsign/dev-cookbook html-starter example) before treating any generated autorun.brs as final - do not hand-write this from memory"
    },
    {
      "pitfall": "Trusting a bare curl -I HEAD request to decide whether a sample/CMS media URL is dead",
      "impact": "Some CDNs and demo hosts return 403 on a plain HEAD request or non-browser User-Agent even though the file serves fine to a real <video> element's GET+Range request - treating that 403 as proof of death risks swapping a working URL for a different one that may itself rot later",
      "solution": "Verify with a GET request using a browser User-Agent and a Range header (e.g. curl -A \"Mozilla/5.0\" -r 0-1024 <url>), or just load the URL in an actual browser, before concluding a media URL is dead and replacing it"
    },
    {
      "pitfall": "Deleting, moving, or overwriting existing project files (e.g. the original .wgt build artifact) as a side effect of building the BrightSign deployment package",
      "impact": "Irreversible loss of a file that may not be tracked in git and may not be trivially reproducible - a cleanup command targeting a scratch file can just as easily remove the source project's own .wgt instead if it isn't scoped carefully",
      "solution": "Build the autorun.zip package in a separate build/dist directory (or the scratchpad, if using one) rather than manipulating files in place in the project directory. Never run a delete/move/overwrite command against an existing project file without first confirming out loud what it is and that it's safe to touch"
    }
  ]
}
```

---

## Example Transformation: Complete App

```json
{
  "example": "complete_tizen_to_brightsign_transformation",
  "scenario": "A standard <video>-tag Tizen video player with remote-key playback controls",
  "tizen_structure": {
    "files": [
      "index.html",
      "js/main.js (app initialization, unguarded tizen.tvinputdevice.registerKey call)",
      "js/player.js (playback controller, driven only by remote keydown)",
      "config.xml (tizen:privilege tv.inputdevice)"
    ]
  },
  "brightsign_structure": {
    "files": [
      "autorun.zip",
      "  autozip.brs (top-level unpack script - unzips the files below to SD:/ and reboots)",
      "  autorun.brs (registry write for Chromium player + roHtmlWidget, runs after unpacking)",
      "  index.html",
      "  js/main.js (guarded/removed tizen.tvinputdevice.registerKey reference)",
      "  js/player.js (muted autoplay added in the loadedmetadata listener)"
    ]
  },
  "transformation_summary": [
    "Guarded (then removed) an unguarded tizen.tvinputdevice.registerKey() call in app initialization, which was aborting the rest of startup before the video player ever initialized",
    "Added video.muted = true; video.play(); inside the loadedmetadata listener, since the app only ever triggered playback from a remote PLAY/PLAYPAUSE keydown that a normal keyboard doesn't produce",
    "Replaced a dead placeholder video URL with https://www.w3schools.com/html/mov_bbb.mp4, a long-standing, still-working sample - verified with a GET request using a browser User-Agent, not a bare HEAD request (see the note on verifying media URLs below)",
    "Converted config.xml's single tv.inputdevice privilege into an autorun.brs that writes use-brightsign-media-player = 0 and loads index.html via roHtmlWidget",
    "Packaged autorun.brs, index.html, and js/ alongside the standard autozip.brs boilerplate into a single autorun.zip for deployment"
  ]
}
```

---

## AI Automation Instructions

```json
{
  "ai_instructions": {
    "methodology": "systematic_refactoring",
    "process": [
      {
        "phase": "1_analysis",
        "tasks": [
          "Scan codebase for all tizen. and webapis. references",
          "Inventory config.xml privilege/feature/profile declarations",
          "Identify legacy clsid:SAMSUNG-INFOLINK-* plugin usage",
          "Identify webapis.avplay usage and any DRM/license-server wiring",
          "Classify which remote-key codes are functionally necessary vs decorative",
          "Check for a Tizen Service app (<tizen:service>) or tizenvisibilitychange usage"
        ]
      },
      {
        "phase": "2_guard_and_verify",
        "tasks": [
          "Wrap every tizen./webapis. reference in a typeof/existence guard",
          "Check any existing guard for the broken-guard pattern (checks one global, dereferences another)",
          "Confirm in a plain browser (tizen/webapis genuinely undefined) that no uncaught ReferenceError remains"
        ]
      },
      {
        "phase": "3_api_replacement",
        "tasks": [
          "Replace webapis.avplay calls with a <video> element + native events",
          "Ask whether the BrightSign deployment has interactive hardware (touchscreen, GPIO, etc.) - do not infer this from the Tizen app's remote-control usage, since remote interactivity has no BrightSign equivalent and is not evidence either way",
          "Default end-of-playback behavior to looping (video.loop = true, or restart on 'ended') unless interactive hardware is confirmed - don't carry over Tizen's stop-at-end default unexamined",
          "Replace <object type='application/avplayer'> with <video>",
          "Replace remote-key registration with keydown/keyup listeners where a keyboard equivalent exists; remove where it doesn't",
          "Replace legacy clsid:SAMSUNG-INFOLINK-* plugin calls with <video> and @brightsign/deviceinfo",
          "Replace webapis.audiocontrol volume/mute calls with native HTMLMediaElement.volume/.muted",
          "Replace webapis.tv.info.getModel/getProduct with @brightsign/deviceinfo",
          "Remove Common.API.Widget lifecycle calls and tizen.application.getCurrentApplication().exit()",
          "Replace tizenvisibilitychange with standard visibilitychange"
        ]
      },
      {
        "phase": "4_manifest_and_packaging",
        "tasks": [
          "Convert config.xml privilege/feature declarations into an autorun.brs, using CreateObject(\"roHtmlWidget\", rect, config) with a real roRectangle as the first argument - never a bare associative array - and verify the pattern against the roHtmlWidget/Autorun Files docs before treating it as final",
          "If targeting Series 5 or later, write the use-brightsign-media-player registry key as 0 to select Chromium. If targeting Series 4 or earlier, omit this write entirely (or write \"1\") - Chromium video decode does not exist on those players regardless of OS version, so the app must use the default BrightSign media player instead; standard <video> playback and everything else in this guide is unaffected. See ../media-player-selection.md.",
          "In a separate build/output directory (not in place in the project folder), assemble a single autorun.zip: the standard autozip.brs unpack script at the zip's top level, plus autorun.brs, index.html, and all app assets for it to unpack",
          "Verify autozip.brs references no other file in the archive (it's the only file the player auto-decompresses before running it)",
          "Do not delete, move, or overwrite any existing project file (including the original .wgt) while building the package"
        ]
      },
      {
        "phase": "5_brightsign_integration",
        "tasks": [
          "Add @brightsign/deviceinfo (and @brightsign/networkconfiguration if legacy INFOLINK-NETWORK calls existed)",
          "Add muted autoplay (or an explicit in-app control) anywhere playback previously depended on a remote PLAY keydown",
          "If replacing a hardcoded/dead sample media URL, verify the replacement with a GET request using a browser User-Agent (not a bare HEAD request, which false-positives as dead on some CDNs)",
          "If a Tizen Service app was in use, redesign it around nodejs_enabled in the same roHtmlWidget rather than porting it as-is"
        ]
      },
      {
        "phase": "6_testing",
        "tasks": [
          "Test in Chrome/Edge locally with tizen and webapis genuinely undefined",
          "Test on actual BrightSign hardware and confirm the roHtmlWidget actually renders content, not just that autorun.zip unpacked",
          "Verify all remaining playback, input, and device-info features work",
          "Confirm DRM-dependent features (if any) have been verified directly with BrightSign, not assumed"
        ]
      },
      {
        "phase": "7_handoff",
        "tasks": [
          "End the final summary with the exact physical next step, stated as a plain instruction, not a question",
          "Example closing line: 'Copy autorun.zip to the root of an SD card (or USB drive), insert it into the BrightSign player, and reboot the player - it will unpack automatically and launch the app.'",
          "Do not end with 'let me know what you'd like to do next' or any other open-ended question - hardware deployment is the one step that is inherently the user's to perform, but the instruction for it is always the same and should be stated with confidence"
        ]
      }
    ],
    "ai_placeholders": {
      "use_when": "Implementation requires user decision or testing",
      "format": "// AI_PLACEHOLDER: [Description of what needs attention]",
      "examples": [
        "AI_PLACEHOLDER: Test remote-key-driven navigation with a real keyboard on BrightSign hardware",
        "AI_PLACEHOLDER: Verify 4K decode support on the target player series",
        "AI_PLACEHOLDER: Confirm autoplay policy behavior on the actual BrightSign device"
      ]
    },
    "user_questions": {
      "use_when": "Critical information missing that AI cannot determine, and always for any feature with no direct BrightSign equivalent - never silently drop or assume an answer for these",
      "format": "AI_QUESTION: [Question for user]",
      "always_ask_for": [
        "remote_color_channel_buttons",
        "drm_protected_playback",
        "screensaver_idle_suppression",
        "tizen_service_app",
        "interactive_hardware_present_on_deployment"
      ],
      "examples": [
        "AI_QUESTION: This app registers Tizen remote color/channel buttons, which have no BrightSign hardware or API equivalent. Is this functionality required? If so, how should it be redesigned?",
        "AI_QUESTION: Does this app play DRM-protected content? BrightSign's DRM/EME support is not confirmed in current docs - this must be verified directly with BrightSign.",
        "AI_QUESTION: This app calls Tizen screensaver/idle-suppression APIs, which have no BrightSign equivalent. Confirm it's safe to simply remove these calls.",
        "AI_QUESTION: This app uses a separate Tizen Service app with no direct BrightSign equivalent. Describe what it does and propose a redesign before implementing it.",
        "AI_QUESTION: Does this BrightSign deployment have interactive hardware (touchscreen, GPIO buttons/sensors, etc.)? The Tizen source uses remote-control input, but that has no BrightSign equivalent and isn't evidence either way - without confirmed interactive hardware, media playback will default to looping continuously rather than stopping after one playthrough.",
        "AI_QUESTION: What BrightSign player model/series are you targeting?"
      ]
    }
  }
}
```

---

## Tizen Runtime Limitations Reference

```json
{
  "tizen_runtime_not_portable": {
    "reason": "tizen.*/webapis.* are runtime-injected globals with no BrightSign equivalent, and config.xml's privilege/manifest model has no BrightSign analogue",
    "limitations": [
      "tizen and webapis globals only exist inside the Tizen web runtime - referencing them elsewhere throws, it doesn't fail gracefully",
      "webapis.avplay's DRM support (ondrmevent) has no confirmed BrightSign equivalent",
      "IR remote color/channel button codes have no BrightSign hardware equivalent - signage players aren't remote-controlled",
      "Tizen Service apps (separate background Node.js process) have no direct BrightSign analogue",
      "config.xml privilege/feature declarations gate nothing on BrightSign - there's no manifest model to port"
    ],
    "recommended_alternative": "Native HTML/JS on BrightSign's Chromium engine, using standard web APIs plus @brightsign/* device APIs where Tizen exposed proprietary device functionality",
    "benefits_of_alternative": [
      "Runs on standard, well-documented web APIs instead of a proprietary runtime",
      "No manifest/privilege model to maintain",
      "Works with keyboard/mouse/touch input rather than a remote-control keycode table",
      "Single shared runtime - no separate background service process to manage"
    ]
  }
}
```

---

## Summary

This document provides comprehensive AI-readable instructions for migrating Samsung Tizen web applications to native HTML/JavaScript on BrightSign platforms. The migration involves:

1. **Global elimination**: Every `tizen.`/`webapis.` reference guarded, replaced, or removed
2. **Media playback replacement**: `webapis.avplay` → standard `<video>` + MSE
3. **Manifest conversion**: `config.xml` privilege/feature declarations → `autorun.brs` + registry keys
4. **Lifecycle removal**: Widget-lifecycle handshake calls deleted outright
5. **Packaging**: `.wgt` → a single `autorun.zip` containing the standard `autozip.brs` unpack script plus the real `autorun.brs`, `index.html`, and app assets
6. **Open questions flagged**: DRM support in particular is not documented and must be verified directly with BrightSign, not assumed - along with remote color/channel buttons, screensaver/idle suppression, and any Tizen Service app

The result is a cleaner, standards-based codebase that runs on BrightSign's Chromium engine without depending on a proprietary runtime or manifest model.
