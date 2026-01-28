# Method 1: Kotlin to JavaScript Transpilation

> **🤖 AI-Driven Transpilation**: This method uses AI to automate Kotlin-to-JavaScript transpilation. You'll provide high-level goals, and AI will handle code extraction, configuration, and transformation. For machine-readable patterns, see [CLAUDE.md](CLAUDE.md)

[← Back to Main Guide](README.md)

---

## Overview

Transpile your existing Kotlin code to JavaScript, allowing you to reuse business logic while rebuilding the UI layer. This is the fastest path to a working prototype.

**⏱️ Timeline**: 1-2 weeks  
**🎯 Best for**: Rapid prototyping, simple applications  
**⚠️ Note**: Plan to refactor to [Method 2](method2-fresh-rebuild.md) for production

---

## When to Use

- ✅ Need a working prototype quickly
- ✅ Well-separated business logic and UI code
- ✅ Comfortable with mocked/placeholder implementations
- ⚠️ Understand this is a temporary solution

---

## AI-Driven Migration Workflow

### Step 1: AI Analyzes and Extracts Business Logic

**Use this AI prompt instead of manually consolidating code:**

```
Analyze my Kotlin Android application and extract business logic for transpilation:

1. Scan all Kotlin files and identify:
   - Data classes and models
   - Repository patterns and data access code
   - Use cases and business rules
   - Network logic (Ktor, Retrofit, OkHttp)
   - Utility functions
   
2. Separate from Android-specific code:
   - Activities and Fragments (exclude these)
   - Android Views and layouts (exclude these)
   - Context-dependent code (flag for abstraction)
   
3. Create a shared module structure:
   - commonMain/ for platform-agnostic logic
   - jsMain/ for JavaScript-specific implementations
   
4. Identify all Android APIs that need expect/actual abstractions

5. Generate a migration plan with:
   - List of files to transpile
   - Dependencies to convert
   - APIs requiring abstraction
   - Estimated effort and complexity

Show me the proposed structure and ask for confirmation before proceeding.
```

**What AI will extract:**
- Data classes and models
- Repository patterns
- Use cases / business rules
- Network logic (using Ktor or similar)
- Utility functions

**What AI will exclude:**
- Activities and Fragments
- Android Views
- Context-dependent code

### Step 2: AI Configures Kotlin/JS Compilation

**Use this AI prompt:**

```
Set up Kotlin/JS multiplatform compilation for my project:

1. Create or modify build.gradle.kts with:
   - Kotlin multiplatform plugin (latest stable version)
   - Serialization plugin for data classes
   - JS target with IR compiler
   - Node.js binaries configuration
   
2. Configure sourceSets for:
   - commonMain (shared business logic)
   - jsMain (JavaScript-specific implementations)
   
3. Add required dependencies:
   - kotlinx-coroutines-core for async operations
   - kotlinx-serialization-json for data serialization
   - ktor-client-core and ktor-client-js for networking
   
4. Set up package.json generation with proper metadata

5. Verify configuration and show me what you've created

Provide the complete build.gradle.kts file.
```

**Example configuration AI will generate:**
```kotlin
plugins {
    kotlin("multiplatform") version "1.9.20"
    kotlin("plugin.serialization") version "1.9.20"
}

kotlin {
    js(IR) {
        nodejs()
        binaries.executable()
        
        compilations["main"].packageJson {
            customField("name", "brightsign-app-logic")
            customField("version", "1.0.0")
        }
    }
    
    sourceSets {
        val jsMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
                implementation("io.ktor:ktor-client-core:2.3.5")
                implementation("io.ktor:ktor-client-js:2.3.5")
            }
        }
    }
}
```

### Step 3: AI Creates Platform Abstractions

**Use this AI prompt:**

```
Create expect/actual abstractions for all Android-specific APIs in my codebase:

1. Analyze my code and identify all Android API usage:
   - SharedPreferences
   - Context.getSystemService()
   - File I/O operations
   - System properties
   - Any other android.* imports
   
2. For each Android API, create:
   - expect class/interface in commonMain
   - actual implementation in jsMain using browser/Node.js APIs
   
3. Apply these transformation rules:
   - SharedPreferences → localStorage wrapper
   - File I/O → Node.js fs module
   - Context → platform-agnostic configuration object
   - Toast.makeText() → console.log wrapper
   
4. Refactor existing code to use the new abstractions

5. Show me each abstraction and ask for approval before applying

Provide complete code for all abstractions.
```

**Example transformation AI will create:**

**Before (Android-specific):**
```kotlin
class UserRepository(private val context: Context) {
    private val prefs = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
    
    fun saveUserId(userId: String) {
        prefs.edit().putString("user_id", userId).apply()
    }
}
```

**After (Platform-agnostic - AI generated):**
```kotlin
// In commonMain - AI creates this abstraction
expect class PlatformStorage {
    fun saveString(key: String, value: String)
    fun getString(key: String): String?
}

class UserRepository(private val storage: PlatformStorage) {
    fun saveUserId(userId: String) {
        storage.saveString("user_id", userId)
    }
}

// In jsMain - AI creates this implementation
actual class PlatformStorage {
    actual fun saveString(key: String, value: String) {
        js("localStorage.setItem(key, value)")
    }
    
    actual fun getString(key: String): String? {
        return js("localStorage.getItem(key)") as? String
    }
}
```

### Step 4: AI Builds HTML/JavaScript UI

**Use this AI prompt:**

```
Create a web-based UI that consumes my transpiled Kotlin business logic:

1. For each Android Activity/Fragment in my app:
   - Analyze the UI components and interactions
   - Create equivalent HTML structure
   - Generate CSS for styling
   - Write JavaScript event handlers
   
2. Set up module imports from transpiled Kotlin code

3. Implement UI-to-business-logic bindings:
   - Button clicks → repository methods
   - Form inputs → data models
   - Display updates → observable patterns
   
4. Create webpack configuration for bundling

5. Show me each UI component for review

Provide complete HTML, CSS, and JavaScript files.
```

**Example UI AI will generate:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>BrightSign App</title>
    <style>
        /* AI-generated styles */
        .container { padding: 20px; }
        button { padding: 10px 20px; }
    </style>
</head>
<body>
    <div class="container">
        <input type="text" id="userIdInput" placeholder="Enter User ID">
        <button id="saveButton">Save User</button>
    </div>
    
    <script type="module">
        import { PlatformStorage, UserRepository } from './kotlin-output/app-logic.js';
        
        const storage = new PlatformStorage();
        const userRepo = new UserRepository(storage);
        
        document.getElementById('saveButton').addEventListener('click', () => {
            const userId = document.getElementById('userIdInput').value;
            userRepo.saveUserId(userId);
        });
    </script>
</body>
</html>
```

---

## Common Android → JavaScript Replacements

| Android API | JavaScript/BrightSign Equivalent |
|------------|----------------------------------|
| `SharedPreferences` | `localStorage` or `IndexedDB` |
| `Toast.makeText()` | `console.log()` or custom DOM notification |
| `Context.getSystemService()` | BrightSign device APIs |
| `File` / `FileInputStream` | Node.js `fs` module |
| Coroutines | `async/await` |
| `OkHttp` / `Retrofit` | `fetch()` API |

For more comprehensive API replacements, see the [main guide](README.md#common-api-replacements).

---

# AI-Assisted Migration with BrightDeveloper MCP

The BrightDeveloper MCP server automates your Kotlin to JavaScript migration. The prompt below orchestrates the entire workflow - AI will handle code analysis, extraction, configuration, and transformation automatically.

> **💡 AI Does the Work**: You provide project context, AI does the migration. No manual steps required.

## Prerequisites

Before using this prompt:
- ✅ Ensure the [BrightDeveloper MCP server](https://github.com/BrightDevelopers/technical-documentation/blob/main/MCP-SERVER-HOWTO.md) is connected
- ✅ Have your Kotlin project accessible in the workspace
- ✅ Optionally review this guide to understand what AI will do

---

## Complete AI Migration Prompt for Method 1

**This single prompt automates the entire transpilation process:**

```
First, read and analyze the migration guide at migration-guides/kotlin/method1-transpilation.md and the automation patterns at migration-guides/kotlin/CLAUDE.md.

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
- Mock Android Context and system services

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

---

## Next Steps

- [← Return to Main Guide](README.md)
- [View Method 2: Fresh Rebuild →](method2-fresh-rebuild.md) (Recommended for production)
- [View Advanced Migration Approaches](README.md#advanced-migration-approaches)
