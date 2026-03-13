# Flutter Signage App

A minimal Flutter Web app for testing the BrightSign migration guide (BD-006).

## What it does

- Displays a full-screen video player
- Plays Big Buck Bunny and Elephants Dream from public URLs
- Shows a header, a video overlay label, and an info panel
- Includes a "Switch Video" button to cycle between the two videos

## Build

Requires Flutter SDK 3.10.0 or later.

```bash
# Install dependencies
flutter pub get

# Build for web (HTML renderer recommended for BrightSign)
flutter build web --web-renderer html

# Build output will be in build/web/
```

## Expected build output

```
build/web/
  index.html
  main.dart.js
  flutter.js
  flutter_bootstrap.js
  assets/
  canvaskit/
```

## Running locally

```bash
flutter run -d chrome
```

## Notes

- Flutter SDK was not available at the time this app was created (2026-03-13)
- Build output has not been verified in this environment
- Manual build and browser verification is required before proceeding to BD-007
