// flutter_bootstrap.js - BrightSign adapted version
//
// Changes from original:
// - Removed serviceWorkerSettings block (BrightSign Chromium does not support service workers)
// - Removed serviceWorkerVersion reference
// - Engine initializes directly without waiting for service worker activation
//
// Original source: build/web/flutter_bootstrap.js
// Migration rule applied: remove_service_worker (Rule 1 from CLAUDE.md)

{{flutter_js}}
{{flutter_build_config}}

_flutter.loader.load({
  onEntrypointLoaded: async function(engineInitializer) {
    let appRunner = await engineInitializer.initializeEngine();
    await appRunner.runApp();
  }
});
