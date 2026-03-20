# Serial Console: The Emergency Escape Hatch

SSH and Chrome DevTools handle 95% of debugging. But when the player is stuck in a boot loop, the network is down, or SSH will not connect, the serial console is the one tool that always works. It requires nothing from the player except power.

This page tells you what you need, how to connect, and what to do once you are in.


## When to Reach for Serial

- The player reboots in a loop and you cannot SSH in
- Network configuration is broken and the player has no IP address
- SSH connects but the autorun crashes before the shell is usable
- You need to see boot-time output before the OS is fully loaded
- You want to enable the console or script debug mode from the boot loader


For full reference, see the [BrightSign Shell](https://docs.brightsign.biz/developers/brightsign-shell) documentation.

## What You Need

### The Cable

BrightSign players with extended I/O (most Series 4 and 5 models like XD, HD, XT) have a **3.5mm serial port**. You need two pieces:

1. **3.5mm male to DB-9 female adapter** (sometimes called a "stereo jack to serial" cable)
2. **DB-9 male to USB adapter** with one of these chipsets:
   - FTDI FT232RL (preferred)
   - Prolific PL2303GT or PL2303HXD

Both are available from Amazon, Plugable, or similar. Expect to spend around $15-25 total.

**LS models** (LS424, LS425, LS445) do not have a 3.5mm port. They use a USB Type-C to serial adapter cable, available from the BrightSign Store.

**Older players** (4Kx42, XDx32, HDx20, HDx22) have a DB-9 port, so you only need the DB-9-to-USB adapter.

### The 3.5mm Pinout

From the player's perspective:

| Pin | Signal |
|-----|--------|
| Tip | RX (receive) |
| Ring | TX (transmit) |
| Sleeve | GND |

If you are building your own cable or troubleshooting a bad connection, this is what matters.

### Terminal Software

Use whatever you are comfortable with:

| Platform | Options |
|----------|---------|
| Windows | PuTTY |
| macOS | `screen /dev/tty.usbserial 115200` or iTerm2 |
| Linux | `screen /dev/ttyUSB0 115200` or `tio /dev/ttyUSB0` |

### Serial Settings

These are the same for every BrightSign player:

- **Baud rate:** 115200
- **Data bits:** 8
- **Parity:** None
- **Stop bits:** 1
- **Flow control:** None (hardware flow control is supported on some older models but not required)


## Connecting

1. Plug the 3.5mm end into the player's serial port
2. Plug the USB end into your computer
3. Open your terminal software with the settings above
4. Power on the player

You should see boot output scrolling by. If the screen stays blank, check that your cable is seated fully in the 3.5mm jack and that your terminal is pointing at the correct USB serial device.


## What You See

### During Boot

System startup messages scroll past. If `autorun.brs` has a syntax error or crashes, you will see the error here before the player reboots. This is the main reason to use serial: catching errors that happen too fast for SSH to connect.

### BrightSign Shell

Once the player is running, press **Ctrl-C** once to break into the BrightScript Debugger (if a script is running), or you will land at:

```
BrightSign>
```

This is the BrightSign Shell. Useful commands:

| Command | What it does |
|---------|-------------|
| `ifconfig` | Show network configuration and IP address |
| `registry read <section> <key>` | Read a registry value |
| `registry write <section> <key> <value>` | Write a registry value |
| `dir /storage/sd` | List files on the SD card |
| `ping <host>` | Test network connectivity |
| `script` | Drop into the BrightScript Debugger |
| `script debug on` | Enable script debug mode (allows STOP breakpoints and Ctrl-C) |
| `reboot` | Reboot the player |

> **Warning:** Typing `exit` from the shell reboots the player. Use `script` to go back to the debugger, or `reboot` if that is what you intend.

### BrightScript Debugger

If a BrightScript application is running, pressing **Ctrl-C** drops you into the debugger:

```
BrightScript Debugger>
```

This is the same debugger you access via SSH. The commands (`bt`, `var`, `print`, `cont`, `step`) all work identically.

### Boot Loader

If you hold the **SVC button** on the player while powering on and press **Ctrl-C** within 3-5 seconds, you enter the boot loader prompt. From here you can enable the console:

```
console on
reboot
```

This keeps console output enabled across reboots until you disable it or factory reset the player.


## Enabling Script Debug Mode

By default, BrightScript runtime errors reboot the player instead of entering the debugger. To change that:

**From the shell (via serial or SSH):**
```
script debug on
```

**From the DWS Registry tab:**
Set `brightscript.debug` to `1`.

**From your autorun.brs:**
```brightscript
reg = CreateObject("roRegistrySection", "brightscript")
reg.Write("debug", "1")
reg.Flush()
```

With script debug enabled, runtime errors drop to the debugger prompt instead of rebooting, and `STOP` statements in your code work as breakpoints.


## Tips

- **Label your cables.** The 3.5mm serial port looks identical to the 3.5mm audio port on some models. Plugging into the wrong one is a common first mistake.
- **Serial works alongside SSH.** By default, enabling Telnet/SSH disables serial output. If you want both at once, set `registry write networking serial_with_telnet 1`. Note that `roSerialPort` becomes unreliable with this enabled.
- **Counterfeit cables are common.** If your USB-serial adapter is not detected or behaves erratically, it may be using a cloned chipset. Stick with adapters from known brands.
- **You do not need serial for daily work.** If SSH and DWS are working, serial adds nothing. It is insurance for the day they are not.
