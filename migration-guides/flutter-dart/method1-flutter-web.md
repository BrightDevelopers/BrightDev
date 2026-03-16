# Method 1: Flutter Web to BrightSign Adaptation

[Back to Main Guide](README.md)

You already did the hard work. Your Flutter app runs. The `flutter build web` command produced a `build/web/` directory. Method 1 takes that output and makes it work on a BrightSign player.

This is not a rewrite. It is an adaptation. The code stays Flutter. The logic stays Dart-compiled. You are adjusting the edges: how the app launches, how fonts load, how video plays, what gets stripped out. The AI handles most of this automatically.

- **Best for**: Existing Flutter Web apps that you want running on BrightSign with minimal changes
- **Target platform**: BrightSign Chromium (Series 4 and Series 5)

Before using the prompt below:
- Ensure the [BrightDeveloper MCP server](https://github.com/BrightDevelopers/BrightDev/blob/main/README.md#install-the-brightsign-mcp-server) is connected
- Have your Flutter project accessible in the workspace (either source or `build/web/` output)
- If you are using an AI agent other than Claude, include the [CLAUDE.md](CLAUDE.md) file in your prompt context so the agent has access to the transformation patterns

---

> For details on what `flutter build web` produces and how the renderer situation has evolved, see [What Flutter Web Actually Compiles To](README.md#what-flutter-web-actually-compiles-to) in the main guide.

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

## Configure Your Project Details

Fill in the values below before running the migration prompt. These let the AI tailor the output to your specific setup.

| Setting | Your Value | Example |
|---------|-----------|---------|
| **Target BrightSign Model** | _fill in_ | `XT1144`, `HD1024`, `Series 5` |
| **Flutter Project Path** | _fill in_ | `/home/dev/my_flutter_app` |
| **Target Video Mode** | _fill in_ | `1920x1080x60p`, `3840x2160x60p` |
| **Network Connectivity** | _fill in_ | `offline`, `ethernet`, `wifi` |

> Replace the `{PLACEHOLDER}` tokens in the prompt below with your values before pasting.

---

## The AI Migration Prompt

**This prompt automates the entire adaptation process. Fill in the placeholders and paste it:**

```
Fetch and internalize the automation patterns at
https://raw.githubusercontent.com/BrightDevelopers/BrightDev/main/migration-guides/flutter-dart/CLAUDE.md
before doing anything else.
If the URL is not yet live, check for a local copy at
../BrightDev/migration-guides/flutter-dart/CLAUDE.md relative to the project root.

Your task is to adapt the Flutter Web app in this workspace for deployment
on a {TARGET_BRIGHTSIGN_MODEL} digital signage player using Method 1
(Flutter Web Adaptation). Work autonomously, discover everything you need
by reading the codebase.

Target video mode: {TARGET_VIDEO_MODE}
Network: {NETWORK_CONNECTIVITY}

Success condition: Create a brightsign/ folder at the project root
containing everything needed for an SD card deployment in the exact
structure required. The brightsign/ folder IS the SD card:
- Copy its contents directly to the card root
- Insert the card into the player and reboot
- The app runs
- The build/web/ directory must not be modified during Phases 2-4
- A fresh flutter build web in Phase 1 is expected and allowed

Phase 1 - Discover the project

- Verify pubspec.yaml exists in the current directory (stop if missing)
- Read pubspec.yaml for app name and dependencies
- Run flutter --version
- If build/web/ is missing, run flutter build web
- Detect renderer from canvaskit/ subdirectory presence
- Check flutter_bootstrap.js for useLocalCanvasKit
- Scan for service workers, CDN references, and incompatible plugins
- Search source for video_player, @brightsign imports, and routing

Phase 2 - Build the brightsign/ output folder

- Copy build/web/ into a new brightsign/ directory
- Do NOT modify main.dart.js, assets/, or canvaskit/ (sealed artifacts)
- In brightsign/ wrapper files only, apply all transformations from CLAUDE.md:
  - Remove service worker registration
  - Delete flutter_service_worker.js and manifest.json
  - Remove CDN font links from index.html
  - Set viewport and body CSS to target resolution
  - Patch CanvasKit CDN fallback to local path
  - Add video z-index fix if video_player is used

Phase 3 - Add deployment files to brightsign/

- Write autorun.brs using the appropriate CLAUDE.md template
- Create brightsign-dumps/ with .gitkeep for crash logs
- Write webpack.config.js if @brightsign/* APIs are used

Phase 4 - Validate

- No CDN URLs in index.html, flutter_bootstrap.js, or flutter.js
- No active service worker registration
- All asset paths are relative
- build/web/ is untouched
- Run brightsign_specific_checks from CLAUDE.md

Phase 5 - Generate build script

- Write build-brightsign.js (Node.js) that automates Phases 1-4

Output

1. Phase 1 discovery summary
2. File tree of brightsign/
3. List of transformations applied
4. Content of brightsign/autorun.brs
5. webpack.config.js (if applicable)
6. Phase 4 validation report
7. SD card copy and boot instructions
```

---

For known quirks (font loading, service workers, CanvasKit, video overlays), plugin compatibility tables, and common troubleshooting, see **[Troubleshooting](troubleshooting.md)**.

---

## Next Steps After Migration

1. **Test in Chrome first**: Load `index.html` in a desktop Chrome tab from a local server (`python3 -m http.server 8080` or similar). Confirm the app works before deploying to hardware.
2. **Deploy to BrightSign**: Copy the SD card package to your player and power it on.
3. **Connect Chrome DevTools**: Open `[DEVICE_IP]:2999` in Chrome to access the remote debugger.
4. **Check the console**: Look for any errors on first run and address them.
5. **Test extended playback**: Let the player run for several hours and verify stability, especially if your app loops content.
6. **Consider Method 2**: If you hit persistent issues or need BrightSign device APIs that Flutter Web cannot access, [Method 2](method2-fresh-rebuild.md) is the path forward.
