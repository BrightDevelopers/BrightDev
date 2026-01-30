# Hello BrightSign!

*From zero to content on your digital signage player in under 10 minutes.*

---

## What We're Building

By the end of this post, you'll display an image on a BrightSign player using AI-generated code. No SDK. No framework. Just one prompt and a working script.

Let's go.

## Prerequisites

1. A BSN.cloud account - [Sign up free at bsn.cloud](https://bsn.cloud)
2. A BSN network - Created when you sign up
3. A BrightSign player - Powered on, connected to a screen, registered to your network

**Got all three? Start your timer.**

## Step 1: Get Your API Credentials

Log into [the BSN Admin Panel](https://adminpanel.bsn.cloud/). Navigate to Settings -> Applications -> Add Application. Name it anything. Give it **Devices** permissions (read and write). Copy:
- Client ID
- Secret

Store them safely, you'll need these so your application can authenticate.

**Note**: if you have trouble performing these steps, refer to the [BrightSign API Authentication Guide](https://docs.brightsign.biz/developers/2025-api-usage-guide).

## Step 2: Install the MCP Server

The MCP server is the secret sauce to speeding up our deployment times. It will query the documentation in real-time to generate accurate, working code on the first try. No more copy-pasting from docs. No more trial-and-error.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/astros1dzmqr7yvbmy9p.png)

Let's give your AI assistant direct access to BrightSign documentation.

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

## Step 3: Run the Prompt

Open Claude and paste this:

```
Generate a complete, working program that displays "Hello BrightSign" on my player.

# Requirements
- Use the BrightSign MCP server documentation to get the API details right
- Load credentials from a .env file, you create it and I'll fill in the values for BRIGHTSIGN_CLIENT_ID and BRIGHTSIGN_CLIENT_SECRET
- Authenticate with BSN.cloud
- Set network context after auth
- Use the Remote DWS (RDWS) API to upload files directly to the player's storage
- Upload an autorun.brs file that displays an image fullscreen
- Upload the hello-brightsign.png image from:
  https://raw.githubusercontent.com/BrightDevelopers/BrightDev/main/examples/hello-brightsign/static/hello-brightsign.png
- Reboot the player to run the new autorun
- Print progress at each step
- Single file I can run directly

# My Settings
- Language: Node.js / Go / Python / Anything you like
- Network name: YOUR_NETWORK_NAME_HERE
- Player serial: TARGET_PLAYER_SERIAL_HERE
```


## Step 4: See It


Add your credentials to the generated `.env` file then run the generated code. Watch your player reboot. The "Hello BrightSign" image appears.

That's it. You just deployed directly to a BrightSign player. Here's mine (please forgive my key to Erebor and split keyboard 😅


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/pb1sx90e7wijvecz5zmm.jpg)


## What's Next

- **[BrightDev Repo](https://github.com/BrightDevelopers/BrightDev)** - More examples
- **[GitHub Discussions](https://github.com/BrightDevelopers/discussions)** - Questions, ideas and bug reports

---

*Part of [BrightDeveloper](https://github.com/BrightDevelopers) - BrightSign's AI-first developer program.*


