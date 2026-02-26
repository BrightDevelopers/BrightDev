# Tutorial 1: Hello BrightSign!

*The fastest path from "I have a player" to "there's something on my screen."*

---

## The Simplest Thing That Could Possibly Work

Every developer knows this feeling: you've got new hardware on your desk, and you want to see it do *something*. Not something impressive. Just something that proves the circuit is complete.

In web development, it's `console.log("Hello World")`. In embedded systems, it's blinking an LED. For BrightSign, it's displaying an image.

Today, we're taking the SD card route. No cloud. No API. No network configuration. Just you, a text editor, and a small plastic card that somehow still runs the entire digital signage industry.

Think of the SD card like a recipe card you hand directly to a chef. No phone calls, no delivery apps, no middlemen. You write the instructions, slide the card across the counter, and watch the magic happen.

---

## What You'll Need

- A BrightSign player (any model)
- An SD card (formatted FAT32 or exFAT)
- A display connected to the player via HDMI
- A text editor
- 5 minutes

That's it. No accounts. No credentials. No cloud.

---

## The Mental Model

BrightSign players are beautifully predictable machines. When they power on, they look for a file called `autorun.brs` at the root of the SD card. Find it, run it. Don't find it, look for other things to do.

This is the digital equivalent of a restaurant that only serves one dish. You walk in, sit down, and they bring you the special. No menu required. The `autorun.brs` file *is* the special.

---

## Step 1: Write the Code

Open your AI assistant of choice and paste this prompt:

```
Write a BrightScript autorun.brs file that:
1. Displays an image from the SD card ("SD:/hello-brightsign.png") fullscreen using roImagePlayer
2. Keeps displaying it forever

Print a startup message so I can see what's happening via serial console or SSH.
```

Or, if you prefer to write it yourself (or your AI is feeling uncooperative), here's what that looks like:

```brightscript
' autorun.brs - Hello BrightSign!

Sub Main()
    print "=== Hello BrightSign! ==="

    imagePlayer = CreateObject("roImagePlayer")
    imagePlayer.SetDefaultMode(1) ' https://docs.brightsign.biz/developers/roimageplayer#setdefaultmodemode-as-integer-as-boolean
    imagePlayer.DisplayFile("SD:/hello-brightsign.png")

    while true
        sleep(1000)
    end while
End Sub
```

---

## Step 2: Copy to SD Card

1. Insert the SD card into your computer
2. Save the code above as `autorun.brs` at the root of the card
3. Download `hello-brightsign.png` from this repo and copy it to the root of the card
4. Eject the card properly (this matters more than you think)

Your SD card should look like this:

```
SD:/
├── autorun.brs
└── hello-brightsign.png
```

That's the whole deployment. Two files.

---

## Step 3: Run It

1. Insert the SD card into your BrightSign player
2. Connect the player to a display
3. Power on the player

The player boots. It finds `autorun.brs`. It runs. The script downloads the image from GitHub. The image appears on screen.

Elapsed time from "I wonder if this works" to "yes, it does": under a minute.

---

## What Just Happened?

Let's trace the path of execution, because understanding this unlocks everything that comes next.

1. **Power on**: The player's bootloader wakes up and loads BrightSign OS
2. **Storage scan**: The OS checks the SD card for an `autorun.brs` file
3. **Script execution**: BrightScript interpreter runs your code
4. **Display**: `roImagePlayer` takes over the video output and shows the image

`roImagePlayer` is a window into the player's capabilities. The SDK has dozens of objects like it. Today you met one.

---

## Debugging

If nothing appears on screen:

**Check the serial console**: Connect to the player via [serial port](https://docs.brightsign.biz/advanced/serial-port-configuration?utm_source=brightdev-tutorial-1-hello-brightsign) or [SSH](https://docs.brightsign.biz/advanced/telnet-and-ssh?utm_source=brightdev-tutorial-1-hello-brightsign). You'll see print statements showing exactly where things went wrong.

**Verify the file exists**: After running once, check if `hello.png` appeared on the SD card. No file means the download failed (check network/URL).

**Check the display connection**: BrightSign outputs the content immediately on boot. If you see the boot splash but not your content, the issue is in your script.

**Verify the image format**: BrightSign supports JPEG, PNG, and BMP. Make sure your file is actually one of these formats, not just renamed.

---

## What's Next?

You've proven the circuit is complete. The player boots, runs code, downloads content, and displays it. This is the foundation everything else builds on.

But here's the limitation: to update that image, you need to physically swap the SD card. That works for one player on your desk. It doesn't work for a hundred players scattered across retail locations.

That's where the cloud comes in.

In [Tutorial 2: A Bright Cloudy Day](tutorial-2-bright-cloudy-day.md), we'll deploy the same image using the Remote DWS API. Same result, completely different path. You'll push content to players from your laptop, no SD card touching required.

The SD card method is like hand-delivering a letter. The cloud method is like sending an email. Both get the message there. One scales.

- **[BrightDev Repository](https://github.com/BrightDevelopers/BrightDev?utm_source=brightdev-tutorial-1-hello-brightsign)** - AI-first BrightSign development tutorials
- **[GitHub Issues](https://github.com/BrightDevelopers/issues?utm_source=brightdev-tutorial-1-hello-brightsign)** - Questions, ideas, bug reports
- **[BSN.cloud API Docs](https://docs.brightsign.biz/developers?utm_source=brightdev-tutorial-1-hello-brightsign)** - Complete API reference
- **[dev-cookbook](https://github.com/brightsign/dev-cookbook?utm_source=brightdev-tutorial-1-hello-brightsign)** - More code examples

---

## Quick Reference

| Object | Purpose |
|--------|---------|
| `roImagePlayer` | Display images fullscreen |
| `CreateObject()` | Instantiate any BrightSign object |

| Function | Purpose |
|----------|---------|
| `DisplayFile(path)` | Show image on screen |
| `SetDefaultMode(1)` | Scale-to-fit with aspect ratio |

---

*Part of [BrightDeveloper](https://github.com/BrightDevelopers?utm_source=brightdev-tutorial-1-hello-brightsign) - BrightSign's AI-first developer program.*
