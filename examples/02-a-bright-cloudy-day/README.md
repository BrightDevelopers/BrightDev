# Tutorial 2: A Bright Cloudy Day

*Deploying content without touching a single SD card.*

---

## The Limitation of Sneakernets

In [Tutorial 1](tutorial-1-hello-brightsign.md), we displayed an image by copying files to an SD card. Simple. Reliable. And completely impractical once you have more than a handful of players.

Imagine running a chain of coffee shops. You've got BrightSign players in 200 locations displaying your menu. Corporate decides to add a new oat milk latte. In the SD card world, that means mailing 200 SD cards, or driving to 200 stores, or hiring 200 local technicians.

This is the sneakernet problem. Moving data by physically carrying storage devices. It works until it doesn't scale.

The cloud exists to solve this problem. Instead of bringing the content to the player, you tell the player where to find the content. One command from your laptop reaches every player in your network simultaneously. The new latte appears everywhere before your coffee gets cold.

---

## What You'll Build

By the end of this tutorial, you'll push an image to a BrightSign player without touching it. Your code will:

1. Authenticate with BSN.cloud
2. Upload files directly to the player's storage
3. Reboot the player to run your new content

Same result as Tutorial 1. Radically different delivery mechanism.

---

## Prerequisites

The cloud path requires a bit more setup than the SD card path. You'll need:

1. **A BSN.cloud account** - [Sign up free at bsn.cloud](https://bsn.cloud)
2. **A BSN network** - Created automatically when you sign up
3. **A registered player** - Connected to the internet and registered to your network
4. **API credentials** - We'll create these in Step 1

If your player isn't registered yet, follow the [Player Setup video](https://vimeo.com/948903290?fl=pl&fe=ti). The player needs to phone home before you can phone it.

**Got all four? Let's go.**

---

## The Architecture

Before we write code, let's understand what we're building.

BSN.cloud is BrightSign's management platform. Think of it as a switchboard that knows where all your players are and how to reach them. When you want to talk to a player, you don't connect directly. You tell BSN.cloud what you want, and it relays the message.

The Remote DWS (Device Web Server) API is your communication channel. "DWS" is a tiny web server running inside every BrightSign player. "Remote" means you're accessing it through BSN.cloud rather than on the local network.

The flow looks like this:

```
Your Code → BSN.cloud API → Player's DWS → Player's Storage
```

It's like sending a package through a courier service. You hand it to the courier (BSN.cloud), the courier delivers it to the recipient's mailroom (DWS), and the mailroom puts it in the right office (storage).

---

## Step 1: Get Your API Credentials

Log into [the BSN Admin Panel](https://adminpanel.bsn.cloud/).

Navigate to **Settings → Applications → Add Application**.

Name it anything memorable. Give it **Devices** permissions (read and write). Hit save.

Copy two values:
- **Client ID**
- **Secret**

Store these securely. The secret is shown exactly once. Lose it, and you'll need to create a new application.

*Note: If these steps don't match your screen, refer to the [BrightSign API Authentication Guide](https://docs.brightsign.biz/developers/2025-api-usage-guide).*

---

## Step 2: Install the MCP Server

Here's where AI-first development gets interesting.

The BrightDeveloper MCP server gives your AI assistant direct access to BrightSign documentation. Instead of you searching docs and pasting snippets, the AI queries the documentation in real-time and generates accurate code on the first try.

It's like giving your assistant a photographic memory of every BrightSign API.

**For Claude Code:**

```bash
claude mcp add brightdeveloper-docs --transport http https://brightdeveloper-mcp.bsn.cloud/mcp
```

**For VS Code / Cursor:**

Add to your MCP settings:

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

## Step 3: The Prompt

This is where the magic happens. You're about to describe what you want, and your AI will write working code that uses APIs it learned about from the MCP server.

Open your AI assistant and paste:

```
Generate a complete, working program that displays "Hello BrightSign" on my player using the cloud.

# Requirements
- Use the BrightSign MCP server documentation to get the API details right
- Load credentials from a .env file (I'll fill in BRIGHTSIGN_CLIENT_ID and BRIGHTSIGN_CLIENT_SECRET)
- Authenticate with BSN.cloud using OAuth2 client credentials flow
- Set network context after authentication
- Use the Remote DWS (RDWS) API to upload files directly to the player's storage
- Upload an autorun.brs file that displays an image fullscreen
- Upload the hello-brightsign.png image from:
  https://raw.githubusercontent.com/BrightDevelopers/BrightDev/main/examples/hello-brightsign/static/hello-brightsign.png
- Reboot the player to run the new autorun
- Print progress at each step so I can see what's happening
- Single file I can run directly

# My Settings
- Language: [Node.js / Python / Go - pick your preference]
- Network name: [YOUR_NETWORK_NAME_HERE]
- Player serial: [YOUR_PLAYER_SERIAL_HERE]
```

Replace the bracketed values with your actual network name and player serial number. You can find both in the BSN Admin Panel under Devices.

---

## Step 4: Configure and Run

The AI will generate code and a `.env` file template. Fill in your credentials:

```env
BRIGHTSIGN_CLIENT_ID=your_client_id_here
BRIGHTSIGN_CLIENT_SECRET=your_secret_here
```

Then run the generated code. You'll see output like:

```
Authenticating with BSN.cloud...
✓ Authentication successful
Setting network context to 'MyNetwork'...
✓ Network context set
Downloading hello-brightsign.png...
✓ Image downloaded
Uploading autorun.brs to player...
✓ autorun.brs uploaded
Uploading hello-brightsign.png to player...
✓ Image uploaded
Rebooting player...
✓ Reboot command sent
Done! Your player will display the image after reboot.
```

Watch your display. The player reboots. The image appears.

You just deployed content to a digital signage player without touching it.

---

## What Just Happened?

Let's trace the API calls:

1. **OAuth2 Authentication**: Your code exchanged the client ID and secret for an access token. This token proves you're allowed to make requests.

2. **Network Context**: BSN.cloud can manage multiple networks. Setting context tells it which network you're working with.

3. **File Upload via RDWS**: The Remote DWS API accepted your files and forwarded them to the player's storage. The player received `autorun.brs` and the PNG image.

4. **Reboot**: The reboot command told the player to restart. On boot, it found the new `autorun.brs` and executed it.

The player never knew or cared that the files came from the cloud. From its perspective, files appeared in storage, and it ran the autorun script. Same as if you'd used an SD card.

---

## The Power of This Pattern

Here's what you can do now that you couldn't before:

**Update 1,000 players at once**: Loop through serial numbers and push content to each one. The BSN.cloud API handles the routing.

**Deploy from CI/CD**: Trigger deployments when code merges to main. Your digital signage updates automatically with your software releases.

**Roll back instantly**: Keep previous autorun.brs files in version control. Push the old version if something goes wrong.

**Debug remotely**: RDWS also supports reading files and logs. Pull diagnostics without site visits.

This is the difference between artisanal and industrial. Tutorial 1 was baking bread by hand. Tutorial 2 is running a bakery.

---

## Security Notes

Your API credentials are keys to your digital signage network. Treat them accordingly:

- Never commit `.env` files to version control
- Use environment variables in production
- Rotate credentials if they might be compromised
- Create separate applications for dev/staging/prod

The player serial number isn't sensitive (it's printed on the device), but the combination of credentials + serial can modify that specific player. Principle of least privilege applies.

---

## Troubleshooting

**"Authentication failed"**: Double-check your client ID and secret. They're case-sensitive. Make sure the application has Devices permissions.

**"Player not found"**: Verify the serial number matches exactly. Check that the player is online and registered to the network you specified.

**"Upload failed"**: RDWS has a 10MB limit per file. Compress large images or split large deployments into multiple uploads.

**"Player didn't reboot"**: Some players require a moment between file upload and reboot command. Add a short delay if uploads complete but reboot doesn't trigger.

**"Image doesn't display"**: SSH into the player and check if the files exist. Verify `autorun.brs` syntax by running it manually in the BrightScript debugger.

---

## Going Further

You've deployed a static image. But the same pattern works for:

- **HTML5 applications**: Upload `index.html` alongside a launcher `autorun.brs`
- **Video playlists**: Upload multiple videos and a playlist configuration
- **Dynamic content**: Upload code that fetches content from your own APIs
- **Scheduled updates**: Combine with cron jobs or scheduled CI pipelines

The RDWS API is just one piece. BSN.cloud also offers:

- **Presentation API**: Deploy pre-built BrightAuthor:connected presentations
- **Group API**: Organize players and deploy to groups
- **Device API**: Query player status, network info, and diagnostics
- **Content API**: Manage a content library and assign content to players

---

## Quick Reference

| API Endpoint | Purpose |
|--------------|---------|
| `POST /oauth/token` | Get access token |
| `POST /network/context` | Set active network |
| `POST /rdws/upload` | Upload file to player |
| `POST /rdws/reboot` | Reboot player |

| Authentication | Value |
|----------------|-------|
| Grant type | `client_credentials` |
| Token URL | `https://auth.bsn.cloud/oauth/token` |
| API Base | `https://api.bsn.cloud/2022/06/REST` |

---

## The Two Paths

You now know both ways to get content onto a BrightSign player:

| | SD Card (Tutorial 1) | Cloud (Tutorial 2) |
|---|---|---|
| **Setup** | None | BSN.cloud account + API credentials |
| **Network** | Optional | Required |
| **Scale** | One player at a time | Thousands simultaneously |
| **Update speed** | Physical visit | Seconds |
| **Best for** | Development, kiosks, offline sites | Production fleets, remote management |

Most projects use both. Develop locally with SD cards. Deploy to production via the cloud.

---

## What's Next?

- **[BrightDev Repository](https://github.com/BrightDevelopers/BrightDev)** - More examples
- **[GitHub Issues](https://github.com/BrightDevelopers/issues)** - Questions, ideas, bug reports
- **[BSN.cloud API Docs](https://docs.brightsign.biz/developers)** - Complete API reference

---

*Part of [BrightDeveloper](https://github.com/BrightDevelopers) - BrightSign's AI-first developer program.*
