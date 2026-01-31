<div align="center">

# BrightDev

**Build your BrightSign integration in hours, not weeks.**

[![BrightSign](https://img.shields.io/badge/brightsign.biz-8A2BE2?style=for-the-badge)](https://brightsign.biz) [![BSN.cloud](https://img.shields.io/badge/BSN%20Cloud-49C0FF?style=for-the-badge)](https://www.bsn.cloud/) [![Discussions](https://img.shields.io/badge/Discussions-181717?style=for-the-badge&logo=github)](https://github.com/orgs/BrightDevelopers/discussions)

</div>

BrightDev is your starting point for BrightSign development. Complete SDK, working examples, and documentation that gets you to your first deployment in under 15 minutes.

---

## Getting Started

### Install the Brightsign MCP Server

We wrote this for AI assistants as much as for you. Connect your editor to our MCP server and get working BrightSign code on the first try.

**Claude Code:**
```bash
claude mcp add brightdeveloper-docs --transport http https://brightdeveloper-mcp.bsn.cloud/mcp
```

**VS Code / Cursor:** Add to your MCP settings:
```json
{
  "servers": {
    "brightdeveloper": {
      "type": "http",
      "url": "https://brightdeveloper-mcp.bsn.cloud/mcp"
    }
  }
}
```

An example prompt for generating BrightSign applications is provided in the [AI-Assisted Development](#ai-assisted-development) section below.


## Integrating with Brightsign

Here's the recommended path to go from zero to production:

| Stage | Goal | Start here |
|-------|------|------------|
| **1. Hello Brightsign on Single Player** | Deploy content in under 15 minutes | [Hello BrightSign](examples/hello-brightsign/) |
| **2. Single Player Deployment** | Get your MVP deployed on 1 player | 🚧 Coming Soon |
| **3. Multi-Player Deployment** | Scale to a fleet | 🚧 Coming Soon |
| **4. Production** | Monitoring, metrics, and maintenance | 🚧 Coming Soon |



## Migration Guides

Already have an application built for another platform? Our migration guides help you port existing codebases to BrightSign.

| Platform | Description | Guide |
|----------|-------------|-------|
| **Kotlin/Android** | Migrate Android applications to BrightSign | [Kotlin Migration Guide](migration-guides/kotlin/) |
| **Android WebView** | Migrate Android WebView-based applications | 🚧 Coming Soon |
| **Tizen (Samsung)** | Port Samsung Smart Signage Platform apps | 🚧 Coming Soon |
| **Flutter/Dart** | Convert Flutter applications to web-based apps | 🚧 Coming Soon |
| **Java** | Migrate Java applications to JavaScript/Node.js | 🚧 Coming Soon |


## AI-Assisted Development

The MCP server is a powerful tool that accelerates development, but it doesn't generate perfect code every time. You should:
- **Debug and iterate** on the generated code
- **Test thoroughly** on actual BrightSign hardware
- **Read the documentation** at [docs.brightsign.biz](https://docs.brightsign.biz) to understand BrightSign-specific APIs
- **Refine your prompts** based on the output - be specific about error messages and desired behavior

### Template Prompt for Building BrightSign Applications

Use this template with the BrightDeveloper MCP server to generate BrightSign applications:

```
I want to create a BrightSign application with the following features:
- [Feature 1: e.g., Display rotating images from a remote API]
- [Feature 2: e.g., Show device information (model, serial number, firmware version)]
- [Feature 3: e.g., Play video content on a schedule]
- [Feature 4: e.g., Send analytics to a remote server]

Preferences:
- Platform: [BrightScript / HTML+JavaScript / Node.js v18/14]
- Display Resolution: [1920x1080 / 3840x2160 / other]
- Network Requirements: [WiFi / Ethernet / Both]
- Storage: [Local file system / Cloud-based]

Additional Requirements:
- Include local development setup instructions
- Add debugging and trace logging configuration
- Provide instructions for deploying to BrightSign player
- [Any other specific requirements]
```

**Common issues and how to address them:**
- API mismatches: Check [docs.brightsign.biz/developers/player-apis-brightscript-and-javascript](https://docs.brightsign.biz/developers/player-apis-brightscript-and-javascript) for correct syntax
- Module not found errors: Verify you're using BrightSign-supported Node.js modules
- Display issues: Ensure your HTML/CSS accounts for the player's resolution and GPU capabilities

For detailed development environment setup, debugging tools, and logging configuration, see [DEVELOPMENT.md](DEVELOPMENT.md).


## FAQ

### Should I use BrightScript or JavaScript?

- Use **BrightScript** for: Simple media playback, GPIO control, legacy compatibility
- Use **HTML/JavaScript/Node.js** for: Complex UIs, web content, API integrations, modern web frameworks

See [Player APIs: BrightScript and JavaScript](https://docs.brightsign.biz/developers/player-apis-brightscript-and-javascript) for details.

### How do I find my player's IP address?

1. **No storage boot** - Boot the player without any storage device; it displays its IP on screen
2. **DHCP server** - Check your router's DHCP client list
3. **Local DWS** - If enabled, browse to `brightsign-<SERIAL_NUMBER>.local`
4. **Serial/SSH** - Run `ifconfig` command
5. **BSN.cloud** - View in BrightAuthor:Connected or the BSN.cloud web interface

See [Find a Player's IP Address](https://docs.brightsign.biz/how-tos/find-a-players-ip-address) for details.

### How do I enable the Local Diagnostic Web Server (DWS)?

1. **Via BrightAuthor:Connected** - Enable in your BSN.cloud setup
2. **Via BrightScript/JavaScript** - Enable programmatically in your application
3. **Via Serial Shell**:
    ```
    registry write networking http_server 80
    registry flush
    reboot
    ```

See [DWS Local Access](https://docs.brightsign.biz/advanced/dws-local-access) for details.

### How do I factory reset my player?

1. **SVC + RST Buttons** - Press & hold both buttons together during boot until the red power light rapidly flashes, release buttons and allow player to boot
2. **Via Local DWS** - Control → "Factory Reset"
3. **Via Serial Shell** - `factoryreset confirm`

**Warning:** This erases all content, settings, and user data.

See [Factory Reset a Player](https://docs.brightsign.biz/how-tos/factory-reset-a-player) for details.

### My player is stuck in a reboot loop. How do I recover?

1. **Replace SD card** - Insert a new SD card with recovery content (or no content)
2. **Serial shell recovery** - Connect via serial, press SVC key after "Starting BrightSign application..." message to access the shell

See [Stop a Continuously Rebooting Player](https://docs.brightsign.biz/how-tos/stop-a-continuously-rebooting-player) for details.


## Community & Support

- **[BrightSign Documentation](https://docs.brightsign.biz)** - Official BrightSign API and platform documentation
- **[Contributing](CONTRIBUTING.md)** - Found a bug? Have an example?
- **[BrightSign Support Community](https://support.brightsign.biz/hc/en-us/community/topics)** - Hardware, BSN.cloud, and developer support


<div align="center">

</div>
