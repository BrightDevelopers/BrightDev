# Method 1: Refactor & Replace

[← Back to Main Guide](README.md)

Systematically identify every Tizen-specific API in your codebase and replace it with its standard web or BrightSign equivalent, guided by the API Mapping Table in CLAUDE.md.

**🎯 Best for**: Tizen web apps built with plain HTML/JS (with or without a game framework like Phaser/MelonJS), including apps still carrying the legacy samsung.js/`clsid:SAMSUNG-INFOLINK-*` shim

**📦 Target Platform**: BrightSign OS - Chromium media player by default (Series 5+), or the native BrightSign media player on Series 4 and earlier (see ../media-player-selection.md). This guide applies to both; only one registry key differs.

## How to Run This

[CLAUDE.md](CLAUDE.md) is a self-contained, self-starting migration prompt - there's no separate prompt to copy, no placeholders to fill in, and nothing to customize first:

1. Copy the entire contents of [CLAUDE.md](CLAUDE.md)
2. Open your AI tool of choice **from the root of the Tizen project you want to migrate** (a real working directory it can read and search, not just a couple of pasted files)
3. Paste CLAUDE.md's contents in as your message and let it run

CLAUDE.md's own "Instructions for the AI Reading This File" section tells the AI to begin the migration immediately rather than just summarize the document - it will inventory your project itself (app name, entry HTML file, every `tizen.`/`webapis.` reference, framework in use, existing migration artifacts) and only ask you about things it genuinely can't determine from the source: your target BrightSign player model/series, whether the deployment has interactive hardware (touchscreen/GPIO), and whichever of the four no-BrightSign-equivalent features it actually finds in your code. It'll ask as many questions as it needs to, across as many turns as it takes.

Before running this:
- ✅ BrightDeveloper MCP server connected (see main [BrightDev README](https://github.com/BrightDevelopers/BrightDev))
- ✅ You're running the AI **from the root of the Tizen project you want to migrate** - it's expected to explore the project itself, not be told what's in it
- ✅ Have BrightSign test hardware available for final validation (any series works - Series 5+ if you're using the default Chromium media player, Series 4 or earlier if you're using the native BrightSign media player instead)
- ✅ Be ready to answer a handful of quick questions once the AI has inspected the project - there's nothing to prepare in advance

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
4. **Verify DRM support directly with BrightSign** (integrations@brightsign.biz) if your CMS plays protected content - don't ship on an assumption
5. **Verify the autorun.zip actually launches and renders on a real device** - unzip it locally first and confirm autozip.brs sits at the top level (not autorun.brs), and double-check autorun.brs's roHtmlWidget construction against the docs (rect first, port as an roMessagePort) before burning a boot cycle on hardware - a malformed call here boots fine but shows a black screen with no error
6. **Load-test 24/7 playback** - Tizen TVs and BrightSign players have different reboot/idle assumptions
7. **Update internal documentation** to reflect the new single-runtime architecture
8. **Set up BrightSign Control** for fleet deployment if you were previously side-loading .wgt files manually
