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
- A display connected to the player
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
1. Downloads an image from this URL: https://raw.githubusercontent.com/BrightDevelopers/BrightDev/main/examples/hello-brightsign/static/hello-brightsign.png
2. Saves it to the SD card as "hello.png"
3. Displays it fullscreen using roImagePlayer
4. Keeps displaying it forever

Use roUrlTransfer for the download. Print progress messages so I can see what's happening via serial console or SSH.
```

Or, if you prefer to write it yourself (or your AI is feeling uncooperative), here's what that looks like:

```brightscript
' autorun.brs - Hello BrightSign!
' Downloads and displays an image from the internet

Sub Main()
    print "=== Hello BrightSign! ==="
    print "Starting up..."

    ' The image we want to display
    imageUrl$ = "https://raw.githubusercontent.com/BrightDevelopers/BrightDev/main/examples/hello-brightsign/static/hello-brightsign.png"
    localPath$ = "SD:/hello.png"

    ' Download the image
    print "Downloading image..."
    urlTransfer = CreateObject("roUrlTransfer")
    urlTransfer.SetUrl(imageUrl$)

    ' Enable HTTPS
    urlTransfer.SetCertificatesFile("common:/certs/ca-bundle.crt")
    urlTransfer.InitClientCertificates()

    ' Download to local file
    responseCode = urlTransfer.GetToFile(localPath$)

    if responseCode = 200 then
        print "Download complete!"
    else
        print "Download failed with code: "; responseCode
        print "Attempting to display anyway (file may already exist)..."
    end if

    ' Create the image player
    print "Creating image player..."
    imagePlayer = CreateObject("roImagePlayer")

    ' Scale image to fit screen while maintaining aspect ratio
    imagePlayer.SetDefaultMode(1)

    ' Display the image
    print "Displaying image..."
    result = imagePlayer.DisplayFile(localPath$)

    if result then
        print "Image displayed successfully!"
    else
        print "Failed to display image"
    end if

    print "=== Running ==="

    ' Keep the script alive forever
    while true
        sleep(1000)
    end while
End Sub
```

---

## Step 2: Copy to SD Card

1. Insert the SD card into your computer
2. Save the code above as `autorun.brs` at the root of the card
3. Eject the card properly (this matters more than you think)

Your SD card should look like this:

```
SD:/
└── autorun.brs
```

That's the whole deployment. One file.

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
4. **Network fetch**: `roUrlTransfer` reaches out to GitHub and downloads the PNG
5. **File write**: The image saves to the SD card
6. **Display**: `roImagePlayer` takes over the video output and shows the image

Each of these objects (`roUrlTransfer`, `roImagePlayer`) is a window into the player's capabilities. The SDK has dozens of them. Today you met two.

---

## The Offline Alternative

Don't want to depend on network connectivity? Download the image yourself first:

1. Save `hello-brightsign.png` to your SD card
2. Simplify the script:

```brightscript
Sub Main()
    print "=== Hello BrightSign (Offline) ==="

    imagePlayer = CreateObject("roImagePlayer")
    imagePlayer.SetDefaultMode(1)
    imagePlayer.DisplayFile("SD:/hello-brightsign.png")

    while true
        sleep(1000)
    end while
End Sub
```

Your SD card now looks like:

```
SD:/
├── autorun.brs
└── hello-brightsign.png
```

This is the "airplane mode" version. It works without internet access. The tradeoff is obvious: you can't update the content without physically touching the card.

---

## Debugging

If nothing appears on screen:

**Check the serial console**: Connect to the player via serial port or SSH. You'll see print statements showing exactly where things went wrong.

**Verify the file exists**: After running once, check if `hello.png` appeared on the SD card. No file means the download failed (check network/URL).

**Check the display connection**: BrightSign outputs video immediately on boot. If you see the boot splash but not your content, the issue is in your script.

**Verify the image format**: BrightSign supports JPEG, PNG, and BMP. Make sure your file is actually one of these formats, not just renamed.

---

## What's Next?

You've proven the circuit is complete. The player boots, runs code, downloads content, and displays it. This is the foundation everything else builds on.

But here's the limitation: to update that image, you need to physically swap the SD card. That works for one player on your desk. It doesn't work for a hundred players scattered across retail locations.

That's where the cloud comes in.

In [Tutorial 2: A Bright Cloudy Day](tutorial-2-bright-cloudy-day.md), we'll deploy the same image using the Remote DWS API. Same result, completely different path. You'll push content to players from your laptop, no SD card touching required.

The SD card method is like hand-delivering a letter. The cloud method is like sending an email. Both get the message there. One scales.

---

## Quick Reference

| Object | Purpose |
|--------|---------|
| `roUrlTransfer` | HTTP/HTTPS requests |
| `roImagePlayer` | Display images fullscreen |
| `CreateObject()` | Instantiate any BrightSign object |

| Function | Purpose |
|----------|---------|
| `GetToFile(path)` | Download URL to local file |
| `DisplayFile(path)` | Show image on screen |
| `SetDefaultMode(1)` | Scale-to-fit with aspect ratio |

---

*Part of [BrightDeveloper](https://github.com/BrightDevelopers) - BrightSign's AI-first developer program.*
