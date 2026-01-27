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

---

## Integrating with Brightsign

Here's the recommended path to go from zero to production:

| Stage | Goal | Start here |
|-------|------|------------|
| **1. Hello Brightsign** | Deploy content in under 15 minutes | [Hello BrightSign](examples/hello-brightsign/) |
| **2. Single Player Deployment** | Connect your CMS to one player | [gopurple SDK](https://github.com/BrightDevelopers/gopurple) |
| **3. Multi-Player Deployment** | Scale to a fleet | [Scaling examples](https://github.com/BrightDevelopers/gopurple/tree/main/examples) |
| **4. Production** | Monitoring, metrics, and maintenance | [Operations guide](https://github.com/BrightDevelopers/technical-documentation) |


---

## Community & Support

- **[GitHub Discussions](https://github.com/orgs/BrightDevelopers/discussions)** — Questions, ideas, show what you're building
- **[Technical Documentation](https://github.com/BrightDevelopers/technical-documentation)** — Full GO reference docs
- **[Contributing](CONTRIBUTING.md)** — Found a bug? Have an example?
- **[BrightSign Support](https://www.brightsign.biz/support/)** — Hardware and BSN.cloud support

---

<div align="center">

</div>
