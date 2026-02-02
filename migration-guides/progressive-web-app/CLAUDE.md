# AI Agent Instructions for PWA to BrightSign Migration

> **Purpose**: Machine-readable instructions for AI agents (Claude, GPT, etc.) to automate Progressive Web App to BrightSign migration tasks via the BrightDeveloper MCP server.

---

## Context and Capabilities

### Target Platform
- **BrightSign**: HTML/CSS/JavaScript digital signage platform
- **Node.js**: v18.18.2
- **Chromium**: Version 120
- **Environment**: Embedded Linux, SD card deployment
- **Display**: Typically 1920x1080 or 4K, landscape orientation

### Source Application
- **Progressive Web App**: Modern web application with PWA features
- **Already web-based**: HTML/CSS/JavaScript with modern web APIs
- **PWA Features**: Service workers, web manifest, offline support, installability
- **Frameworks**: May use React, Vue, Angular, or vanilla JavaScript

### Key Advantage
PWAs are **already web applications**, so migration is **adaptation**:
1. Build production version of PWA
2. Remove PWA-specific features (service worker, manifest, etc.)
3. Optimize for signage displays
4. Set up BrightSign deployment (with Node.js if SPA)

**No transpilation needed** - adaptation and optimization only.

---

## Migration Strategy

### Single Primary Path
```
Progressive Web App
    ↓
Build production version
    ↓
Remove PWA features (SW, manifest, notifications)
    ↓
Optimize for signage displays
    ↓
Set up Node.js server (if SPA)
    ↓
Deploy to BrightSign
    
Timeline: 1-2 weeks
Complexity: LOW
```

---

## Automated Analysis Tasks

### Task 1: PWA Structure Analysis

**Agent Goal**: Identify complete PWA structure, dependencies, and features

**BrightDeveloper MCP Tools**:
```javascript
// Search for PWA configuration files
search_docs("PWA manifest service worker configuration")

// Analyze package.json
read_file("package.json")

// Find service worker
find_files("service-worker.js", "sw.js", "*worker*.js")

// Find web app manifest
find_files("manifest.json", "manifest.webmanifest")

// Identify framework
search_code("react", "vue", "angular", "@angular/core")
```

**Output Structure**:
```json
{
  "pwa_analysis": {
    "framework": {
      "name": "react|vue|angular|vanilla",
      "version": "18.2.0",
      "build_tool": "vite|webpack|create-react-app"
    },
    "pwa_features": {
      "service_worker": {
        "present": true,
        "file": "service-worker.js",
        "strategies": ["cache-first", "network-first"],
        "workbox": true
      },
      "manifest": {
        "present": true,
        "file": "manifest.json",
        "config": {...}
      },
      "notifications": {
        "push": false,
        "local": true
      },
      "background_sync": false,
      "install_prompt": true
    },
    "dependencies": {
      "runtime": ["react", "react-dom", "react-router-dom"],
      "build": ["vite", "@vitejs/plugin-react"],
      "pwa": ["workbox-webpack-plugin"]
    },
    "entry_points": ["index.html"],
    "routing": {
      "type": "client-side",
      "library": "react-router-dom"
    }
  }
}
```

**Automation Code**:
```javascript
async function analyzePWA(projectPath) {
    const analysis = {
        pwa_features: {},
        framework: {},
        dependencies: {}
    };
    
    // Check for package.json
    const packageJson = await readJSON(`${projectPath}/package.json`);
    analysis.dependencies = packageJson.dependencies;
    
    // Detect framework
    if (packageJson.dependencies.react) {
        analysis.framework.name = 'react';
    } else if (packageJson.dependencies.vue) {
        analysis.framework.name = 'vue';
    } else if (packageJson.dependencies['@angular/core']) {
        analysis.framework.name = 'angular';
    } else {
        analysis.framework.name = 'vanilla';
    }
    
    // Find service worker
    const swFiles = await findFiles(projectPath, '**/*worker*.js');
    analysis.pwa_features.service_worker = {
        present: swFiles.length > 0,
        files: swFiles
    };
    
    // Find manifest
    const manifestFiles = await findFiles(projectPath, '**/manifest.json');
    analysis.pwa_features.manifest = {
        present: manifestFiles.length > 0,
        files: manifestFiles
    };
    
    // Check for PWA registration in HTML/JS
    const registrationCode = await searchCode(
        projectPath,
        "navigator.serviceWorker.register"
    );
    analysis.pwa_features.sw_registration = registrationCode.length > 0;
    
    return analysis;
}
```

---

### Task 2: Remove PWA Features

**Agent Goal**: Remove all PWA-specific code and configurations

**BrightDeveloper MCP Tools**:
```javascript
// Find and remove service worker registration
search_code("serviceWorker.register")
replace_in_file("index.html", removeServiceWorkerRegistration)

// Remove manifest reference
search_code("<link rel=\"manifest\"")
replace_in_file("index.html", removeManifestLink)

// Remove PWA packages
update_file("package.json", removePWADependencies)

// Remove notification code
search_code("Notification.requestPermission", "new Notification")
replace_in_file("*.js", removeNotificationCode)
```

**Removal Patterns**:
```javascript
const PWA_REMOVAL_PATTERNS = {
    html: {
        manifest: /<link\s+rel="manifest"\s+href="[^"]+"\s*\/?>/g,
        apple_touch_icon: /<link\s+rel="apple-touch-icon"[^>]+>/g,
        theme_color: /<meta\s+name="theme-color"[^>]+>/g
    },
    javascript: {
        sw_registration: /if\s*\(\s*['"]serviceWorker['"]\s+in\s+navigator\s*\)\s*{[\s\S]*?}/g,
        sw_register: /navigator\.serviceWorker\.register\([^)]+\)[\s\S]*?;/g,
        notifications: /Notification\.requestPermission\([^)]*\)[\s\S]*?;/g,
        push_subscribe: /pushManager\.subscribe\([^)]*\)[\s\S]*?;/g,
        background_sync: /sync\.register\([^)]*\)[\s\S]*?;/g
    },
    dependencies: [
        'workbox-webpack-plugin',
        'workbox-precaching',
        'workbox-routing',
        'workbox-strategies',
        '@angular/service-worker',
        'register-service-worker',
        'vite-plugin-pwa',
        'webpack-pwa-manifest'
    ],
    webpack_config: {
        workbox_plugin: /new\s+WorkboxWebpackPlugin\.\w+\([^)]*\{[\s\S]*?\}\s*\)/g,
        pwa_manifest_plugin: /new\s+WebpackPwaManifest\([^)]*\{[\s\S]*?\}\s*\)/g,
        workbox_import: /const\s+WorkboxWebpackPlugin\s*=\s*require\(['"]workbox-webpack-plugin['"]\);?/g,
        manifest_import: /const\s+WebpackPwaManifest\s*=\s*require\(['"]webpack-pwa-manifest['"]\);?/g
    },
    vite_config: {
        vite_pwa_plugin: /VitePWA\([^)]*\{[\s\S]*?\}\s*\)/g,
        vite_pwa_import: /import\s+\{\s*VitePWA\s*\}\s+from\s+['"]vite-plugin-pwa['"];?/g
    }
};

async function removePWAFeatures(projectPath) {
    // Remove from HTML
    const htmlFiles = await findFiles(projectPath, '**/*.html');
    for (const file of htmlFiles) {
        await removePatterns(file, PWA_REMOVAL_PATTERNS.html);
    }
    
    // Remove from JavaScript
    const jsFiles = await findFiles(projectPath, '**/*.{js,jsx,ts,tsx}');
    for (const file of jsFiles) {
        await removePatterns(file, PWA_REMOVAL_PATTERNS.javascript);
    }
    
    // Remove PWA dependencies
    await removeDependencies(
        `${projectPath}/package.json`,
        PWA_REMOVAL_PATTERNS.dependencies
    );
    
    // Delete service worker files
    const swFiles = await findFiles(projectPath, '**/*worker*.js');
    for (const file of swFiles) {
        await deleteFile(file);
    }
    
    // Delete manifest files
    const manifestFiles = await findFiles(projectPath, '**/manifest.json');
    for (const file of manifestFiles) {
        await deleteFile(file);
    }
    
    // Update webpack configuration
    const webpackConfig = `${projectPath}/webpack.config.js`;
    if (await fileExists(webpackConfig)) {
        await removePatterns(webpackConfig, PWA_REMOVAL_PATTERNS.webpack_config);
        await addBrightSignExternals(webpackConfig, 'webpack');
    }
    
    // Update vite configuration
    const viteConfig = `${projectPath}/vite.config.js`;
    if (await fileExists(viteConfig)) {
        await removePatterns(viteConfig, PWA_REMOVAL_PATTERNS.vite_config);
        await addBrightSignExternals(viteConfig, 'vite');
    }
}
```

### Task 3: Optimize for Signage Displays

**Agent Goal**: Adapt PWA for large signage displays

**Display Optimization Patterns**:
```javascript
const SIGNAGE_OPTIMIZATIONS = {
    viewport: {
        before: '<meta name="viewport" content="width=device-width, initial-scale=1">',
        after: '<meta name="viewport" content="width=1920, height=1080, initial-scale=1">'
    },
    css: {
        root_font_size: {
            before: '--font-size: 16px',
            after: '--font-size: 24px /* Larger for viewing distance */'
        },
        body_size: {
            before: 'body { font-size: 16px; }',
            after: 'body { font-size: 24px; width: 1920px; height: 1080px; overflow: hidden; }'
        },
        remove_mobile_queries: /@media\s*\([^)]*max-width[^)]*\)\s*{[\s\S]*?}/g,
        container_width: {
            before: 'max-width: 1200px',
            after: 'width: 100%'
        }
    },
    javascript: {
        remove_touch_events: /element\.addEventListener\(['"]touch(start|move|end)['"]/g,
        remove_gestures: /new\s+Hammer\(/g,
        remove_mobile_detection: /\/Android|webOS|iPhone|iPad|iPod/i.test\(navigator.userAgent\)/g
    }
};

async function optimizeForSignage(projectPath, displayConfig = {
    width: 1920,
    height: 1080,
    fontSize: 24
}) {
    // Update viewport
    const htmlFiles = await findFiles(projectPath, '**/*.html');
    for (const file of htmlFiles) {
        await replaceViewport(file, displayConfig);
    }
    
    // Update CSS
    const cssFiles = await findFiles(projectPath, '**/*.css');
    for (const file of cssFiles) {
        await optimizeCSS(file, displayConfig);
    }
    
    // Remove mobile JavaScript
    const jsFiles = await findFiles(projectPath, '**/*.{js,jsx}');
    for (const file of jsFiles) {
        await removeMobileCode(file);
    }
}

async function optimizeCSS(file, displayConfig) {
    let content = await readFile(file);
    
    // Update root font size
    content = content.replace(
        /--font-size:\s*\d+px/g,
        `--font-size: ${displayConfig.fontSize}px`
    );
    
    // Remove mobile media queries
    content = content.replace(
        /@media\s*\([^)]*max-width:\s*768px[^)]*\)\s*{[\s\S]*?}/g,
        ''
    );
    
    // Update body dimensions
    content = content.replace(
        /body\s*{([^}]*)}/,
        `body { width: ${displayConfig.width}px; height: ${displayConfig.height}px; overflow: hidden; $1 }`
    );
    
    await writeFile(file, content);
}
```

---

### Task 4: Set Up Node.js Server for SPAs

**Agent Goal**: Create Node.js server for client-side routing

**Server Template**:
```javascript
const SERVER_TEMPLATES = {
    express_spa: `
const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle all routes - send to index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});
`,
    
    package_json: {
        dependencies: {
            express: "^4.18.2"
        },
        scripts: {
            start: "node server.js"
        }
    }
};

async function setupNodeServer(projectPath, buildDir = 'build') {
    // Create server.js
    const serverCode = SERVER_TEMPLATES.express_spa.replace(
        /build/g,
        buildDir
    );
    await writeFile(`${projectPath}/server.js`, serverCode);
    
    // Update package.json
    const packageJson = await readJSON(`${projectPath}/package.json`);
    packageJson.dependencies = {
        ...packageJson.dependencies,
        ...SERVER_TEMPLATES.package_json.dependencies
    };
    packageJson.scripts = {
        ...packageJson.scripts,
        ...SERVER_TEMPLATES.package_json.scripts
    };
    await writeJSON(`${projectPath}/package.json`, packageJson);
    
    // Create .npmrc to use correct registry
    await writeFile(`${projectPath}/.npmrc`, 'registry=https://registry.npmjs.org/\n');
}
```

---

### Task 5: Create BrightSign Deployment

**Agent Goal**: Generate autorun.brs and deployment structure

**BrightScript Template**:
```brightscript
' autorun.brs template for PWA/SPA
Sub Main()
    msgPort = CreateObject("roMessagePort")
    
    ' Configuration
    useNodeServer = {{USE_NODE_SERVER}} ' true for SPAs, false for static
    nodeScript = "{{NODE_SCRIPT}}" ' server.js for SPAs
    displayWidth = {{DISPLAY_WIDTH}} ' 1920
    displayHeight = {{DISPLAY_HEIGHT}} ' 1080
    
    if useNodeServer then
        ' Start Node.js server for SPA routing
        nodeConfig = {
            nodejs_enabled: true,
            port: 8080,
            inspector_server: { port: 2999 },
            message_port: msgPort
        }
        
        node = CreateObject("roNodeJs", nodeConfig)
        node.RunProgram(nodeScript)
        
        ' Wait for server to start
        sleep(2000)
        
        url = "http://localhost:8080"
    else
        ' Serve static files directly
        url = "file:///sd:/index.html"
    end if
    
    ' Launch Chromium
    htmlRect = CreateObject("roRectangle", 0, 0, displayWidth, displayHeight)
    htmlConfig = {
        nodejs_enabled: useNodeServer,
        url: url,
        port: msgPort,
        security_params: {
            websecurity: false
        }
    }
    
    html = CreateObject("roHtmlWidget", htmlRect, htmlConfig)
    html.Show()
    
    ' Event loop with error handling
    while true
        msg = wait(0, msgPort)
        msgType = type(msg)
        
        if msgType = "roHtmlWidgetEvent" then
            reason = msg.GetReason()
            print "HTML Widget Event: "; reason
            
            if reason = "load-error" or reason = "load-aborted" then
                print "Error loading content, reloading..."
                html.Reload()
            end if
        else if msgType = "roNodeJsEvent" then
            print "Node.js Event: "; msg.GetString()
        end if
    end while
End Sub
```

**Automation Code**:
```javascript
async function createBrightSignDeployment(projectPath, config = {}) {
    const {
        useSPA = false,
        displayWidth = 1920,
        displayHeight = 1080,
        buildDir = 'build'
    } = config;
    
    // Create autorun.brs
    let autorunContent = AUTORUN_TEMPLATE
        .replace('{{USE_NODE_SERVER}}', useSPA ? 'true' : 'false')
        .replace('{{NODE_SCRIPT}}', 'server.js')
        .replace('{{DISPLAY_WIDTH}}', displayWidth)
        .replace('{{DISPLAY_HEIGHT}}', displayHeight);
    
    await writeFile(`${projectPath}/autorun.brs`, autorunContent);
    
    // Create deployment instructions
    const deploymentGuide = generateDeploymentGuide(config);
    await writeFile(`${projectPath}/DEPLOYMENT.md`, deploymentGuide);
    
    // Create SD card structure document
    const sdStructure = generateSDStructure(useSPA, buildDir);
    await writeFile(`${projectPath}/SD_CARD_STRUCTURE.md`, sdStructure);
}

function generateSDStructure(useSPA, buildDir) {
    if (useSPA) {
        return `
# SD Card Structure (SPA with Node.js Server)

\`\`\`
SD_CARD/
├── autorun.brs           # BrightSign launcher
├── server.js             # Node.js Express server
├── package.json          # Dependencies
├── node_modules/         # Installed packages (run npm install)
└── ${buildDir}/          # Production build
    ├── index.html
    ├── static/
    │   ├── css/
    │   └── js/
    └── assets/
\`\`\`

## Setup Instructions:
1. Build production version: \`npm run build\`
2. Copy all files to SD card root
3. Run \`npm install --production\` in SD card root
4. Insert SD card into BrightSign player
`;
    } else {
        return `
# SD Card Structure (Static PWA)

\`\`\`
SD_CARD/
├── autorun.brs           # BrightSign launcher
├── index.html            # Main HTML
├── css/
├── js/
└── assets/
\`\`\`

## Setup Instructions:
1. Build production version: \`npm run build\`
2. Copy contents of ${buildDir}/ to SD card root
3. Copy autorun.brs to SD card root
4. Insert SD card into BrightSign player
`;
    }
}
```

---

## Complete Migration Workflow

### Automated Migration Function

```javascript
async function migratePWAToBrightSign(sourcePath, options = {}) {
    const {
        displayWidth = 1920,
        displayHeight = 1080,
        fontSize = 24,
        outputPath = `${sourcePath}/brightsign-output`
    } = options;
    
    console.log("Step 1: Analyzing PWA structure...");
    const analysis = await analyzePWA(sourcePath);
    
    console.log("Step 2: Building production version...");
    await buildProduction(sourcePath, analysis.framework);
    
    console.log("Step 3: Creating output directory...");
    await createDirectory(outputPath);
    
    console.log("Step 4: Copying production build...");
    const buildDir = getBuildDirectory(analysis.framework);
    await copyDirectory(`${sourcePath}/${buildDir}`, `${outputPath}/build`);
    
    console.log("Step 5: Removing PWA features...");
    await removePWAFeatures(outputPath);
    
    console.log("Step 6: Optimizing for signage displays...");
    await optimizeForSignage(outputPath, { displayWidth, displayHeight, fontSize });
    
    const useSPA = analysis.routing.type === 'client-side';
    
    if (useSPA) {
        console.log("Step 7: Setting up Node.js server for SPA...");
        await setupNodeServer(outputPath, 'build');
    }
    
    console.log("Step 8: Creating BrightSign deployment files...");
    await createBrightSignDeployment(outputPath, {
        useSPA,
        displayWidth,
        displayHeight,
        buildDir: 'build'
    });
    
    console.log("Step 9: Generating documentation...");
    await generateMigrationReport(outputPath, analysis);
    
    console.log("Migration complete!");
    console.log(`Output directory: ${outputPath}`);
    
    return {
        success: true,
        outputPath,
        analysis,
        useSPA
    };
}

function getBuildDirectory(framework) {
    const buildDirs = {
        'react': 'build',
        'vue': 'dist',
        'angular': 'dist',
        'vanilla': 'dist'
    };
    return buildDirs[framework.name] || 'build';
}

async function buildProduction(sourcePath, framework) {
    const buildCommands = {
        'react': 'npm run build',
        'vue': 'npm run build',
        'angular': 'npm run build -- --configuration production',
        'vanilla': 'npm run build'
    };
    
    const command = buildCommands[framework.name] || 'npm run build';
    await executeCommand(sourcePath, command);
}
```

---

## AI Prompt Templates for Agents

### Complete Migration Prompt

```
Migrate my Progressive Web App to BrightSign:

Source: {{PROJECT_PATH}}
Framework: {{FRAMEWORK}} (React/Vue/Angular/Vanilla)
Display: {{WIDTH}}x{{HEIGHT}}

Tasks:
1. Analyze PWA structure and dependencies
2. Build production version
3. Remove all PWA features:
   - Service worker registration
   - Web app manifest references
   - Push notifications
   - Background sync
   - Install prompts
4. Optimize for signage display:
   - Update viewport to {{WIDTH}}x{{HEIGHT}}
   - Increase font size to {{FONT_SIZE}}px
   - Remove mobile CSS media queries
   - Remove touch event handlers
5. Set up Node.js server (if SPA with routing)
6. Create autorun.brs
7. Generate SD card deployment structure
8. Provide complete migration report

Use BrightDeveloper MCP tools for all operations.
Output complete BrightSign-ready application.
```

### Verification Prompt

```
Verify my PWA migration to BrightSign:

Check:
1. All PWA features removed (service worker, manifest, notifications)
2. Display optimizations applied (viewport, fonts, layout)
3. Node.js server setup correctly (if SPA)
4. autorun.brs configured properly
5. SD card structure is correct
6. All dependencies listed in package.json
7. No mobile-specific code remaining
8. All routes work (if SPA)

Report any issues and provide fixes.
```

---

## Error Handling Patterns

```javascript
const ERROR_PATTERNS = {
    build_failures: {
        check: 'Build process failed',
        solutions: [
            'Check Node.js version (need 18+)',
            'Run npm install',
            'Check for TypeScript errors',
            'Verify build script in package.json'
        ]
    },
    routing_errors: {
        check: 'Routes not working on BrightSign',
        solutions: [
            'Verify Node.js server is running',
            'Check server.js handles all routes',
            'Verify autorun.brs launches Node.js',
            'Test with http://localhost:8080 in autorun.brs'
        ]
    },
    display_issues: {
        check: 'Content not displaying correctly',
        solutions: [
            'Check viewport settings in HTML',
            'Verify CSS for fixed display size',
            'Remove responsive breakpoints',
            'Test at target resolution'
        ]
    }
};
```

---

## Success Criteria

Migration is complete when:

1. ✅ Production build created successfully
2. ✅ All PWA features removed
3. ✅ Service worker and manifest deleted
4. ✅ Viewport optimized for signage display
5. ✅ Font sizes adjusted for viewing distance
6. ✅ Mobile CSS/JS removed
7. ✅ Node.js server configured (if SPA)
8. ✅ autorun.brs created and configured
9. ✅ SD card structure documented
10. ✅ Deployment tested on BrightSign device

Timeline: 1-2 weeks (1 week for static, 2 weeks for complex SPAs)
