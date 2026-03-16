# Tutorial 2: Debugging Your App on BrightSign

*The fastest path from "why is my screen black?" to "oh, that's why."*

## The Invisible Problem

Every developer has a debugging workflow that feels like breathing. You write code, hit save, check the browser, open DevTools, poke around. It is so seamless you barely think about it.

Then you start building for a BrightSign player and it feels like you have been dropped on a desert island. Your code runs on a box under a TV in a conference room. There is no browser tab to right-click. No terminal sitting open. You wrote some JavaScript, copied it to an SD card, walked across the office, inserted it, and now you are staring at a black screen wondering what went wrong.

Here is the thing most people do not realize at first: that BrightSign player is running a full Chromium browser. The same engine behind Chrome. Which means the same Chrome DevTools you use every day, the Console, Sources, Network, Memory, and Performance tabs, can connect to your player over the network.

The player under the TV is just another browser tab. You just have to tell it to pick up the phone.


## What You'll Need

- A BrightSign player (Series 4 or 5) connected to your network via Ethernet
- A computer on the same network with Chrome installed
- Your application files (HTML/JS/CSS)
- A text editor
- 10 minutes for initial setup (then seconds per iteration going forward)

**Finding your player's IP address:** Boot the player with a blank SD card (or no SD card at all) and it will display its IP address on screen. The player also appears on your local network as `BRIGHTSIGN-<SERIALNUMBER>`, so you can find it from your router's device list if needed. Write the IP down. You will use it throughout this guide anywhere you see `<player-ip>`.


## The Mental Model

Debugging on BrightSign works in layers, like peeling an onion. The outer layer, the one you will use 90% of the time, is Chrome DevTools. It handles JavaScript, DOM, network, and memory. If your app is HTML/JS (and most BrightSign apps are), this is where you live.

Beneath that sits the BrightScript layer, the `autorun.brs` that launches your app. When the problem is in the launcher itself, you drop down to the BrightScript Debugger via SSH or serial.

And at the very bottom is the system layer. Logs, screenshots, registry values, network diagnostics. The Diagnostic Web Server (DWS) gives you a browser-based window into all of it.

Today we are setting up all three layers. You will configure them once and use them for the rest of your development life on this player.


## Step 1: The Debug-Ready autorun.brs

Every BrightSign player runs `autorun.brs` at boot. For Tutorial 1, yours was simple. Now we are going to make it development-ready by enabling three things: the Chrome DevTools inspector, SSH access, and the Diagnostic Web Server.

Here is the template. Copy it to the root of your SD card (replacing your existing `autorun.brs`):

```brightscript
' autorun.brs - Development build with all debug tools enabled
Sub Main()
    ' --- Debug tools (disable these for production) ---

    ' 1. Enable Chrome DevTools inspector
    htmlReg = CreateObject("roRegistrySection", "html")
    htmlReg.Write("enable_web_inspector", "1")
    htmlReg.Flush()

    ' 2. Enable SSH and DWS
    netReg = CreateObject("roRegistrySection", "networking")
    netReg.Write("ssh", "22")
    netReg.Write("dwse", "yes")
    netReg.Flush()

    ' 3. Set passwords for SSH and DWS
    nc = CreateObject("roNetworkConfiguration", 0)
    nc.SetupDWS({port: "80", password: "dev123"})
    nc.SetLoginPassword("dev123")
    nc.Apply()

    ' --- Your application ---

    rect = CreateObject("roRectangle", 0, 0, 1920, 1080)

    config = {
        url: "file:///sd:/index.html",
        inspector_server: { port: 2999 },
        nodejs_enabled: true
    }

    htmlWidget = CreateObject("roHtmlWidget", rect, config)
    htmlWidget.Show()

    ' Keep the app alive
    msgPort = CreateObject("roMessagePort")
    htmlWidget.SetPort(msgPort)

    while true
        msg = wait(0, msgPort)
    end while
End Sub
```

The key pieces:

- `enable_web_inspector` in the registry tells the Chromium engine to accept remote debugging connections
- `inspector_server: { port: 2999 }` opens port 2999 for Chrome DevTools to connect
- `ssh` and `dwse` registry writes enable SSH and the Diagnostic Web Server
- The passwords keep casual traffic off your player (change them from "dev123" for anything beyond your desk)

> **Production warning:** Disable all of these before shipping. The web inspector logs data to memory even when nothing is connected, which can cause memory exhaustion and crashes over time. SSH and DWS are development tools, not production features.


## Step 2: Create a Simple Test App

You need something to debug. Create an `index.html` alongside your `autorun.brs`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Debug Test</title>
    <style>
        body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #1a1a2e;
            color: #eee;
            font-family: system-ui, sans-serif;
        }
        .status {
            text-align: center;
            font-size: 2rem;
        }
        .timestamp {
            font-size: 1rem;
            color: #888;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="status">
        <div id="message">Loading...</div>
        <div class="timestamp" id="time"></div>
    </div>
    <script src="app.js"></script>
</body>
</html>
```

And an `app.js`:

```javascript
// app.js - A simple app with things to debug
console.log('App started at:', new Date().toISOString());

function updateDisplay() {
    const now = new Date();
    document.getElementById('message').textContent = 'Hello from BrightSign!';
    document.getElementById('time').textContent = now.toLocaleTimeString();
    console.log('Display updated:', now.toLocaleTimeString());
}

updateDisplay();
setInterval(updateDisplay, 1000);

console.log('Screen size:', window.innerWidth + 'x' + window.innerHeight);
```

Your SD card should look like this:

```
SD:/
├── autorun.brs
├── index.html
└── app.js
```


## Step 3: Deploy and Boot

Insert the SD card into your player and power on. After the boot sequence (15-30 seconds), your display should show "Hello from BrightSign!" with a ticking clock.

If the screen stays black, do not panic. That is why we are setting up debugging.


## Step 4: Connect Chrome DevTools

This is the payoff. From your laptop:

1. Open Chrome
2. Navigate to `chrome://inspect/#devices`
3. Click **Configure** next to "Discover network targets"
4. Add your player's IP address and port: `<player-ip>:2999`
5. Click **Done**
6. Wait a moment. Your page will appear under "Remote Target"
7. Click **Inspect**

A full Chrome DevTools window opens. You will see:

- **Console tab**: Your `console.log` messages streaming in real time ("App started at...", "Display updated...")
- **Elements tab**: The live DOM of your page running on the player
- **Sources tab**: Your JavaScript files, ready for breakpoints
- **Network tab**: Every request the page makes
- **Memory tab**: Heap snapshots for finding memory leaks

It is the same DevTools you use on localhost. Pointed at hardware sitting across the room.


## Step 5: The Daily Workflow

Setup happens once. The loop you will repeat hundreds of times is what matters:

```
Edit code on your machine
        |
        v
Push files to the player
        |
        v
Reboot (or refresh)
        |
        v
Check chrome://inspect
        |
        v
Debug with DevTools
        |
        v
(repeat)
```

The speed of this loop depends almost entirely on how you deploy. Here are your options, ranked from fastest to most basic.

### Option A: SCP Over SSH (Recommended)

Since you enabled SSH in the autorun, you can push files directly over the network. No SD card shuffling. No walking across the room.

```bash
# Push your changed files
scp index.html app.js brightsign@<player-ip>:/storage/sd/

# Reboot the player to pick up changes
ssh brightsign@<player-ip> 'reboot'
```

For larger projects, `rsync` only transfers what changed:

```bash
rsync -avz --progress ./dist/ brightsign@<player-ip>:/storage/sd/
ssh brightsign@<player-ip> 'reboot'
```

### Option B: VS Code Auto-Upload

For the tightest loop, configure VS Code's SFTP extension to push files on every save:

```json
{
    "name": "BrightSign Player",
    "host": "<player-ip>",
    "protocol": "sftp",
    "port": 22,
    "username": "brightsign",
    "password": "dev123",
    "remotePath": "/storage/sd/",
    "uploadOnSave": true,
    "ignore": [".vscode", ".git", "node_modules"]
}
```

Save this as `.vscode/sftp.json`. Now every `Ctrl+S` pushes the file to the player. For JavaScript and CSS changes, you can often skip the reboot entirely. Type `location.reload()` in the DevTools console, or press `Ctrl+Shift+R` in the inspector to hard-refresh the page on the player.

### Option C: SD Card

The approach everyone starts with. Pull the card, copy files, reinsert, power cycle. It works and it requires zero network setup. For a first deploy or initial provisioning, it is fine. But if you are iterating on a bug, the walk-back-and-forth overhead adds up. Graduate to SCP as soon as your player is on the network.


## The Diagnostic Web Server: Your Dashboard

While DevTools shows you the inside of your app, the DWS shows you the inside of the player. Open a browser and go to:

```
http://<player-ip>/
```

(Use the credentials you set: admin / dev123)

You get a dashboard with player status, but the real power is in the API endpoints:

| Endpoint | What It Gives You |
|----------|-------------------|
| `/GetSystemLog` | System logs (first place to look when something fails) |
| `/GetPlaybackLog` | Media playback events |
| `/GetScreenshot` | JPEG of current display output |
| `/GetRegistry` | All registry values as JSON |
| `/GetStorageInfo` | Disk usage |
| `/Reboot` | Reboot the player |

The screenshot endpoint alone is worth the setup. Instead of walking to the display:

```bash
curl http://admin:dev123@<player-ip>/GetScreenshot -o screenshot.jpg
```

You can see exactly what the player is rendering without leaving your desk.


## Common Debugging Scenarios

### "My page loads but something is wrong"

This is bread-and-butter Chrome DevTools. Connect via `chrome://inspect`, open the Console tab, look at the output. Add logging like you normally would:

```javascript
console.log('Content loaded:', {
    url: window.location.href,
    timestamp: Date.now(),
    screenSize: `${window.innerWidth}x${window.innerHeight}`
});

// Performance timing
console.time('dataFetch');
const data = await fetch('/api/content').then(r => r.json());
console.timeEnd('dataFetch');
```

### "My page is not loading at all"

Check the system log first:

```bash
# Via DWS
curl http://admin:dev123@<player-ip>/GetSystemLog

# Or via SSH
ssh brightsign@<player-ip>
tail -n 100 /var/log/messages
```

Common culprits: a typo in the file path inside `autorun.brs`, a missing file on the SD card, or a JavaScript syntax error that crashes before anything renders. The system log usually tells you which one.

### "It works for a while then gets slow or crashes"

Memory leaks. BrightSign players have finite RAM, and signage apps often run for days or weeks without a page refresh. Use Chrome DevTools' Memory tab to take heap snapshots over time and compare them.

```javascript
// Quick memory monitor you can leave running
setInterval(() => {
    if (window.performance && window.performance.memory) {
        console.log('Memory:', {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
        });
    }
}, 60000);
```

The usual suspects: event listeners that never get removed, `setInterval` callbacks that accumulate, DOM nodes that get created but never cleaned up. The same things that cause leaks in any long-running web app, just with higher stakes because nobody is closing the tab.

### "I need to debug the BrightScript layer"

If the issue is in your `autorun.brs` (not the HTML/JS), Chrome DevTools will not help. You need the BrightScript Debugger.

Connect via SSH and press `Ctrl-C` to break into the debugger:

```
BrightScript Debugger> bt          ' Show call stack
BrightScript Debugger> var         ' Show local variables
BrightScript Debugger> print m     ' Print the current scope
BrightScript Debugger> cont        ' Continue execution
```

You can also add `STOP` statements in your BrightScript code as breakpoints:

```brightscript
Sub Main()
    ' ... your code ...

    if someCondition then
        STOP  ' Execution pauses here, drops to debugger
    end if
End Sub
```

A second `Ctrl-C` from the debugger drops you into the BrightSign OS shell, where you can run system commands: `ifconfig`, `ping`, `dir /storage/sd`, `registry read`. Typing `exit` from the shell reboots the player, so be intentional about it.

### "I need to debug Node.js specifically"

If your app uses BrightSign's Node.js runtime, add a Node.js inspector to your config:

```brightscript
config = {
    url: "file:///sd:/index.html",
    inspector_server: { port: 2999 },
    nodejs_enabled: true,
    node_js_inspector: { port: 3000 }
}
```

In Chrome, add `<player-ip>:3000` as a separate target in `chrome://inspect`. You get a dedicated DevTools window for the Node.js context, separate from the browser context on port 2999.


## Quick Reference

| What You Want to Do | Tool | How to Access |
|---------------------|------|---------------|
| Inspect DOM, console, network | Chrome DevTools | `chrome://inspect` + player IP:2999 |
| Debug Node.js server code | Node Inspector | `chrome://inspect` + player IP:3000 |
| Debug BrightScript | BrightScript Debugger | SSH + `Ctrl-C` |
| View system logs | DWS or SSH | `http://<ip>/GetSystemLog` or `tail /var/log/messages` |
| Take a screenshot | DWS | `http://<ip>/GetScreenshot` |
| Upload files over network | SCP or DWS API | `scp` or `curl` |
| Reboot the player | SSH or DWS | `ssh <ip> 'reboot'` or `http://<ip>/Reboot` |
| Emergency access (no network) | Serial console | USB-to-serial cable, 115200 baud |


## The Full Toolkit at a Glance

BrightSign gives you a deep bench. Here is how the tools rank by how often you will reach for each one:

1. **Chrome DevTools (Chromium Inspector)** - Your daily driver. JavaScript console, DOM inspection, network monitoring, memory profiling. If you are building an HTML/JS app, this is where you live.

2. **System Logs (via DWS or SSH)** - The first thing to check when the app will not start. Logs capture boot errors, network events, and crash information.

3. **DWS Dashboard** - A quick browser-based view into player status, screenshots, and registry values. Great for a sanity check without opening a terminal.

4. **BrightScript Debugger** - For problems in the `autorun.brs` layer. Interactive stepping, variable inspection, and call stack analysis. Access via SSH or serial.

5. **SSH/Serial Console** - Direct shell access to the player's OS. File operations, network diagnostics, registry inspection. The escape hatch when nothing else works.

6. **Node Inspector** - Dedicated debugger for the Node.js runtime. Use when your server-side JavaScript needs attention.

7. **BSN.cloud Remote DWS** - For players deployed in the field. The same DWS features, accessed through BrightSign's cloud API from anywhere. Less common for daily development because file transfers are capped at 10MB.


## What's Next?

You now have a development environment where the edit-deploy-debug loop takes seconds, not minutes. The player under the TV is no longer a black box. It is a browser tab, a terminal session, and a diagnostic dashboard all at once.

In the next tutorial, we will build something that actually needs debugging: a data-driven display that fetches content from an API, handles errors gracefully, and recovers when the network drops. The kind of real-world signage app where these tools earn their keep.


## Debugging

If Chrome DevTools will not connect:
- Verify the player IP address (check via serial or DWS)
- Confirm `inspector_server: { port: 2999 }` is in your config
- Confirm `enable_web_inspector` registry key is set to "1"
- Make sure your computer and the player are on the same network/subnet

If SSH connection is refused:
- The `networking.ssh` registry key must be "22"
- The player needs a reboot after enabling SSH for the first time
- Verify the password you set with `SetLoginPassword()`

If the DWS is not accessible:
- The `networking.dwse` registry key must be "yes"
- Check that port 80 is not blocked by your network
- Try accessing via the player's IP directly, not mDNS

*Part of [BrightDeveloper](https://github.com/BrightDevelopers) - BrightSign's AI-first developer program.*
