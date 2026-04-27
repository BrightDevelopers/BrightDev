# Media Player Selection on BrightSign Series 5

BrightSign Series 5 players can run HTML content using either the **Chromium media player** or the **BrightSign media player**. The choice is a deployment-time setting in `autorun.brs` that determines which web features and streaming types your app can use. Pick before you start migrating.

---

## Default: Chromium Media Player

The migration guides in this repository default to the **Chromium media player** (`use-brightsign-media-player = "0"`), which provides full modern web API support: service workers, Cache API, IndexedDB, Web Notifications, standard HTML5 video, and so on. This is the right choice for the majority of web-based migration use cases.

The Chromium media player is **only available on Series 5 players and later**. Series 4 and earlier do not support it.

---

## When to Use the BrightSign Media Player Instead

Switch back to the default BrightSign media player if your application requires any of the following:

- **Series 4 (or earlier) player support**: The Chromium media player is not available on these devices. Remove the registry write entirely and the player will use the BrightSign media player by default.
- **HDMI input passthrough**: Capturing and displaying an HDMI input source requires the BrightSign media player. The Chromium media player does not expose HDMI input.
- **Synchronized playback**: Features like `roSyncManager` and Genlock (PTP-based frame-accurate sync over Ethernet) only work with the BrightSign media player.
- **UDP/RTP streaming**: Streaming via `roMediaStreamer` (TS files over UDP/RTP) and `roRtspStream` (UDP, RTP, HLS, HTTP streams) require the BrightSign media player.
- **Chroma key / video transparency**: Luma and chroma key compositing via BrightSign's HWZ video transparency extensions are only available with the BrightSign media player.
- **Broader hardware-accelerated decode support**: The BrightSign media player supports more video decode levels and profiles than Chromium. If you are playing uncommon codecs or profiles, you may need it.

---

## How to Switch Back

Remove the registry write from `autorun.brs`, or explicitly set it to `"1"`:

```brightscript
' Option 1: Delete the key (reverts to default BrightSign media player)
registrySection = CreateObject("roRegistrySection", "html")
registrySection.Delete("use-brightsign-media-player")
registrySection.Flush()

' Option 2: Explicitly set to BrightSign media player
registrySection = CreateObject("roRegistrySection", "html")
registrySection.Write("use-brightsign-media-player", "1")
registrySection.Flush()
```

When using the BrightSign media player, Chromium-specific web features (service workers, Cache API, etc.) will not be available.

---

## Further Reading

- [HTML Playback Options on Series 5 Players](https://docs.brightsign.biz/developers/html-playback-options-on-series-5-players) - official BrightSign documentation comparing the two players.
