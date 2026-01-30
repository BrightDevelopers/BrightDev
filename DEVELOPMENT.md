# BrightSign Development Environment Setup

This guide helps you set up a local development environment for iterative BrightSign application development. After deploying your first "Hello World" application, use these tools and techniques to debug, log, and refine your application.

---

## Table of Contents

1. [Connecting to Your Player](#connecting-to-your-player)
2. [Debugging Applications](#debugging-applications)
3. [Logging and Diagnostics](#logging-and-diagnostics)
4. [Essential Operations](#essential-operations)
5. [Platform-Specific Considerations](#platform-specific-considerations)

---

## Connecting to Your Player

### Serial Connection

Serial connections provide direct access to the BrightSign shell for configuration and debugging.

**Resources:**
- [BrightSign Shell Documentation](https://docs.brightsign.biz/developers/brightsign-shell)
- [Serial Port Configuration](https://docs.brightsign.biz/advanced/serial-port-configuration)

**Quick Steps:**
1. Connect via serial cable (USB-to-serial adapter may be required)
2. Use a terminal emulator (PuTTY, screen, minicom)
3. Default settings: 115200 baud, 8N1
4. Access BrightSign shell for diagnostics and commands

### SSH Connection

SSH provides remote command-line access to your player (must be enabled first).

**Prerequisites:**
- Player must be on the same network
- SSH must be enabled in Local DWS or via a script
- Know your player's IP address
  - If not known, refer to [Finding Your Player's IP Address](#finding-your-players-ip-address) section.

**Connection:**
```bash
ssh brightsign@<IP_ADDRESS>
# OR
ssh brightsign@brightsign-<SERIAL_NUMBER>.local
```

---

## Debugging Applications

### HTML and Node.js Applications

Remote debugging allows you to use Chrome DevTools to inspect, debug, and profile your HTML/JavaScript/Node.js applications running on BrightSign players.

**Resources:**
- [Debugging HTML/Node Apps](https://docs.brightsign.biz/developers/debugging-htmlnode-apps)
- [Debugging Web Pages](https://docs.brightsign.biz/developers/debugging-webpages)

**Debugging Features:**
- Console output and errors
- DOM inspection
- JavaScript breakpoints
- Network request monitoring
- Performance profiling
- Memory analysis

### BrightScript Applications

BrightScript includes a telnet-based debugger for stepping through code and inspecting variables.

**Resources:**
- [BrightScript Debugger](https://docs.brightsign.biz/developers/brightscript-debugger)
- [BrightScript Language Reference](https://docs.brightsign.biz/developers/brightscript)
- [BrightScript Tips and Tricks](https://ikb.brightsign.biz/software/brightscript-tips-and-tricks)

**Debugging Tips:**
- Use `print` statements for quick diagnostics
- Leverage the message port for asynchronous event debugging
- Check the autorun log for script errors and stack traces

---

## Logging and Diagnostics

1. BrightSignOS System Logs: System logs provide kernel-level diagnostics and OS events.
2. Autorun Logs: Autorun logs show application startup, errors, and runtime issues.


**Resources:**
- [Get player logs](https://docs.brightsign.biz/how-tos/get-playerdws-logs)
- [Diagnostic Web Server - BrightSignOS Logs](https://docs.brightsign.biz/advanced/diagnostic-web-server-dws#brightsignos-logs)
- [Interpret Autorun Logs](https://docs.brightsign.biz/how-tos/interpret-autorun-logs)

**Access via Diagnostic Web Server (DWS):**
1. Navigate to `http://<player-ip>` (if Local DWS is enabled)
   1. If not enabled, refer to [Enabling Local DWS](#enabling-local-dws-diagnostic-web-server) section.
2. Go to `Log` tab.

**Access via Serial/SSH:**

Optionally you can view the whole log output directly when connected via serial or SSH. See the [Serial Connection](#serial-connection) or [SSH Connection](#ssh-connection) sections above.

### Update Logging Level

Configure the logging level for the system logs to get more detailed output for debugging.

**Access via DWS:**
1. Navigate to `http://<player-ip>`
2. Go to `Advanced -> BrightSignOS Logs` to update the logging level.
3. Or you can also do this using the [Local DWS API](https://docs.brightsign.biz/developers/ldws-advanced-endpoints#put-v1systemsupervisorlogging).
4. Set the desired logging level (eg. 3: Trace, 2: Info, 1: Warn, 0: Error).
---

## Essential Operations

### Finding Your Player's IP Address

**Resources:**
- [Find a Player's IP Address](https://docs.brightsign.biz/how-tos/find-a-players-ip-address)

**Methods:**
1. **Display on Screen** - Boot up the player without any storage device, it will display its IP address on the connected screen.
2. **DHCP Server** - Check your router's DHCP client list
3. **Local DWS Web Interface** - If Local DWS is enabled and you know the player's serial number, you can access it via `brightsign-<SERIAL_NUMBER>.local` and view the IP address on the `Info` tab.
4. **Serial/Shell Access** - Run `ifconfig` command
5. **bsn.Cloud** - If the player is registered to `bsn.Cloud`, you can find the IP address:
   1. Open `BrightAuthor:Connected` desktop application, or browse to https://bsn.Cloud
   2. Log in with your bsn.Cloud credentials and select the network that the player is registered in.
   3. Go to the `Network` tab.
   4. Select the player row to view its Properties panel on the right side, which includes the IP address.
   5. OR, click the gear icon to open the player's Remote DWS and view the IP address on the `Info` tab.

### Enabling Local DWS (Diagnostic Web Server)

The Local Diagnostic Web Server provides web-based access to player diagnostics, logs, and remote debugging.

**Resources:**
- [DWS Local Access](https://docs.brightsign.biz/advanced/dws-local-access)

**Methods:**
1. **Via BrightAuthor:Connected setup** - Enable Local DWS via a bsn.Cloud setup.
2. **Via BrightScript** - Enable programmatically in autorun.brs script.
3. **Via JavaScript** - Enable programmatically in your HTML/JavaScript application.
4. **Via Serial Shell** - Use BrightSign shell commands:
    ```
    registry write networking http_server 80
    registry flush
    reboot
    ```

### Factory Reset

Reset your player to factory defaults to start fresh.

**Resources:**
- [Factory Reset a Player](https://docs.brightsign.biz/how-tos/factory-reset-a-player)

**Methods:**
1. **SVC + RST Buttons** - Press & hold both buttons together during boot
2. **Via Local DWS** - Control → "Factory Reset"
3. **Via Serial Shell** - `factoryreset confirm`

**Warning:** This will erase all content, settings, and user data.

### Recover from a Reboot Loop

If your application causes the player to crash and reboot in a loop:

**Resources:**
- [Stop a Continuously Rebooting Player](https://docs.brightsign.biz/how-tos/stop-a-continuously-rebooting-player)

**Methods:**
1. **Error handling** - Add `try-catch` blocks in JavaScript blocks or `stop` statements in BrightScript to prevent crashes for known error/exception conditions.
2. **Replace SD card** - Insert new SD card with optional recovery content
3. **Serial shell recovery** - Interrupt boot process via serial connection (press SVC key after `Starting BrightSign application ...` message) to access BrightSign shell and fix issues.

---

## Platform-Specific Considerations

### BrightScript vs JavaScript

BrightSign supports both BrightScript and JavaScript for application development, each with different use cases.

**Resources:**
- [Player APIs: BrightScript and JavaScript](https://docs.brightsign.biz/developers/player-apis-brightscript-and-javascript)

**Choosing the Right Platform:**
- Use **BrightScript** for: Simple media playback, GPIO control, legacy compatibility
- Use **HTML/JavaScript/Nodejs** for: Complex UIs, web content, API integrations, modern web frameworks

### Network Configuration

- Ethernet is the most stable and preferred method for network connectivity. It is automatically configured by the BrightSign OS.
- Any custom network configuration (like WiFi or other interface like modem, or VPN or proxy settings) requires special configuration.
  - Use a [BrightAuthor:Connected setup](https://docs.brightsign.biz/user-guides/setup#network-configuration) to configure custom network settings.
  - OR
  - Configure the network in your script using BrightSign OS APIs:
    - [BrightScript roNetworkConfiguration API](https://docs.brightsign.biz/developers/ronetworkconfiguration)
    - [JavaScript networkconfiguration API](https://docs.brightsign.biz/developers/networkconfiguration)

---

## Tips for Iterative Development

### Local Development Workflow

1. **Develop locally** - Build and test on your development machine. You may need to mock BrightSign-specific APIs.
2. **Deploy to SD card** - Copy files to SD card or use `curl` command to upload files via local network:
    ```
    curl --location --request PUT 'http://{{player-ip}}/api/v1/files/sd' \
    --digest -u 'admin:ldws-password' \
    --form 'file[0]=@"/path/to/file"'
    ```
3. **Test on player** - Boot player with your application
4. **Debug locally or remotely** - Use Chrome Debugging or SSH debugger or BrightScript debugger
5. **Iterate** - Make changes and redeploy

### Best Practices

- **Version Control** - Keep your code in Git
- **Test on Hardware** - Don't rely solely on browser testing for HTML apps
- **Monitor Logs** - Always check logs after deployment
- **Start Simple** - Get basic functionality working before adding complexity
- **Use MCP Prompts** - Leverage the BrightDeveloper MCP server for code generation and troubleshooting

---

## Next Steps

- **[Hello BrightSign Example](examples/hello-brightsign/)** - Your first deployment
- **[BrightSign Documentation](https://docs.brightsign.biz)** - Comprehensive API reference
- **[GitHub Discussions](https://github.com/orgs/BrightDevelopers/discussions)** - Community support

---

**Need help?** Ask in [GitHub Discussions](https://github.com/orgs/BrightDevelopers/discussions) or reach out via the [BrightSign Support Community](https://support.brightsign.biz/hc/en-us/community/topics).
