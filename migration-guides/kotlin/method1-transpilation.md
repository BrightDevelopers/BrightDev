# Method 1: Kotlin to JavaScript Transpilation

[← Back to Main Guide](README.md)

Transpile your existing Kotlin code to JavaScript, allowing you to reuse business logic while rebuilding the UI layer. This is the fastest path to a working prototype.

## When to Use

- ✅ Need a working prototype quickly
- ✅ Well-separated business logic and UI code
- ✅ Comfortable with mocked/placeholder implementations
- ⚠️ Plan to refactor to [Method 2](method2-fresh-rebuild.md) for production

---

## AI-Driven Migration Workflow

The prompt below orchestrates the entire migration workflow - AI will handle code analysis, extraction, configuration, and transformation automatically.

- ✅ Ensure the [BrightDeveloper MCP server](https://github.com/BrightDevelopers/technical-documentation/blob/main/MCP-SERVER-HOWTO.md) is connected
- ✅ Have your Kotlin project accessible in the workspace
- ✅ Attach the [CLAUDE.md](CLAUDE.md) file to the AI context for code transformation patterns

**This single prompt automates the entire transpilation process:**

```
First, read and analyze the automation patterns at migration-guides/kotlin/CLAUDE.md.

I need you to migrate my Kotlin Android application to JavaScript for BrightSign using Method 1 (Transpilation).

Project Details:
- Project Path: {YOUR_PROJECT_PATH}
- Main Package: {YOUR_PACKAGE_NAME}
- Target BrightSign Model: {e.g., XT1144, XD1034, or "any"}
- Team Expertise: {e.g., "Strong Kotlin, Limited JavaScript"}

Android APIs Used (check all that apply):
- [ ] SharedPreferences for data storage
- [ ] Room Database
- [ ] Retrofit/OkHttp for networking
- [ ] MediaPlayer for video/audio
- [ ] Background Services
- [ ] Device sensors (camera, GPS, etc.)
- [ ] Other: {SPECIFY}

Specific Requirements:
- UI Screens: {NUMBER} activities/fragments
- Backend Integration: {YES/NO - specify API details if yes}
- Offline Support: {YES/NO}
- Custom Features: {LIST_ANY_SPECIAL_FEATURES}

Migration Tasks:
1. Analyze my Kotlin codebase and create a feature inventory
2. Set up Kotlin/JS multiplatform build configuration
3. Extract and configure business logic for transpilation
4. Identify all Android-specific APIs and create expect/actual abstractions
5. Generate transpiled JavaScript modules
6. Create HTML/CSS UI layer to replace Android Activities/Fragments
7. Set up webpack configuration with BrightSign API mocks for local development
8. Create package.json with webpack dependencies and build scripts
9. Create autorun.brs launcher file for BrightSign deployment with nodejs_enabled and inspector_server configuration
10. Provide deployment instructions and testing checklist

Follow all patterns from CLAUDE.md for code transformation, particularly:
- Remove Android Parcelable, replace with @Serializable
- Replace SharedPreferences with localStorage abstraction
- Convert Coroutines to async/await where needed
- Mock Android Context and system services as needed for transpilation.

Output a complete working prototype ready for BrightSign deployment.
```

---

## Customization Guide

**Replace the following placeholders in the prompt:**

| Placeholder | Example | Description |
|------------|---------|-------------|
| `{YOUR_PROJECT_PATH}` | `c:\Users\dev\MyKotlinApp` | Absolute path to your Kotlin project |
| `{YOUR_PACKAGE_NAME}` | `com.example.myapp` | Your Android app's main package name |
| `{YOUR_BRIGHTSIGN_MODEL}` | `XT1144` or `any` | Target BrightSign player model |
| `{NUMBER}` | `5` | Count of activities, screens, or endpoints |
| `{LIST_ANY_SPECIAL_FEATURES}` | `Barcode scanning, QR code generation` | Specific features needing attention |
| `{SPECIFY}` | Descriptive details | Additional context for your project |

**Checkbox Instructions:**
- Mark `[x]` for applicable items
- Leave `[ ]` for non-applicable items

---

## Tips for Best Results

1. **Be Specific**: Provide accurate counts and detailed feature lists - helps AI make better decisions
2. **Include Dependencies**: Mention all third-party libraries - AI will find equivalents or create abstractions
3. **Describe Custom Features**: Any unique functionality - AI needs context to recreate accurately
4. **State Constraints**: Network limitations, hardware requirements - AI will design accordingly
5. **Review AI Output**: Check generated code before proceeding to next steps
6. **Iterative Refinement**: Let AI implement incrementally, test each component
7. **Ask Questions**: If AI's approach seems unclear, ask for explanations
8. **Plan for Production**: This is a prototype - schedule Method 2 migration for production
