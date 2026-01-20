# Tools - Developer Productivity Tools

Tools to accelerate BrightSign development—from AI assistance to CLI utilities.

---

## Available Tools

### [mcp-server/](mcp-server/) - MCP Server for AI Assistants

**What it is:** Model Context Protocol server that gives AI coding assistants direct access to BrightSign documentation.

**Supported AI assistants:**
- Claude Code (CLI)
- VS Code with Claude extension
- Zed editor
- Any MCP-compatible tool

**Why use it:**
- AI can query BrightSign docs in real-time
- Generate accurate integration code
- No copy-pasting docs into chat
- Always up-to-date documentation

**Quick setup:**
```bash
# Claude Code
claude mcp add brightdeveloper --transport http https://brightdeveloper-mcp.bsn.cloud/mcp

# Or build locally
cd mcp-server/
make build
make mcp-config  # Get configuration for your editor
```

**Repository:** [github.com/BrightDevelopers/brightdeveloper-mcp](https://github.com/BrightDevelopers/brightdeveloper-mcp)

---

## Planned Tools

### CLI Tool - Unified BrightSign CLI

**Status:** Planned  
**What it will do:**
- Device management from command line
- Content upload/download
- Presentation deployment
- Diagnostics and monitoring

**Example:**
```bash
# Future vision
bsign devices list
bsign content upload video.mp4
bsign deploy --presentation my-presentation --group lobby-displays
```

**Timeline:** Q2 2026

---

### VS Code Extension

**Status:** In research  
**What it could do:**
- BrightScript syntax highlighting and IntelliSense
- Live device connection and debugging
- Content preview
- Presentation authoring assistance

**Want to contribute?** We'd love help building this.

---

## Tool Requests

Need a specific developer tool? Let us know:

**[Open an issue](https://github.com/BrightDevelopers/BrightDev/issues)** with:
- Tool description
- Use case
- Preferred implementation (CLI, GUI, IDE extension, etc.)

Popular requests get prioritized.

---

## Contributing Tools

Built a useful BrightSign development tool?

**We'll feature it here if:**
- It solves a real developer pain point
- It's well-documented
- It's maintained and tested
- It's open source

**Submit via PR** or [open a discussion](https://github.com/BrightDevelopers/discussions).

---

[← Back to BrightDev](../README.md)
