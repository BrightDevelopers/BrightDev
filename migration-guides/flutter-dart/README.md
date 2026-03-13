# Flutter/Dart to BrightSign Migration Guide

**🤖 AI-First Migration**: This guide is designed for AI-assisted migration. Instead of manually executing steps, you'll work with AI agents (like Claude via the BrightDeveloper MCP) to automate the entire migration process. For machine-readable patterns and automation schemas, see [CLAUDE.md](CLAUDE.md).

If you have not set up the BrightDeveloper MCP Server yet, follow the instructions in the [Installing the MCP server](https://github.com/BrightDevelopers/BrightDev/blob/main/README.md#install-the-brightsign-mcp-server) section of the main BrightDev README file.

> Note that not everything generated using AI agents and the BrightDeveloper MCP may be perfect on the first try. You may need to iterate with the AI, provide additional context, or make manual adjustments as needed.

---

## Why Flutter Web Maps Well to BrightSign

Think of Flutter Web as a painting app. It draws your entire UI onto a canvas using WebGL and WebAssembly. Your screens are not HTML elements stacked on a page. They are pixels rendered frame by frame by a rendering engine called CanvasKit.

BrightSign players run a modern Chromium browser. They support WebGL. They support WebAssembly. That canvas Flutter paints on? BrightSign can display it.

This is the key insight: Flutter Web's output is standard web content. HTML, JavaScript, CSS, and a WebAssembly bundle. BrightSign speaks all of those languages fluently.

The translation is not perfect. Flutter Web expects a browser. BrightSign is a browser, but one built for a screen that never sleeps and never shows a URL bar. The differences are manageable. Most of them come down to a handful of patterns you need to change.

---

## What Flutter Web Actually Compiles To

When you run `flutter build web`, Flutter produces a `build/web/` directory. Here is what is inside:

```
build/web/
├── index.html          # Entry point - Flutter bootstraps from here
├── main.dart.js        # Your compiled Dart code (with HTML renderer)
├── flutter.js          # Flutter engine loader
├── flutter_bootstrap.js # Initialization script
├── canvaskit/          # WebAssembly rendering engine (CanvasKit renderer)
│   ├── canvaskit.js
│   └── canvaskit.wasm
└── assets/             # Fonts, images, and other assets
    └── AssetManifest.json
```

The renderer choice matters for BrightSign. Flutter supports two:

- **CanvasKit (default)**: Uses WebAssembly and WebGL to render. Higher fidelity, heavier initial load. Works on BrightSign Series 4 and 5.
- **HTML renderer**: Uses standard HTML elements, CSS, and a minimal amount of canvas. Lighter, faster to load. Better choice for most signage apps.

For digital signage, the HTML renderer is usually the right call. Signage apps tend to be simpler visually than consumer apps. The HTML renderer loads faster, uses less memory, and is more predictable on a device that runs continuously.

---

## Your Two Options

### Method 1: Flutter Web Adaptation (Recommended Starting Point)

You already built and tested your Flutter app. The `build/web/` output exists. Method 1 takes that output and adapts it for BrightSign.

You are not rewriting anything. You are adjusting. Remove service workers. Handle font loading differently. Inject the right video playback approach. Create an `autorun.brs` to launch the page. Package it for an SD card.

This is the right choice if:
- Your app runs well as Flutter Web
- You want to minimize the amount of code you touch
- You are comfortable that Flutter's rendering model is good enough for your signage use case

**[Method 1: Flutter Web Adaptation](method1-flutter-web.md)**

### Method 2: Fresh HTML/JS/Node.js Rebuild (Maximum Control)

Sometimes the right move is to step back from Flutter entirely and rebuild the signage functionality in plain HTML, CSS, and JavaScript.

Flutter carries overhead. The CanvasKit WASM bundle is several megabytes. The rendering engine adds a CPU and memory tax. For a signage screen that shows a video, some text, and maybe a data feed, that overhead is not earning its keep.

Method 2 uses AI to analyze your Flutter/Dart source code, extract the business logic and UI intent, and rebuild it as native web code optimized for BrightSign.

This is the right choice if:
- You need to use BrightSign-specific device APIs directly
- Your signage display is simple enough that Flutter's abstraction is working against you
- Long-term, you want web developers to own the code without needing a Flutter environment

**[Method 2: Fresh HTML/JS/Node.js Rebuild](method2-fresh-rebuild.md)**

---

## Choosing Your Path

| Your Goal | Recommended Method |
|-----------|-------------------|
| Get running on BrightSign with minimal changes | [Method 1: Flutter Web Adaptation](method1-flutter-web.md) |
| Rapid prototype to prove the concept | [Method 1: Flutter Web Adaptation](method1-flutter-web.md) |
| Maximum performance on constrained hardware | [Method 2: Fresh Rebuild](method2-fresh-rebuild.md) |
| Use BrightSign device APIs (serial, GPIO, etc.) | [Method 2: Fresh Rebuild](method2-fresh-rebuild.md) |
| Long-term maintainability for a web team | [Method 2: Fresh Rebuild](method2-fresh-rebuild.md) |
| Video-heavy signage with precise playback control | [Method 2: Fresh Rebuild](method2-fresh-rebuild.md) |

When in doubt, start with Method 1. It is reversible. You can always rebuild later with Method 2 once you understand what your signage app actually needs.

---

## Key Differences: Flutter Web vs. BrightSign

| Aspect | Flutter Web | BrightSign |
|--------|-------------|------------|
| **Rendering engine** | CanvasKit (WebGL/WASM) or HTML renderer | Chromium - supports both, but HTML renderer preferred |
| **Navigation** | Navigator 2.0, go_router, deep links | None of these apply. One screen, always on. |
| **State management** | Provider, Riverpod, Bloc, GetX | Not needed at the framework level. Use simple JS or a tiny pub/sub. |
| **Platform APIs** | flutter_platform_channel, dart:io | `@brightsign/*` Node.js modules (deviceinfo, videooutput, etc.) |
| **Video playback** | video_player package (web: HTML5 video) | HTML5 `<video>` element directly, or BrightSign VideoOutput API |
| **Deployment** | Hosted web server or CDN | SD card with `autorun.brs` launcher |

The navigation and state management rows are the most important. Signage apps are not user-driven apps. There is rarely a reason to route between screens or manage complex reactive state. The Flutter patterns for those things add weight without adding value.

---

## Tips for Best Results

1. **Build with the HTML renderer first**: Run `flutter build web --web-renderer html` before starting the migration. Smaller output, easier to adapt.
2. **Test in Chrome before BrightSign**: The migration output should work in a desktop Chrome tab. Fix problems there first, then deploy to the player.
3. **Describe your app's purpose clearly**: Tell the AI what the screen is supposed to show. The more context, the better the migration plan.
4. **List your Flutter packages**: Some packages have web implementations, some do not. The AI needs to know what you are using to plan the right replacements.
5. **Specify your BrightSign model**: Series 4 and Series 5 have different capabilities. Knowing the target hardware helps the AI configure the right autorun.brs.
6. **Mention video requirements explicitly**: Video playback is the trickiest part of any signage migration. Be specific about formats, sources, and looping behavior.
7. **Use remote debugging**: Chrome DevTools on port 2999 is your best tool for diagnosing issues on the device. The AI can help you set this up.
8. **Iterate with the AI**: The first pass will get you close. The second pass gets you there. Do not expect perfection from a single prompt.

---

## Resources

- [BrightSign JavaScript API Documentation](https://docs.brightsign.biz/developers/javascript-apis/)
- [BrightSign Node.js Support](https://docs.brightsign.biz/developers/nodejs)
- [Debugging HTML/Node.js Apps on BrightSign](https://docs.brightsign.biz/developers/debugging-htmlnode-apps)
- [BrightSign Developer Cookbook](https://github.com/brightsign/dev-cookbook)
- [Flutter Web Documentation](https://docs.flutter.dev/platform-integration/web)
- [Flutter Web Renderers](https://docs.flutter.dev/platform-integration/web/renderers)
