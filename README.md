<div align="center">

# BrightDev

**Build your BrightSign integration in hours, not weeks.**

[![BrightSign](https://img.shields.io/badge/brightsign.biz-8A2BE2?style=for-the-badge)](https://brightsign.biz) [![BSN.cloud](https://img.shields.io/badge/BSN%20Cloud-49C0FF?style=for-the-badge)](https://www.bsn.cloud/) [![Discussions](https://img.shields.io/badge/Discussions-181717?style=for-the-badge&logo=github)](https://github.com/orgs/BrightDevelopers/discussions)

</div>

BrightDev is your starting point for BrightSign development. Complete SDK, working examples, and documentation that gets you to your first deployment in under 15 minutes.

---

## Getting Started

**Already have an existing application?** Check out our [Migration Guides](#migration-guides) to port your app to BrightSign.

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

> An example prompt for generating BrightSign applications is provided in the [AI-Assisted Development](#ai-assisted-development) section below.

---

## Integrating with Brightsign

Here's the recommended path to go from zero to production:

| Stage | Goal | Start here |
|-------|------|------------|
| **1. Hello Brightsign on Single Player** | Deploy content in under 15 minutes | [Hello BrightSign](examples/hello-brightsign/) |
| **2. Development Environment** | Set up local debugging and iteration | [Development Setup](DEVELOPMENT.md) |
| **3. Multi-Player Deployment** | Scale to a fleet | Coming Soon |
| **4. Production** | Monitoring, metrics, and maintenance | Coming Soon |


---

## Migration Guides

Already have an application built for another platform? Our migration guides help you port existing codebases to BrightSign.

### Kotlin/Android Migration

The [Kotlin Migration Guide](migration-guides/kotlin/) demonstrates two approaches for migrating Android applications to BrightSign:

- **Method 1: Transpilation** (1-2 weeks) - Rapid prototyping by transpiling Kotlin business logic to JavaScript
- **Method 2: Fresh Rebuild** (4-6 weeks) - Production-ready rebuild in JavaScript/Node.js ⭐ **Recommended**

### Coming Soon

We're working on migration guides for:
- **Android WebView** - Migrate Android WebView-based applications
- **Tizen (Samsung)** - Port Samsung Smart Signage Platform apps
- **Flutter/Dart** - Convert Flutter applications to web-based BrightSign apps
- **Java** - Migrate Java applications to JavaScript/Node.js

---

## AI-Assisted Development

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

**Important Note:** The MCP server is a powerful tool that accelerates development, but it doesn't generate perfect code every time. You should:
- **Debug and iterate** on the generated code
- **Test thoroughly** on actual BrightSign hardware
- **Read the documentation** at [docs.brightsign.biz](https://docs.brightsign.biz) to understand BrightSign-specific APIs
- **Refine your prompts** based on the output - be specific about error messages and desired behavior

**Common issues and how to address them:**
- API mismatches: Check [docs.brightsign.biz/developers/player-apis-brightscript-and-javascript](https://docs.brightsign.biz/developers/player-apis-brightscript-and-javascript) for correct syntax
- Module not found errors: Verify you're using BrightSign-supported Node.js modules
- Display issues: Ensure your HTML/CSS accounts for the player's resolution and GPU capabilities

For detailed development environment setup, debugging tools, and logging configuration, see [DEVELOPMENT.md](DEVELOPMENT.md).

---

## Community & Support

- **[GitHub Discussions](https://github.com/orgs/BrightDevelopers/discussions)** — Questions, ideas, show what you're building
- **[BrightSign Documentation](https://docs.brightsign.biz)** — Official BrightSign API and platform documentation
- **[Contributing](CONTRIBUTING.md)** — Found a bug? Have an example?
- **[BrightSign Support Community](https://support.brightsign.biz/hc/en-us/community/topics)** — Hardware, BSN.cloud, and developer support

---

<div align="center">

</div>
