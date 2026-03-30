# Debugging Troubleshooting

Common gotchas and fixes you will run into when debugging on BrightSign players. Most of these bite you exactly once, and then never again.

## SSH

### "Connection refused" when trying to SSH

```
ssh: connect to host <player-ip> port 22: Connection refused
```

SSH requires a registry write *and* a reboot before it starts listening. If you just added the SSH lines to your `autorun.brs` for the first time, the player needs to boot twice: once to write the registry value, and once more for the SSH server to come online. Power cycle the player and try again.

### "REMOTE HOST IDENTIFICATION HAS CHANGED"

```
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
```

This happens when a different player (or the same player after an OS update) is now at an IP address your computer has seen before. Your machine cached the old SSH key and the new one does not match.

Fix it by removing the old entry:

```bash
ssh-keygen -R <player-ip>
```

Then connect again. SSH will prompt you to accept the new key.

### "Permission denied" or wrong password

The SSH username is `brightsign` (not `root`). The password is whatever you set with `SetLoginPassword()` in your autorun. If you did not set one, the default password is `password`.

```bash
# Correct format
ssh brightsign@<player-ip>

# Not this
ssh brightsign:password@<player-ip>
```

Note: SSH does not accept `user:password@host` syntax. It will prompt you for the password interactively, or you can use key-based authentication.

### "Unknown command: -c reboot" when running a remote command

```
ssh brightsign@<player-ip> 'reboot'
Unknown command: -c reboot
```

BrightSign's SSH shell does not support passing commands inline. When you write `ssh host 'command'`, SSH internally tries to run `-c command` on the remote shell, and BrightSign does not understand that.

Instead, SSH in interactively and type the command at the prompt:

```bash
ssh brightsign@<player-ip>
# Then type: reboot
```

## Chrome DevTools

### DevTools will not connect

If nothing appears under "Remote Target" in `chrome://inspect/#devices`:

1. Confirm `inspector_server: { port: 2999 }` is in your `roHtmlWidget` config
2. Confirm the `enable_web_inspector` registry key is set to `"1"`
3. Verify your computer and the player are on the same network and subnet
4. Double-check the player's IP address (boot without an SD card to see it on screen)
5. Make sure you added the correct IP and port in Chrome's **Configure** dialog (e.g. `<player-ip>:2999`)

### DevTools connects but the page is blank or unresponsive

Chrome DevTools uses a screencast feature that can interfere with video rendering on the player. If you see a black preview in the DevTools window, that does not necessarily mean your display is black. Check the actual physical screen. The Console, Sources, and Network tabs will still work normally regardless of what the preview shows.

### DevTools disconnects when the player reboots

This is expected. When you push new files and reboot the player, the DevTools connection drops. After the player finishes booting (15-30 seconds), go back to `chrome://inspect` and click **Inspect** again.

## Diagnostic Web Server (DWS)

### DWS is not accessible in the browser

- The `networking.dwse` registry key must be set to `"yes"`
- Like SSH, DWS requires a reboot after the first registry write before it comes online
- Check that port 80 is not blocked by your network or firewall
- Try the IP address directly rather than mDNS (`http://<player-ip>/` not `http://brightsign-XXXXX.local/`)

### DWS returns 401 Unauthorized

You set a password with `SetupDWS()`. The default username is `admin` and the password is whatever you configured. If you used the snippet from the guide, the credentials are `admin` / `password`.

## File Deployment

### Files are on the SD card but the player ignores them

- `autorun.brs` must be in the root directory of the SD card, not in a subfolder
- File paths in BrightScript use `file:///sd:/` (note the triple slash and `sd:` prefix)
- If using SCP, files go to `/storage/sd/`, not just `/sd/`
- After copying files via SCP, the player needs a reboot to pick up changes to `autorun.brs`. For HTML/JS/CSS changes loaded by an already-running `roHtmlWidget`, you may be able to refresh via DevTools instead

### SCP works but the player does not show changes

The player runs `autorun.brs` at boot. If you only changed HTML/JS/CSS files (not the autorun itself), try refreshing the page via Chrome DevTools console:

```javascript
location.reload()
```

If you changed `autorun.brs`, you need a full reboot. SSH in and type `reboot`:

```bash
ssh brightsign@<player-ip>
# Then type: reboot
```

## BrightScript Debugger

### Ctrl-C does not break into the debugger

This only works when connected via SSH or serial console while a BrightScript application is running. If the autorun has already finished executing (or crashed), there is nothing to break into. Check the system log for errors:

```bash
curl --digest -u admin:password http://<player-ip>/api/v1/logs
```

## BrightSign Shell

### Typed `exit` in the shell and the player rebooted

That is the expected behavior. In the BrightSign OS shell (the `BrightSign>` prompt, reached via a second Ctrl-C from the debugger), typing `exit` reboots the player. If you want to return to the BrightScript debugger instead, type `script`.

## General

### How do I find the player's IP address?

Boot the player with a blank SD card (or no SD card). The IP address is displayed on screen. The player also appears on your network as `BRIGHTSIGN-<SERIALNUMBER>`, so you can find it in your router's device list.

### The player keeps rebooting in a loop

Your `autorun.brs` likely has a syntax error or is crashing on startup. Remove the SD card to stop the loop, then connect via serial console (USB-to-serial cable, 115200 baud) to see the error output. Serial does not require SSH or network access, so it works even when everything else is broken.

### Everything was working and now nothing connects

Check that the player's IP has not changed. If your network uses DHCP, the player may have been assigned a new address. Boot without an SD card to see the current IP, or check your router's device list for `BRIGHTSIGN-<SERIALNUMBER>`.
