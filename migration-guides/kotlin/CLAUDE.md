# AI Migration Instructions for Kotlin to JavaScript/Node.js (BrightSign)

> **Purpose**: This file contains machine-readable instructions, automation rules, and transformation patterns for AI systems performing automated migration of Kotlin (Android) applications to JavaScript/Node.js for BrightSign platforms.
>
> **Human-Readable Guide**: See [README.md](README.md) for the main documentation.

---

## Document Metadata

```json
{
  "document_type": "ai_migration_instructions",
  "version": "3.0",
  "target_platform": "brightsign",
  "source_platform": "android_kotlin",
  "automation_level": "full_auto_with_placeholders",
  "primary_methods": ["transpilation", "fresh_rebuild"],
  "advanced_methods": ["kotlin_multiplatform", "webassembly", "pwa_hybrid"],
  "recommended_method": "fresh_rebuild",
  "quick_prototype_method": "transpilation",
  "note": "Primary methods cover 90%+ of use cases. Advanced methods for specialized scenarios only."
}
```

---

## Migration Method Selection Decision Tree

```json
{
  "decision_tree": {
    "root": {
      "question": "What is your primary goal?",
      "options": {
        "rapid_prototype": {
          "result": "METHOD_1_TRANSPILATION",
          "note": "Plan to rebuild using Method 2 for production"
        },
        "production_quality": {
          "result": "METHOD_2_FRESH_REBUILD",
          "note": "Recommended for 90%+ of projects"
        },
        "specialized_needs": {
          "next": "check_specialized_requirements",
          "note": "Only if you have specific advanced requirements"
        }
      }
    },
    "check_specialized_requirements": {
      "question": "What specialized requirement do you have?",
      "options": {
        "multi_platform_code_sharing": {
          "result": "ADVANCED_METHOD_3_KOTLIN_MULTIPLATFORM",
          "condition": "Need to share code with iOS/Web/other platforms"
        },
        "cpu_intensive_operations": {
          "result": "ADVANCED_METHOD_4_WEBASSEMBLY",
          "condition": "Image processing, ML inference, complex algorithms"
        },
        "offline_first_app": {
          "result": "ADVANCED_METHOD_5_PWA",
          "condition": "Must work offline, needs service workers"
        },
        "none_of_above": {
          "result": "METHOD_2_FRESH_REBUILD",
          "note": "Use the primary recommended method"
        }
      }
    }
  }
}
```

---

## Method Specifications

### Method 1: Transpilation (Primary - Prototyping)

```json
{
  "method_id": "transpilation",
  "method_type": "primary",
  "difficulty": "medium",
  "time_to_first_run": "1-2 weeks",
  "maintenance_complexity": "high",
  "debugging_ease": "low",
  "brightsign_recommendation": "rapid_prototyping_only",
  "production_ready": false,
  "migration_plan": "Use for proof-of-concept, then migrate to Method 2 for production",
  "prerequisites": [
    "kotlin_codebase_with_separated_business_logic",
    "gradle_build_configuration",
    "npm_nodejs_installed"
  ],
  "outputs": [
    "transpiled_javascript_modules",
    "npm_package_for_business_logic",
    "html_ui_layer"
  ]
}
```

### Method 2: Fresh Rebuild (Primary - Production) ⭐

```json
{
  "method_id": "fresh_rebuild",
  "method_type": "primary",
  "difficulty": "medium-high",
  "time_to_first_run": "2-4 weeks",
  "maintenance_complexity": "low",
  "debugging_ease": "high",
  "brightsign_recommendation": "production_deployment",
  "production_ready": true,
  "recommended_for": "90%+ of all migration projects",
  "prerequisites": [
    "javascript_nodejs_expertise",
    "understanding_of_original_app_logic",
    "brightsign_development_environment"
  ],
  "outputs": [
    "native_html_ui",
    "nodejs_backend",
    "brightsign_optimized_code"
  ]
}
```

### Method 3: Kotlin Multiplatform (Advanced)

```json
{
  "method_id": "kotlin_multiplatform",
  "method_type": "advanced",
  "difficulty": "medium",
  "time_to_first_run": "2-3 weeks",
  "maintenance_complexity": "medium",
  "debugging_ease": "medium",
  "brightsign_recommendation": "specialized_use_case_only",
  "when_to_use": "Already using KMM or need to share code across Android/iOS/Web/BrightSign",
  "note": "For most projects, use Method 2 instead",
  "prerequisites": [
    "kotlin_multiplatform_knowledge",
    "existing_kmm_project_or_willingness_to_refactor",
    "gradle_configuration_skills"
  ],
  "advantages": [
    "type_safe_shared_code",
    "better_ide_support_than_transpilation",
    "code_sharing_with_other_platforms"
  ]
}
```

### Method 4: WebAssembly (Advanced)

```json
{
  "method_id": "webassembly",
  "method_type": "advanced",
  "difficulty": "high",
  "time_to_first_run": "3-5 weeks",
  "maintenance_complexity": "high",
  "debugging_ease": "low",
  "brightsign_recommendation": "performance_critical_only",
  "when_to_use": "Only when you have proven CPU-intensive bottlenecks",
  "note": "Combine with Method 2 for UI. Most apps don't need WASM.",
  "prerequisites": [
    "kotlin_native_experience",
    "wasm_understanding",
    "performance_profiling_skills"
  ],
  "use_cases": [
    "cpu_intensive_operations",
    "image_processing",
    "data_encryption",
    "complex_algorithms"
  ]
}
```

### Method 5: PWA Hybrid (Advanced)

```json
{
  "method_id": "pwa_hybrid",
  "method_type": "advanced",
  "difficulty": "medium",
  "time_to_first_run": "2-3 weeks",
  "maintenance_complexity": "low",
  "debugging_ease": "high",
  "brightsign_recommendation": "offline_first_apps_only",
  "when_to_use": "App must work offline or needs service worker caching",
  "note": "For most apps, Method 2 with basic caching is sufficient",
  "prerequisites": [
    "service_worker_knowledge",
    "pwa_architecture_understanding",
    "brightsign_chromium_features"
  ],
  "advantages": [
    "offline_functionality",
    "app_like_experience",
    "automatic_updates",
    "installable"
  ]
}
```

---

## Method Selection Guidance for AI

```json
{
  "ai_method_selection_rules": {
    "default_recommendation": "METHOD_2_FRESH_REBUILD",
    "reasoning": "Covers 90%+ of use cases with best long-term value",
    "decision_logic": {
      "if_user_says": [
        "quick prototype",
        "proof of concept",
        "demo",
        "1-2 weeks"
      ],
      "then_recommend": "METHOD_1_TRANSPILATION",
      "with_caveat": "Plan to rebuild using Method 2 for production"
    },
    "advanced_method_triggers": {
      "kotlin_multiplatform": [
        "already using KMM",
        "share code with iOS",
        "multi-platform",
        "strong Kotlin team, weak JS team"
      ],
      "webassembly": [
        "image processing",
        "ML inference",
        "CPU intensive",
        "performance critical",
        "complex algorithms"
      ],
      "pwa": [
        "offline first",
        "service worker",
        "must work offline",
        "no network connectivity"
      ]
    },
    "avoid_confusion": "Do NOT present all 5 methods equally. Lead with 2 primary methods.",
    "progressive_disclosure": "Only mention advanced methods when user has specialized needs"
  }
}
```

---

## Code Transformation Patterns

### Remove Android Parcelable

```json
{
  "rule": "remove_android_parcelable",
  "pattern": {
    "imports": ["android.os.Parcelable", "kotlinx.parcelize.Parcelize"],
    "annotations": ["@Parcelize"],
    "interfaces": [": Parcelable"]
  },
  "replacement": {
    "add_import": "kotlinx.serialization.Serializable",
    "add_annotation": "@Serializable",
    "remove_interface": "Parcelable"
  }
}
```

### Replace Android Storage

```json
{
  "rule": "replace_android_storage",
  "detector": {
    "class_contains": ["SharedPreferences", "Context"],
    "method_calls": ["getSharedPreferences", "edit()", "putString", "getString"]
  },
  "transformation": {
    "create_platform_abstraction": {
      "class_name": "BrightSignPlatform",
      "methods": {
        "savePreference": {
          "implementation": "localStorage.setItem(key, JSON.stringify(value))",
          "async": false,
          "note": "Synchronous for Node v18.18.2 CommonJS compatibility"
        },
        "getPreference": {
          "implementation": "JSON.parse(localStorage.getItem(key))",
          "async": false,
          "note": "Synchronous for Node v18.18.2 CommonJS compatibility"
        }
      }
    },
    "synchronous_initialization": {
      "pattern": "this.initialize(); // Called in constructor",
      "note": "Initialize synchronously using require() for CommonJS modules"
    },
    "add_placeholder": "AI_PLACEHOLDER: Verify localStorage availability on BrightSign"
  }
}
```

### Migrate Android Activity to HTML

```json
{
  "rule": "migrate_android_activity_to_html",
  "steps": [
    {
      "extract_ui_elements": {
        "TextView": "convert_to_p_or_span",
        "EditText": "convert_to_input",
        "Button": "convert_to_button",
        "RecyclerView": "convert_to_div_with_js_templating",
        "ImageView": "convert_to_img"
      }
    },
    {
      "extract_logic": {
        "onCreate": "convert_to_DOMContentLoaded",
        "observe": "convert_to_callback_pattern",
        "click_listeners": "convert_to_addEventListener"
      }
    },
    {
      "add_placeholders": [
        "AI_PLACEHOLDER: Add CSS styling",
        "AI_PLACEHOLDER: Add error handling",
        "AI_PLACEHOLDER: Test on BrightSign device"
      ]
    }
  ]
}
```

---

## Android to BrightSign API Mapping Table

```json
{
  "api_mappings": [
    {
      "category": "storage",
      "android_api": "SharedPreferences",
      "methods": {
        "getString": {
          "brightsign_api": "localStorage.getItem",
          "code_pattern": "localStorage.getItem(key)",
          "notes": "Returns null if key doesn't exist",
          "validation": "check_localstorage_available"
        },
        "putString": {
          "brightsign_api": "localStorage.setItem",
          "code_pattern": "localStorage.setItem(key, value)",
          "notes": "Synchronous operation",
          "validation": "check_storage_quota"
        },
        "getInt": {
          "brightsign_api": "localStorage.getItem + parseInt",
          "code_pattern": "parseInt(localStorage.getItem(key) || '0')",
          "notes": "Convert string to number",
          "validation": "validate_number_conversion"
        }
      }
    },
    {
      "category": "storage",
      "android_api": "IndexedDB (alternative)",
      "brightsign_api": "IndexedDB",
      "use_case": "Large data storage, structured data",
      "code_pattern": "See BrightSign IndexedDB examples",
      "reference": "https://github.com/brightsign/dev-cookbook/tree/main/examples/indexeddb-caching"
    },
    {
      "category": "networking",
      "android_api": "OkHttp / Retrofit",
      "brightsign_api": "fetch API / axios",
      "methods": {
        "GET": {
          "code_pattern": "fetch(url).then(r => r.json())",
          "async_pattern": "await fetch(url).then(r => r.json())",
          "validation": "check_network_connectivity"
        },
        "POST": {
          "code_pattern": "fetch(url, { method: 'POST', body: JSON.stringify(data) })",
          "notes": "Add Content-Type header",
          "validation": "check_request_payload"
        }
      }
    },
    {
      "category": "ui_notifications",
      "android_api": "Toast",
      "brightsign_replacement": "console.log / DOM element",
      "mock_implementation": "console.log('[Toast] ' + message)",
      "production_alternative": "Create HTML notification overlay",
      "code_example": {
        "kotlin": "Toast.makeText(context, msg, LENGTH_SHORT).show()",
        "javascript": "console.log('[Toast]', msg); // AI_PLACEHOLDER: Add UI notification"
      }
    },
    {
      "category": "ui_dialogs",
      "android_api": "AlertDialog",
      "brightsign_replacement": "HTML dialog element / Modal",
      "mock_implementation": "window.confirm() / window.alert()",
      "production_alternative": "Custom HTML modal component",
      "code_example": {
        "kotlin": "AlertDialog.Builder(context).setMessage(msg).show()",
        "javascript": "const confirmed = window.confirm(msg); // AI_PLACEHOLDER: Replace with custom modal"
      }
    },
    {
      "category": "device_info",
      "android_api": "Build.VERSION / Build.MODEL",
      "brightsign_api": "BrightSign Device Info API",
      "methods": {
        "getDeviceModel": {
          "code_pattern": "const { default: DeviceInfo } = await import('@brightsign/deviceinfo'); const deviceInfo = new DeviceInfo(); return deviceInfo.model",
          "mock": "'BRIGHTSIGN_XD234'",
          "validation": "check_brightsign_api_available",
          "note": "Use dynamic import for webpack external compatibility"
        },
        "getSerialNumber": {
          "code_pattern": "await this.ensureInitialized(); return this.deviceInfo.serialNumber",
          "mock": "'MOCK_SERIAL_12345'",
          "validation": "check_brightsign_api_available",
          "note": "Requires async initialization pattern"
        }
      }
    },
    {
      "category": "file_system",
      "android_api": "File / FileInputStream",
      "brightsign_api": "Node.js fs module",
      "methods": {
        "readFile": {
          "code_pattern": "const fs = require('fs'); fs.readFileSync(path, 'utf8')",
          "async_pattern": "await fs.promises.readFile(path, 'utf8')",
          "validation": "check_file_exists"
        },
        "writeFile": {
          "code_pattern": "fs.writeFileSync(path, content)",
          "async_pattern": "await fs.promises.writeFile(path, content)",
          "validation": "check_write_permissions"
        }
      }
    },
    {
      "category": "media",
      "android_api": "MediaPlayer",
      "brightsign_api": "HTML5 Video/Audio + BrightSign Video API",
      "methods": {
        "playVideo": {
          "code_pattern": "<video id='player' src='video.mp4'></video>; document.getElementById('player').play()",
          "brightsign_enhanced": "Use @brightsign/videooutput for advanced control",
          "validation": "check_video_codec_support"
        },
        "playAudio": {
          "code_pattern": "new Audio(src).play()",
          "brightsign_enhanced": "Use @brightsign/audio for zone control",
          "validation": "check_audio_format_support"
        }
      }
    },
    {
      "category": "threading",
      "android_api": "Thread / AsyncTask / Coroutines",
      "brightsign_replacement": "Web Workers / async-await / Promises",
      "methods": {
        "background_task": {
          "android": "launch(Dispatchers.IO) { ... }",
          "javascript": "async function backgroundTask() { await ... }",
          "web_worker": "const worker = new Worker('worker.js')",
          "notes": "Node.js is single-threaded; use async/await or workers"
        }
      }
    },
    {
      "category": "unsupported",
      "android_apis": [
        "Bluetooth",
        "NFC",
        "Camera",
        "Sensors (Accelerometer, Gyroscope)",
        "Vibrator",
        "Telephony"
      ],
      "brightsign_status": "NOT_SUPPORTED",
      "migration_strategy": "MOCK_WITH_PLACEHOLDER",
      "mock_implementation": "console.warn('API not supported on BrightSign'); return null;"
    }
  ]
}
```

### API Replacement Automation Rule

```json
{
  "rule": "auto_replace_android_apis",
  "process": [
    {
      "scan_imports": ["android.*", "androidx.*"],
      "lookup_mapping_table": true,
      "apply_transformation": {
        "if_mapping_exists": "replace_with_brightsign_equivalent",
        "if_no_mapping": "create_mock_with_placeholder",
        "add_comment": "AI_PLACEHOLDER: Verify replacement for [API_NAME]"
      }
    }
  ]
}
```

---

## Dependency Mapping Tables

```json
{
  "dependency_mappings": [
    {
      "category": "networking",
      "android_libraries": [
        {
          "name": "Retrofit",
          "gradle": "com.squareup.retrofit2:retrofit",
          "javascript_equivalent": "axios",
          "npm_install": "npm install axios",
          "usage_example": {
            "retrofit": "interface ApiService { @GET('/users/{id}') suspend fun getUser(@Path('id') id: String): User }",
            "axios": "const getUser = async (id) => { const response = await axios.get(`/users/${id}`); return response.data; }"
          },
          "migration_notes": "Convert interface methods to async functions"
        },
        {
          "name": "OkHttp",
          "gradle": "com.squareup.okhttp3:okhttp",
          "javascript_equivalent": "node-fetch / native fetch",
          "npm_install": "npm install node-fetch (Node.js) or use native fetch (browser)",
          "usage_example": {
            "okhttp": "val request = Request.Builder().url(url).build(); client.newCall(request).execute()",
            "fetch": "const response = await fetch(url); const data = await response.json();"
          }
        },
        {
          "name": "Ktor Client",
          "gradle": "io.ktor:ktor-client-android",
          "javascript_equivalent": "ktor-client-js",
          "npm_install": "Use Kotlin/JS transpilation",
          "usage_example": {
            "kotlin": "val client = HttpClient(Android); client.get(url)",
            "kotlin_js": "val client = HttpClient(Js); client.get(url)"
          },
          "migration_notes": "Can keep Ktor if using Kotlin/JS transpilation"
        }
      ]
    },
    {
      "category": "json_serialization",
      "android_libraries": [
        {
          "name": "Gson",
          "gradle": "com.google.code.gson:gson",
          "javascript_equivalent": "JSON.parse / JSON.stringify (native)",
          "npm_install": "Built-in, no install needed",
          "usage_example": {
            "gson": "val user = gson.fromJson(jsonString, User::class.java)",
            "javascript": "const user = JSON.parse(jsonString);"
          },
          "migration_notes": "JavaScript has native JSON support"
        },
        {
          "name": "kotlinx.serialization",
          "gradle": "org.jetbrains.kotlinx:kotlinx-serialization-json",
          "javascript_equivalent": "kotlinx.serialization (Kotlin/JS)",
          "npm_install": "Use with Kotlin/JS compilation",
          "usage_example": {
            "kotlin": "@Serializable data class User(val name: String); Json.decodeFromString<User>(jsonString)",
            "kotlin_js": "Same as Kotlin - works in transpiled JS"
          },
          "migration_notes": "Fully compatible with Kotlin/JS"
        },
        {
          "name": "Moshi",
          "gradle": "com.squareup.moshi:moshi",
          "javascript_equivalent": "JSON native / class-transformer",
          "npm_install": "npm install class-transformer reflect-metadata",
          "migration_notes": "For type-safe JSON mapping in TypeScript"
        }
      ]
    },
    {
      "category": "dependency_injection",
      "android_libraries": [
        {
          "name": "Dagger / Hilt",
          "gradle": "com.google.dagger:hilt-android",
          "javascript_equivalent": "InversifyJS / manual DI",
          "npm_install": "npm install inversify reflect-metadata",
          "usage_example": {
            "hilt": "@Inject lateinit var repository: UserRepository",
            "inversify": "const repository = container.get<UserRepository>(TYPES.UserRepository);"
          },
          "migration_notes": "Or use simple constructor injection pattern"
        },
        {
          "name": "Koin",
          "gradle": "io.insert-koin:koin-android",
          "javascript_equivalent": "Awilix / Bottle",
          "npm_install": "npm install awilix",
          "usage_example": {
            "koin": "val repository: UserRepository by inject()",
            "awilix": "const { userRepository } = container.cradle;"
          }
        }
      ]
    },
    {
      "category": "async_reactive",
      "android_libraries": [
        {
          "name": "Kotlin Coroutines",
          "gradle": "org.jetbrains.kotlinx:kotlinx-coroutines-android",
          "javascript_equivalent": "async/await (native) / kotlinx-coroutines-core (Kotlin/JS)",
          "usage_example": {
            "kotlin": "suspend fun fetchData(): Data { return api.getData() }",
            "javascript": "async function fetchData() { return await api.getData(); }"
          },
          "migration_notes": "JavaScript async/await is very similar to Kotlin coroutines"
        },
        {
          "name": "RxJava / RxKotlin",
          "gradle": "io.reactivex.rxjava3:rxjava",
          "javascript_equivalent": "RxJS",
          "npm_install": "npm install rxjs",
          "usage_example": {
            "rxjava": "Observable.just(1, 2, 3).map { it * 2 }.subscribe()",
            "rxjs": "of(1, 2, 3).pipe(map(x => x * 2)).subscribe();"
          },
          "migration_notes": "RxJS is very similar to RxJava"
        },
        {
          "name": "Flow (Kotlin)",
          "gradle": "org.jetbrains.kotlinx:kotlinx-coroutines-core",
          "javascript_equivalent": "RxJS Observable / async generators",
          "usage_example": {
            "kotlin": "flow { emit(1); emit(2) }.collect { print(it) }",
            "javascript": "async function* flow() { yield 1; yield 2; } for await (const val of flow()) { console.log(val); }"
          }
        }
      ]
    },
    {
      "category": "database",
      "android_libraries": [
        {
          "name": "Room",
          "gradle": "androidx.room:room-runtime",
          "javascript_equivalent": "IndexedDB / LowDB / SQLite (Node.js)",
          "npm_install": "npm install lowdb (or use IndexedDB API)",
          "usage_example": {
            "room": "@Entity data class User(@PrimaryKey val id: String); @Dao interface UserDao { @Query('SELECT * FROM user') fun getAll(): List<User> }",
            "indexeddb": "See IndexedDB example / BrightSign cookbook"
          },
          "migration_notes": "IndexedDB for browser, SQLite for Node.js backend",
          "reference": "https://github.com/brightsign/dev-cookbook/tree/main/examples/indexeddb-caching"
        },
        {
          "name": "SQLite (Android)",
          "gradle": "androidx.sqlite:sqlite",
          "javascript_equivalent": "better-sqlite3 (Node.js)",
          "npm_install": "npm install better-sqlite3",
          "usage_example": {
            "android": "db.query('user', null, 'id = ?', arrayOf(userId), null, null, null)",
            "nodejs": "const stmt = db.prepare('SELECT * FROM user WHERE id = ?'); stmt.get(userId);"
          }
        }
      ]
    },
    {
      "category": "image_loading",
      "android_libraries": [
        {
          "name": "Glide",
          "gradle": "com.github.bumptech.glide:glide",
          "javascript_equivalent": "HTML <img> / Canvas API",
          "usage_example": {
            "glide": "Glide.with(context).load(url).into(imageView)",
            "javascript": "document.getElementById('img').src = url;"
          },
          "migration_notes": "Browser handles image loading natively"
        },
        {
          "name": "Coil",
          "gradle": "io.coil-kt:coil",
          "javascript_equivalent": "Native HTML image loading",
          "usage_example": {
            "coil": "imageView.load(url)",
            "javascript": "const img = new Image(); img.src = url; img.onload = () => { ... };"
          }
        }
      ]
    },
    {
      "category": "testing",
      "android_libraries": [
        {
          "name": "JUnit",
          "gradle": "junit:junit",
          "javascript_equivalent": "Jest / Mocha",
          "npm_install": "npm install --save-dev jest",
          "usage_example": {
            "junit": "@Test fun testSum() { assertEquals(4, 2 + 2) }",
            "jest": "test('sum', () => { expect(2 + 2).toBe(4); });"
          }
        },
        {
          "name": "Mockito",
          "gradle": "org.mockito:mockito-core",
          "javascript_equivalent": "Jest mocks / Sinon.js",
          "npm_install": "npm install --save-dev sinon",
          "usage_example": {
            "mockito": "val repo = mock(UserRepository::class.java); `when`(repo.getUser()).thenReturn(user)",
            "jest": "const repo = { getUser: jest.fn().mockReturnValue(user) };"
          }
        }
      ]
    },
    {
      "category": "logging",
      "android_libraries": [
        {
          "name": "Timber",
          "gradle": "com.jakewharton.timber:timber",
          "javascript_equivalent": "console / Winston (Node.js)",
          "npm_install": "npm install winston (for advanced logging)",
          "usage_example": {
            "timber": "Timber.d('Debug message'); Timber.e(error, 'Error message')",
            "console": "console.log('Debug message'); console.error('Error message', error);"
          }
        }
      ]
    },
    {
      "category": "date_time",
      "android_libraries": [
        {
          "name": "kotlinx-datetime",
          "gradle": "org.jetbrains.kotlinx:kotlinx-datetime",
          "javascript_equivalent": "Date (native) / Day.js / date-fns",
          "npm_install": "npm install dayjs",
          "usage_example": {
            "kotlin": "Clock.System.now(); LocalDate.parse('2024-01-15')",
            "javascript": "new Date(); new Date('2024-01-15');"
          },
          "migration_notes": "kotlinx-datetime works with Kotlin/JS if using transpilation"
        }
      ]
    }
  ]
}
```

---

## Migration Validation Framework

```json
{
  "validation_framework": {
    "pre_migration_checks": [
      {
        "check_id": "analyze_android_dependencies",
        "description": "Scan build.gradle for all dependencies",
        "command": "grep 'implementation' build.gradle",
        "validation": "All dependencies have JavaScript equivalents mapped",
        "failure_action": "AI_QUESTION: Unknown dependency found: [DEPENDENCY_NAME]. What is its purpose?"
      },
      {
        "check_id": "identify_android_apis",
        "description": "Scan for Android-specific imports",
        "pattern": "import android\\.|import androidx\\.",
        "validation": "All Android APIs flagged for replacement",
        "failure_action": "Create mock/placeholder implementation"
      },
      {
        "check_id": "assess_ui_complexity",
        "description": "Count activities, fragments, custom views",
        "metrics": {
          "activities": "count .kt files extending Activity",
          "fragments": "count .kt files extending Fragment",
          "custom_views": "count .kt files extending View"
        },
        "estimate_effort": "UI_SCREENS_COUNT * 2 hours per screen"
      }
    ],
    "compilation_checks": [
      {
        "check_id": "kotlin_js_compilation_success",
        "method": "transpilation",
        "command": "./gradlew jsBrowserProductionWebpack",
        "validation": "Build completes without errors",
        "failure_action": "AI_PLACEHOLDER: Fix compilation errors: [ERROR_LIST]"
      },
      {
        "check_id": "npm_dependencies_installed",
        "method": "fresh_rebuild",
        "command": "npm install",
        "validation": "No dependency conflicts",
        "failure_action": "Resolve version conflicts or use --force"
      },
      {
        "check_id": "wasm_compilation_success",
        "method": "webassembly",
        "command": "./gradlew wasmBrowserProductionWebpack",
        "validation": "WASM binary generated successfully",
        "failure_action": "Check Kotlin/Native configuration"
      }
    ],
    "runtime_checks": [
      {
        "check_id": "api_compatibility",
        "description": "Test all API endpoints from JavaScript",
        "tests": [
          {
            "test": "fetch_data_from_mock_api",
            "expected": "200 OK response with JSON data",
            "failure_action": "AI_PLACEHOLDER: Check API endpoint configuration"
          },
          {
            "test": "localStorage_read_write",
            "expected": "Data persists across page reloads",
            "failure_action": "Verify BrightSign localStorage support"
          },
          {
            "test": "brightsign_api_available",
            "expected": "require('@brightsign/deviceinfo') succeeds",
            "failure_action": "AI_QUESTION: Are you testing on actual BrightSign hardware?"
          }
        ]
      },
      {
        "check_id": "ui_rendering",
        "description": "Verify all screens render correctly",
        "tests": [
          {
            "test": "all_pages_load_without_404",
            "method": "Check browser console for errors",
            "failure_action": "AI_PLACEHOLDER: Fix missing assets/resources"
          },
          {
            "test": "responsive_layout",
            "method": "Test on target BrightSign resolution",
            "failure_action": "Adjust CSS media queries"
          }
        ]
      },
      {
        "check_id": "performance_benchmarks",
        "description": "Measure performance vs Android app",
        "metrics": [
          {
            "metric": "initial_load_time",
            "target": "< 3 seconds",
            "measurement": "Performance.timing.loadEventEnd - Performance.timing.navigationStart"
          },
          {
            "metric": "api_response_time",
            "target": "< 500ms for typical request",
            "measurement": "Time from fetch() call to response parsing"
          },
          {
            "metric": "memory_usage",
            "target": "< 200MB for typical session",
            "measurement": "performance.memory.usedJSHeapSize",
            "failure_action": "AI_PLACEHOLDER: Optimize memory usage, check for leaks"
          }
        ]
      }
    ],
    "brightsign_specific_checks": [
      {
        "check_id": "autorun_brs_configured",
        "description": "Verify autorun.brs launches app correctly",
        "validation": "File exists and contains roHtmlWidget or roNodeApp",
        "failure_action": "AI_PLACEHOLDER: Create autorun.brs from template"
      },
      {
        "check_id": "remote_debugging_enabled",
        "description": "Verify inspector_server port accessible",
        "test": "Connect to http://[DEVICE_IP]:2999",
        "validation": "Chrome DevTools connects successfully",
        "failure_action": "Check firewall, verify inspector_server config in autorun.brs"
      },
      {
        "check_id": "brightsign_apis_functional",
        "description": "Test BrightSign-specific APIs",
        "tests": [
          {
            "api": "@brightsign/deviceinfo",
            "test": "Dynamic import succeeds and deviceInfo.model returns valid model name",
            "failure_action": "Ensure running on actual BrightSign device, not simulator",
            "note": "Use await import('@brightsign/deviceinfo') pattern"
          },
          {
            "api": "@brightsign/videooutput",
            "test": "Video playback works",
            "failure_action": "Check video codec support, file path"
          },
          {
            "api": "@brightsign/networkconfiguration",
            "test": "Can read network settings asynchronously",
            "failure_action": "Verify network permissions in autorun.brs",
            "note": "Ensure async initialization completed"
          }
        ]
      },
      {
        "check_id": "deployment_package_valid",
        "description": "Verify SD card structure is correct",
        "structure": {
          "/autorun.brs": "required",
          "/index.html": "required (or path specified in autorun.brs)",
          "/node_modules/": "if using Node.js",
          "/assets/": "media files, images"
        },
        "validation": "All files present and accessible",
        "failure_action": "AI_PLACEHOLDER: Regenerate deployment package"
      }
    ],
    "completeness_checks": [
      {
        "check_id": "feature_parity",
        "description": "Verify all Android features migrated or mocked",
        "process": {
          "list_android_features": "Extract from requirements/user stories",
          "check_implementation": "For each feature, verify JS implementation exists",
          "mark_status": {
            "COMPLETE": "Feature fully implemented and tested",
            "MOCKED": "Feature has placeholder/mock implementation",
            "MISSING": "Feature not yet migrated",
            "NOT_APPLICABLE": "Feature not needed on BrightSign"
          }
        },
        "failure_action": "AI_QUESTION: Feature [FEATURE_NAME] is MISSING. Should it be implemented or mocked?"
      },
      {
        "check_id": "code_coverage",
        "description": "Measure test coverage of migrated code",
        "target": "> 70% code coverage",
        "tool": "Jest with coverage reports",
        "command": "npm test -- --coverage",
        "failure_action": "Add tests for uncovered code paths"
      },
      {
        "check_id": "documentation_complete",
        "description": "Verify all AI_PLACEHOLDER markers addressed",
        "pattern": "grep -r 'AI_PLACEHOLDER' .",
        "validation": "No unresolved placeholders in production code",
        "failure_action": "Review and resolve each placeholder"
      }
    ]
  }
}
```

---

## AI Migration Server Integration

### Input Schema

```json
{
  "migration_request": {
    "android_project_path": "/path/to/android/project",
    "target_method": "fresh_rebuild | transpilation | kotlin_multiplatform | webassembly | pwa",
    "target_method_auto_select": true,
    "team_info": {
      "kotlin_expertise": "high | medium | low",
      "javascript_expertise": "high | medium | low",
      "timeline": "1-2 weeks | 2-4 weeks | 4+ weeks"
    },
    "project_constraints": {
      "must_have_offline": false,
      "performance_critical": false,
      "rapid_prototype": false
    }
  }
}
```

### Output Schema

```json
{
  "migration_result": {
    "status": "complete | partial | failed",
    "method_used": "fresh_rebuild",
    "generated_files": [
      {"path": "src/ui/index.html", "status": "complete"},
      {"path": "src/backend/server.js", "status": "contains_placeholders"},
      {"path": "autorun.brs", "status": "complete"}
    ],
    "placeholders": [
      {
        "type": "AI_PLACEHOLDER",
        "location": "src/backend/server.js:42",
        "message": "Add authentication middleware",
        "severity": "medium"
      }
    ],
    "questions": [
      {
        "type": "AI_QUESTION",
        "location": "src/ui/dashboard.js:15",
        "message": "Should real-time updates use WebSocket or polling?",
        "requires_human_input": true
      }
    ],
    "validation_results": {
      "passed": 15,
      "failed": 2,
      "pending": 3,
      "details": "See validation_report.json"
    },
    "next_steps": [
      "Review and resolve 5 AI_PLACEHOLDER markers",
      "Answer 1 AI_QUESTION",
      "Test on BrightSign device",
      "Run validation checks that require hardware"
    ]
  }
}
```

### Workflow Phases

```json
{
  "automated_migration_process": {
    "phase_1_analysis": {
      "duration": "1-2 days",
      "tasks": [
        {
          "task": "scan_kotlin_project",
          "inputs": ["source_code_directory", "build.gradle"],
          "outputs": ["project_structure_report", "dependency_list", "android_api_usage_report"]
        },
        {
          "task": "extract_features",
          "inputs": ["activities", "fragments", "viewmodels"],
          "outputs": ["feature_catalog_json"]
        },
        {
          "task": "recommend_migration_method",
          "inputs": ["project_complexity", "team_skills", "timeline"],
          "outputs": ["recommended_method", "migration_plan"]
        }
      ]
    },
    "phase_2_preparation": {
      "duration": "2-3 days",
      "tasks": [
        {
          "task": "setup_brightsign_environment",
          "steps": [
            "install_nodejs",
            "create_project_structure",
            "configure_build_tools"
          ]
        },
        {
          "task": "map_dependencies",
          "inputs": ["android_dependency_list"],
          "outputs": ["javascript_package_json"],
          "automation": "Use dependency_mappings table for automatic conversion"
        },
        {
          "task": "identify_api_replacements",
          "inputs": ["android_api_usage_report"],
          "outputs": ["api_replacement_plan"],
          "automation": "Use android_api_replacements table"
        }
      ]
    },
    "phase_3_implementation": {
      "duration": "1-4 weeks (varies by method)",
      "tasks": [
        {
          "task": "implement_migration",
          "method_specific": true,
          "automation_level": {
            "code_transformation": "70% automated",
            "api_replacement": "80% automated",
            "ui_migration": "40% automated (requires human review)",
            "testing": "60% automated"
          }
        },
        {
          "task": "handle_placeholders",
          "process": "Review all AI_PLACEHOLDER and AI_QUESTION markers",
          "human_review_required": true
        }
      ]
    },
    "phase_4_validation": {
      "duration": "3-5 days",
      "tasks": [
        {
          "task": "run_validation_checks",
          "inputs": ["validation_framework"],
          "automation": "Execute all checks from validation_framework",
          "outputs": ["validation_report", "issue_list"]
        },
        {
          "task": "test_on_brightsign",
          "device_required": true,
          "tests": ["functional", "performance", "brightsign_api_integration"]
        }
      ]
    }
  }
}
```

---

## Automation Patterns by Method

> **Note**: Focus automation on Methods 1 and 2 (primary methods). Advanced methods (3-5) should only be executed when explicitly requested or when automated analysis identifies specific requirements.

### Method 1: Transpilation Automation (Primary - Prototyping)

```json
{
  "automation_commands": [
    "AI_AUTO: Generate build.gradle.kts configuration",
    "AI_AUTO: Scan and flag Android API usage",
    "AI_AUTO: Create platform abstraction layer",
    "HUMAN: Review expect/actual implementations",
    "AI_AUTO: Generate HTML integration code"
  ],
  "tasks": {
    "extract_business_logic": {
      "scan_for": ["data_classes", "repositories", "use_cases", "view_models"],
      "exclude": ["activities", "fragments", "views", "android_context_usage"]
    },
    "create_shared_module": {
      "name": "shared-business-logic",
      "structure": {
        "data/models": "data classes",
        "data/repositories": "data sources",
        "domain/usecases": "business rules",
        "utils": "helper functions"
      }
    },
    "identify_android_dependencies": {
      "action": "flag_for_replacement",
      "patterns": ["android.*", "androidx.*", "Context", "SharedPreferences", "Bundle"]
    }
  }
}
```

### Method 2: Fresh Rebuild Automation (Primary - Production) ⭐

```json
{
  "automation_commands": [
    "AI_AUTO: Extract feature list from Android code",
    "AI_AUTO: Generate HTML templates from Activities",
    "AI_AUTO: Convert Kotlin repositories to JavaScript",
    "AI_AUTO: Apply API mapping table replacements",
    "HUMAN: Review UI/UX and add styling"
  ],
  "tasks": {
    "analyze_kotlin_app": {
      "scan_project_structure": {
        "identify": ["activities", "fragments", "services", "viewmodels", "repositories"],
        "extract_dependencies": ["gradle_dependencies", "external_libraries"],
        "map_features": ["screens", "background_tasks", "data_flows"]
      },
      "generate_migration_plan": {
        "priority_features": "user_facing_screens",
        "deferred_features": "advanced_android_specific",
        "mock_features": "unsupported_hardware_apis"
      }
    },
    "setup_brightsign_environment": {
      "node_version_requirement": "18.18.2 (BrightSign OS standard, configurable)",
      "verify_nodejs": "node --version >= 18.0.0",
      "create_project_structure": {
        "src/ui/": "HTML/CSS/JS UI components",
        "src/backend/": "Node.js server code (optional)",
        "src/utils/": "Helper functions",
        "src/mocks/": "BrightSign API mocks for local development (CommonJS)",
        "assets/": "Images, videos, fonts"
      },
      "initialize_npm": ["npm init -y", "npm install express"],
      "setup_webpack": {
        "install": "npm install --save-dev webpack webpack-cli webpack-dev-server html-webpack-plugin css-loader style-loader",
        "configure": "Create webpack.config.js with target: 'node18.18', libraryTarget: 'umd', and CommonJS externals for production"
      }
    },
    "create_platform_abstraction": {
      "pattern": "synchronous_initialization",
      "implementation": {
        "constructor": "Initialize with synchronous this.initialize() call",
        "initialize": "Use require() for @brightsign/* modules in try/catch",
        "usage": "Direct method calls, no async/await needed",
        "fallback": "Graceful degradation when APIs unavailable"
      }
    }
  }
}
```

### Methods 3-5: Advanced Method Automation

> **Important**: Only execute these automations when user explicitly requests an advanced method or when automated analysis identifies a specialized requirement.

```json
{
  "method_3_kotlin_multiplatform": {
    "note": "Advanced method - only use for multi-platform code sharing",
    "automation_commands": [
      "AI_AUTO: Generate KMM project structure",
      "AI_AUTO: Identify shared vs platform code",
      "AI_AUTO: Create expect/actual declarations",
      "HUMAN: Implement actual implementations for JS",
      "AI_AUTO: Generate integration layer"
    ]
  },
  "method_4_webassembly": {
    "automation_commands": [
      "AI_AUTO: Analyze code for WASM candidates",
      "HUMAN: Extract pure computation functions",
      "AI_AUTO: Configure WASM build",
      "AI_AUTO: Generate JS integration wrapper",
      "AI_AUTO: Run performance benchmarks"
    ],
    "criteria": {
      "high_cpu_usage": true,
      "frequent_execution": true,
      "no_platform_apis": true,
### Key Technical Patterns

```json
{
  "brightsign_integration_patterns": {
    "node_version_target": "18.18.2 (BrightSign OS standard)",
    "module_system": "CommonJS (require/module.exports)",
    "synchronous_initialization": {
      "description": "BrightSign APIs are initialized synchronously using require() for Node v18.18.2 CommonJS compatibility",
      "pattern": {
        "constructor": "this.initialize(); // Synchronous initialization",
        "initialize": "initialize() { try { const API = require('@brightsign/...'); this.api = new API(); } catch(e) { /* fallback */ } }",
        "usage": "this.api.method(); // Direct usage, no await needed"
      },
      "reason": "Node v18.18.2 on BrightSign uses CommonJS - require() is synchronous and standard"
    },
    "webpack_configuration": {
      "target": "node18.18 (configurable for specific Node version)",
      "development": {
        "externals": "Empty object {}",
        "resolve.alias": "Map @brightsign/* to local mock files",
        "libraryTarget": "umd"
      },
      "production": {
        "externals": "Use 'commonjs @brightsign/*' format for all BrightSign APIs",
        "resolve.alias": "Empty object {}",
        "libraryTarget": "umd"
      },
      "reason": "UMD library target with CommonJS externals required for Node v18.18.2 compatibility"
    },
    "mock_structure": {
      "export_pattern": "class MockAPI { ... }; module.exports = MockAPI;",
      "match_real_api": "Mock methods and properties must match actual BrightSign API structure",
      "sync_methods": "Use synchronous methods for consistency with CommonJS pattern"
    },
    "error_handling": {
      "graceful_degradation": "try/catch around require() calls with fallback implementations",
      "initialization_check": "Check this.initialized flag before API access",
      "console_warnings": "Log when APIs unavailable for debugging"
    }
  }
}
```

---

## Important Notes for AI Automation

```json
{
  "critical_patterns": {
    "use_require_not_import": {
      "correct": "const DeviceInfo = require('@brightsign/deviceinfo');",
      "wrong": "const { default: DeviceInfo } = await import('@brightsign/deviceinfo');",
      "reason": "BrightSign Node v18.18.2 uses CommonJS - require() is the standard approach"
    },
    "synchronous_init": {
      "pattern": "Initialize BrightSign APIs synchronously in constructor with try/catch",
      "example": "constructor() { this.initialize(); } initialize() { try { this.api = require('@brightsign/api'); } catch(e) { /* fallback */ } }"
    },
    "mock_as_commonjs": {
      "correct": "class API { method() {} }; module.exports = API;",
      "wrong": "export class API { method() {} }; export default API;",
      "reason": "Must use CommonJS exports to match Node v18.18.2 module system"
    },
    "umd_library_target": {
      "required_for": "Universal module definition for broad compatibility",
      "webpack_config": "output: { libraryTarget: 'umd' }",
      "reason": "UMD works in both browser and Node.js environments"
    },
    "commonjs_externals": {
      "correct": "externals: { '@brightsign/deviceinfo': 'commonjs @brightsign/deviceinfo' }",
      "wrong": "externals: { '@brightsign/deviceinfo': '@brightsign/deviceinfo' }",
      "reason": "Must specify 'commonjs' prefix for proper require() handling in webpack externals"
    }
  }
}
```ormance gain < 20%, use Method 2 instead"
  },
  "method_5_pwa": {
    "automation_commands": [
      "AI_AUTO: Follow Method 2 automation",
      "AI_AUTO: Generate PWA manifest",
      "AI_AUTO: Create service worker with caching strategy",
      "AI_AUTO: Implement IndexedDB wrapper",
      "HUMAN: Test offline scenarios"
    ]
  }
}
```

---

## AI Placeholder System

### Marker Types

```json
{
  "placeholder_types": {
    "AI_PLACEHOLDER": {
      "purpose": "Marks code requiring human review or completion",
      "examples": [
        "AI_PLACEHOLDER: Add error handling for network failures",
        "AI_PLACEHOLDER: Test on actual BrightSign device",
        "AI_PLACEHOLDER: Optimize memory usage"
      ],
      "action": "Review and implement or resolve"
    },
    "AI_QUESTION": {
      "purpose": "Requests human input when AI is uncertain",
      "examples": [
        "AI_QUESTION: Should this feature be implemented or mocked?",
        "AI_QUESTION: What is the purpose of this dependency?",
        "AI_QUESTION: Do you have a BrightSign device for testing?"
      ],
      "action": "Answer to guide AI's next steps"
    },
    "AI_GENERATED": {
      "purpose": "Indicates AI-created code",
      "examples": [
        "AI_GENERATED: Dashboard logic migrated from Kotlin",
        "AI_GENERATED: Platform abstraction layer"
      ],
      "action": "Review for correctness"
    },
    "AI_AUTO": {
      "purpose": "Marks automated processing steps",
      "examples": [
        "AI_AUTO: Generate build.gradle.kts configuration",
        "AI_AUTO: Apply API mapping replacements"
      ],
      "action": "Informational only"
    }
  }
}
```

---

## Validation Checklist Template

```json
{
  "kotlin_js_compilation": {
    "file": "build.gradle.kts",
    "must_contain": ["kotlin(\"multiplatform\")", "js(IR)", "nodejs()"],
    "error_message": "Kotlin/JS plugin not configured"
  },
  "npm_dependencies": {
    "dependencies": ["kotlinx-serialization-json", "kotlinx-coroutines-core"],
    "error_message": "Missing required Kotlin/JS dependencies"
  },
  "brightsign_apis": {
    "check_available": ["@brightsign/deviceinfo", "@brightsign/videooutput", "@brightsign/audio"],
    "failure_action": "Ensure running on BrightSign device or install packages"
  }
}
```
