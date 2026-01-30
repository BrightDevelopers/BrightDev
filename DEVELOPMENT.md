# BrightSign Development Environment Setup

This guide helps you set up a local development environment for iterative BrightSign application development. After deploying your first "Hello World" application, use these tools and techniques to debug, log, and refine your application.

---

## Table of Contents

1. [Connecting to Your Player](#connecting-to-your-player)
2. [Debugging Applications](#debugging-applications)
3. [Logging and Diagnostics](#logging-and-diagnostics)
4. [Network Configuration](#network-configuration)
5. [Tips for Iterative Development](#tips-for-iterative-development)

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
- Know your player's IP address (see [FAQ](README.md#how-do-i-find-my-players-ip-address) for methods)

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
1. Navigate to `http://<player-ip>` (if Local DWS is enabled; see [FAQ](README.md#how-do-i-enable-the-local-diagnostic-web-server-dws) if not)
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

## Network Configuration

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
