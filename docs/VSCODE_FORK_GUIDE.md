# VS Code Fork Guide: Adding 3D Repository Visualization

## Overview

This guide will help you:
1. Fork and set up VS Code for development
2. Add a custom 3D visualization view to the Activity Bar (left sidebar)
3. Integrate with BonFire's 3D repository visualization
4. Build and run your custom VS Code

---

## Part 1: Fork and Setup VS Code

### Step 1: Fork VS Code Repository

```bash
# 1. Go to GitHub and fork: https://github.com/microsoft/vscode
# 2. Clone your fork
cd ..
git clone https://github.com/YOUR_USERNAME/vscode.git vscode-bonfire
cd vscode-bonfire

# 3. Add upstream remote
git remote add upstream https://github.com/microsoft/vscode.git

# 4. Checkout stable version
git checkout release/1.85
```

### Step 2: Install Dependencies

```bash
# Install Yarn if not installed
npm install -g yarn

# Install VS Code dependencies (takes ~10-15 minutes)
yarn install
```

### Step 3: Build VS Code

```bash
# Build VS Code
yarn watch

# This will watch for changes and rebuild automatically
# Keep this terminal running
```

### Step 4: Run Your Custom VS Code

```bash
# In a new terminal
./scripts/code.sh

# On Windows:
.\scripts\code.bat

# On macOS:
./scripts/code.sh
```

---

## Part 2: Add BonFire 3D View Extension

### Architecture

We'll create a built-in extension that adds:
- **Activity Bar Icon**: New icon below Extensions
- **3D View Panel**: Webview showing repository in 3D
- **GitHub Integration**: Fetch any GitHub repo
- **Three.js Visualization**: Interactive 3D scene

### File Structure

```
vscode-bonfire/
└── extensions/
    └── bonfire-3d/               # New built-in extension
        ├── package.json
        ├── src/
        │   ├── extension.ts      # Extension entry point
        │   ├── repoFetcher.ts    # GitHub API integration
        │   ├── visualization3D.ts # 3D view provider
        │   └── webview/
        │       └── index.html    # 3D visualization UI
        ├── resources/
        │   └── icon.svg          # Activity bar icon
        └── tsconfig.json
```

---

## Part 3: Implementation

### Step 1: Create Extension Directory

```bash
cd extensions
mkdir bonfire-3d
cd bonfire-3d
```

### Step 2: Create package.json

Create `extensions/bonfire-3d/package.json`:

```json
{
  "name": "bonfire-3d",
  "displayName": "BonFire 3D Visualizer",
  "description": "Visualize GitHub repositories in 3D",
  "version": "1.0.0",
  "publisher": "bonfire",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": ["Visualization"],
  "activationEvents": [
    "onStartupFinished"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "viewsContainers": {
      "activitybar": [
        {
          "id": "bonfire-3d-view",
          "title": "BonFire 3D",
          "icon": "resources/icon.svg"
        }
      ]
    },
    "views": {
      "bonfire-3d-view": [
        {
          "type": "webview",
          "id": "bonfire.3dView",
          "name": "Repository Visualizer",
          "contextualTitle": "3D Repository View"
        }
      ]
    },
    "commands": [
      {
        "command": "bonfire.visualizeRepo",
        "title": "BonFire: Visualize GitHub Repository",
        "icon": "$(graph-scatter)"
      },
      {
        "command": "bonfire.openRepoInput",
        "title": "BonFire: Open Repository",
        "icon": "$(github)"
      }
    ]
  },
  "scripts": {
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "@types/vscode": "^1.85.0",
    "typescript": "^5.3.0"
  },
  "dependencies": {
    "@octokit/rest": "^20.0.2"
  }
}
```

### Step 3: Create TypeScript Config

Create `extensions/bonfire-3d/tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "./out",
    "lib": ["ES2020"],
    "sourceMap": true,
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  },
  "exclude": ["node_modules"]
}
```

### Step 4: Create Extension Entry Point

Create `extensions/bonfire-3d/src/extension.ts`:

```typescript
import * as vscode from 'vscode';
import { Visualization3DProvider } from './visualization3D';
import { RepoFetcher } from './repoFetcher';

export function activate(context: vscode.ExtensionContext) {
    console.log('🔥 BonFire 3D Visualizer is now active!');

    const repoFetcher = new RepoFetcher();
    const visualizationProvider = new Visualization3DProvider(
        context.extensionUri,
        repoFetcher
    );

    // Register webview provider
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'bonfire.3dView',
            visualizationProvider
        )
    );

    // Register command to visualize repository
    context.subscriptions.push(
        vscode.commands.registerCommand('bonfire.visualizeRepo', async () => {
            await visualizationProvider.visualizeCurrentWorkspace();
        })
    );

    // Register command to open GitHub repo
    context.subscriptions.push(
        vscode.commands.registerCommand('bonfire.openRepoInput', async () => {
            const input = await vscode.window.showInputBox({
                prompt: 'Enter GitHub repository (owner/repo)',
                placeHolder: 'facebook/react',
                validateInput: (value) => {
                    const parts = value.split('/');
                    if (parts.length !== 2) {
                        return 'Format: owner/repo (e.g., facebook/react)';
                    }
                    return null;
                }
            });

            if (input) {
                const [owner, repo] = input.split('/');
                await visualizationProvider.visualizeGitHubRepo(owner, repo);
            }
        })
    );

    vscode.window.showInformationMessage('🔥 BonFire 3D ready! Check the Activity Bar.');
}

export function deactivate() {
    console.log('🔥 BonFire 3D deactivated');
}
```

### Step 5: Create Repository Fetcher

Create `extensions/bonfire-3d/src/repoFetcher.ts`:

```typescript
import { Octokit } from '@octokit/rest';
import * as vscode from 'vscode';

export interface RepoNode {
    name: string;
    path: string;
    type: 'file' | 'dir';
    size?: number;
    children?: RepoNode[];
}

export class RepoFetcher {
    private octokit: Octokit;

    constructor() {
        this.octokit = new Octokit();
    }

    async fetchRepository(owner: string, repo: string, branch: string = 'main'): Promise<RepoNode> {
        try {
            const { data: tree } = await this.octokit.git.getTree({
                owner,
                repo,
                tree_sha: branch,
                recursive: '1'
            });

            return this.buildTree(tree.tree, repo);
        } catch (error: any) {
            throw new Error(`Failed to fetch repository: ${error.message}`);
        }
    }

    private buildTree(items: any[], repoName: string): RepoNode {
        const root: RepoNode = {
            name: repoName,
            path: '',
            type: 'dir',
            children: []
        };

        const pathMap: Map<string, RepoNode> = new Map();
        pathMap.set('', root);

        // Sort by path depth
        items.sort((a, b) => a.path.split('/').length - b.path.split('/').length);

        for (const item of items) {
            const node: RepoNode = {
                name: item.path.split('/').pop() || '',
                path: item.path,
                type: item.type === 'tree' ? 'dir' : 'file',
                size: item.size
            };

            if (node.type === 'dir') {
                node.children = [];
            }

            const parentPath = item.path.substring(0, item.path.lastIndexOf('/'));
            const parent = pathMap.get(parentPath) || root;

            if (parent.children) {
                parent.children.push(node);
            }

            pathMap.set(item.path, node);
        }

        return root;
    }

    async fetchWorkspaceStructure(): Promise<RepoNode | null> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return null;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const rootName = workspaceFolders[0].name;

        // Simple file system scan (you can enhance this)
        return {
            name: rootName,
            path: rootPath,
            type: 'dir',
            children: []
        };
    }
}
```

### Step 6: Create 3D Visualization Provider

Create `extensions/bonfire-3d/src/visualization3D.ts`:

```typescript
import * as vscode from 'vscode';
import { RepoFetcher, RepoNode } from './repoFetcher';

export class Visualization3DProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly repoFetcher: RepoFetcher
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'fetchRepo':
                    this.visualizeGitHubRepo(data.owner, data.repo);
                    break;
            }
        });
    }

    public async visualizeCurrentWorkspace() {
        const structure = await this.repoFetcher.fetchWorkspaceStructure();
        if (structure) {
            this.sendDataToWebview(structure);
        } else {
            vscode.window.showErrorMessage('No workspace folder open');
        }
    }

    public async visualizeGitHubRepo(owner: string, repo: string) {
        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Loading ${owner}/${repo}...`,
                cancellable: false
            }, async () => {
                const structure = await this.repoFetcher.fetchRepository(owner, repo);
                this.sendDataToWebview(structure);
            });
        } catch (error: any) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
        }
    }

    private sendDataToWebview(data: RepoNode) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'renderRepo',
                data: data
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>BonFire 3D</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    background: #1e1e1e;
                    color: #d4d4d4;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }
                #controls {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    z-index: 100;
                    background: rgba(30, 30, 30, 0.9);
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                }
                #controls h3 {
                    margin: 0 0 10px 0;
                    font-size: 14px;
                }
                #controls input {
                    width: 200px;
                    padding: 6px 10px;
                    background: #3c3c3c;
                    border: 1px solid #555;
                    border-radius: 4px;
                    color: #d4d4d4;
                    margin-right: 5px;
                }
                #controls button {
                    padding: 6px 12px;
                    background: #0e639c;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                #controls button:hover {
                    background: #1177bb;
                }
                #canvas-container {
                    width: 100vw;
                    height: 100vh;
                }
                #info {
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    background: rgba(30, 30, 30, 0.9);
                    padding: 10px;
                    border-radius: 4px;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div id="controls">
                <h3>🔥 BonFire 3D Visualizer</h3>
                <input type="text" id="repoInput" placeholder="owner/repo (e.g., facebook/react)" />
                <button onclick="loadRepo()">Load</button>
            </div>
            <div id="canvas-container"></div>
            <div id="info">
                <div>🖱️ Left click + drag: Rotate</div>
                <div>🖱️ Right click + drag: Pan</div>
                <div>🖱️ Scroll: Zoom</div>
            </div>

            <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
            <script>
                const vscode = acquireVsCodeApi();
                let scene, camera, renderer, controls;
                let repoData = null;

                function init() {
                    // Create scene
                    scene = new THREE.Scene();
                    scene.background = new THREE.Color(0x1e1e1e);

                    // Create camera
                    camera = new THREE.PerspectiveCamera(
                        75,
                        window.innerWidth / window.innerHeight,
                        0.1,
                        1000
                    );
                    camera.position.set(50, 50, 50);
                    camera.lookAt(0, 0, 0);

                    // Create renderer
                    renderer = new THREE.WebGLRenderer({ antialias: true });
                    renderer.setSize(window.innerWidth, window.innerHeight);
                    document.getElementById('canvas-container').appendChild(renderer.domElement);

                    // Add lights
                    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
                    scene.add(ambientLight);

                    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
                    directionalLight.position.set(50, 50, 50);
                    scene.add(directionalLight);

                    // Add grid
                    const gridHelper = new THREE.GridHelper(100, 10, 0x444444, 0x222222);
                    scene.add(gridHelper);

                    // Mouse controls
                    setupMouseControls();

                    // Handle window resize
                    window.addEventListener('resize', onWindowResize);

                    // Animation loop
                    animate();
                }

                function setupMouseControls() {
                    let isMouseDown = false;
                    let isPanning = false;
                    let previousMousePosition = { x: 0, y: 0 };

                    renderer.domElement.addEventListener('mousedown', (e) => {
                        isMouseDown = true;
                        isPanning = e.button === 2; // Right click
                        previousMousePosition = { x: e.clientX, y: e.clientY };
                    });

                    renderer.domElement.addEventListener('mouseup', () => {
                        isMouseDown = false;
                        isPanning = false;
                    });

                    renderer.domElement.addEventListener('mousemove', (e) => {
                        if (!isMouseDown) return;

                        const deltaX = e.clientX - previousMousePosition.x;
                        const deltaY = e.clientY - previousMousePosition.y;

                        if (isPanning) {
                            // Pan camera
                            camera.position.x -= deltaX * 0.1;
                            camera.position.y += deltaY * 0.1;
                        } else {
                            // Rotate camera around origin
                            const radius = Math.sqrt(
                                camera.position.x ** 2 +
                                camera.position.y ** 2 +
                                camera.position.z ** 2
                            );
                            const theta = Math.atan2(camera.position.z, camera.position.x);
                            const phi = Math.acos(camera.position.y / radius);

                            camera.position.x = radius * Math.sin(phi - deltaY * 0.01) * Math.cos(theta + deltaX * 0.01);
                            camera.position.y = radius * Math.cos(phi - deltaY * 0.01);
                            camera.position.z = radius * Math.sin(phi - deltaY * 0.01) * Math.sin(theta + deltaX * 0.01);
                            camera.lookAt(0, 0, 0);
                        }

                        previousMousePosition = { x: e.clientX, y: e.clientY };
                    });

                    renderer.domElement.addEventListener('wheel', (e) => {
                        e.preventDefault();
                        const zoomSpeed = 0.1;
                        const direction = e.deltaY > 0 ? 1 : -1;

                        camera.position.multiplyScalar(1 + direction * zoomSpeed);
                    });

                    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
                }

                function renderRepository(data) {
                    // Clear existing objects (except lights and grid)
                    while(scene.children.length > 3) {
                        scene.remove(scene.children[3]);
                    }

                    repoData = data;
                    visualizeNode(data, 0, 0, 0, 0);
                }

                function visualizeNode(node, x, y, z, depth) {
                    const isDir = node.type === 'dir';
                    const size = isDir ? 2 : 1;
                    const color = isDir ? 0x0e639c : getColorByName(node.name);

                    // Create geometry
                    const geometry = isDir
                        ? new THREE.BoxGeometry(size, size, size)
                        : new THREE.SphereGeometry(size * 0.5, 16, 16);

                    const material = new THREE.MeshPhongMaterial({
                        color: color,
                        emissive: color,
                        emissiveIntensity: 0.2
                    });

                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.position.set(x, y, z);
                    scene.add(mesh);

                    // Add edges for better visibility
                    const edges = new THREE.EdgesGeometry(geometry);
                    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true });
                    const line = new THREE.LineSegments(edges, lineMaterial);
                    line.position.set(x, y, z);
                    scene.add(line);

                    // Visualize children in a spiral pattern
                    if (node.children && node.children.length > 0) {
                        const radius = (depth + 1) * 10;
                        const angleStep = (Math.PI * 2) / node.children.length;

                        node.children.forEach((child, i) => {
                            const angle = i * angleStep;
                            const childX = x + Math.cos(angle) * radius;
                            const childZ = z + Math.sin(angle) * radius;
                            const childY = y - 5;

                            // Draw connection line
                            const points = [
                                new THREE.Vector3(x, y, z),
                                new THREE.Vector3(childX, childY, childZ)
                            ];
                            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                            const connectionLine = new THREE.Line(
                                lineGeometry,
                                new THREE.LineBasicMaterial({ color: 0x444444, opacity: 0.5, transparent: true })
                            );
                            scene.add(connectionLine);

                            visualizeNode(child, childX, childY, childZ, depth + 1);
                        });
                    }
                }

                function getColorByName(name) {
                    const ext = name.split('.').pop().toLowerCase();
                    const colorMap = {
                        'js': 0xf7df1e,
                        'ts': 0x3178c6,
                        'jsx': 0x61dafb,
                        'tsx': 0x61dafb,
                        'py': 0x3776ab,
                        'java': 0xf89820,
                        'go': 0x00add8,
                        'rs': 0xdea584,
                        'c': 0x555555,
                        'cpp': 0x00599c,
                        'cs': 0x239120,
                        'rb': 0xcc342d,
                        'php': 0x777bb4,
                        'html': 0xe34c26,
                        'css': 0x1572b6,
                        'json': 0x292929,
                        'md': 0x083fa1,
                        'yaml': 0xcb171e,
                        'yml': 0xcb171e
                    };
                    return colorMap[ext] || 0x888888;
                }

                function onWindowResize() {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                }

                function animate() {
                    requestAnimationFrame(animate);
                    renderer.render(scene, camera);
                }

                function loadRepo() {
                    const input = document.getElementById('repoInput').value;
                    const parts = input.split('/');
                    if (parts.length === 2) {
                        vscode.postMessage({
                            type: 'fetchRepo',
                            owner: parts[0],
                            repo: parts[1]
                        });
                    }
                }

                // Handle messages from extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.type === 'renderRepo') {
                        renderRepository(message.data);
                    }
                });

                // Initialize
                init();
            </script>
        </body>
        </html>`;
    }
}
```

---

## Part 4: Build and Run

### Step 1: Install Extension Dependencies

```bash
cd extensions/bonfire-3d
yarn install
```

### Step 2: Add Icon

Create `extensions/bonfire-3d/resources/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="none" stroke="#ff6b35" stroke-width="3"/>
  <path d="M30 70 L50 30 L70 70 Z" fill="#ff6b35" opacity="0.7"/>
  <circle cx="50" cy="50" r="8" fill="#f4a259"/>
</svg>
```

### Step 3: Rebuild VS Code

```bash
# From vscode-bonfire root
yarn watch
```

### Step 4: Run Your Custom VS Code

```bash
./scripts/code.sh

# Your BonFire 3D icon should appear in the Activity Bar (left sidebar)!
```

---

## Part 5: Using the 3D Visualizer

1. **Open VS Code** with your changes
2. **Click the BonFire icon** in the Activity Bar (below Extensions)
3. **Enter a GitHub repository** (e.g., `facebook/react`)
4. **Click "Load"** to visualize!

### Controls:
- **Left-click + drag**: Rotate view
- **Right-click + drag**: Pan camera
- **Mouse wheel**: Zoom in/out

---

## Part 6: Making It Better

### Connect to BonFire API

Modify `repoFetcher.ts` to use your BonFire API:

```typescript
async fetchRepository(owner: string, repo: string): Promise<RepoNode> {
    const response = await fetch(`http://localhost:3001/api/repos/${owner}/${repo}`);
    const data = await response.json();
    return data.structure;
}
```

### Add More Features

1. **Color by metrics** (complexity, cost, team ownership)
2. **Click nodes** to open files
3. **Filter by file type**
4. **Show dependencies** as connections
5. **Real-time updates** on file changes

---

## Part 7: Troubleshooting

### VS Code won't build
- Ensure Node.js 18+
- Run `yarn cache clean`
- Delete `node_modules` and reinstall

### Extension not appearing
- Check `extensions/bonfire-3d/out/extension.js` exists
- Rebuild: `cd extensions/bonfire-3d && yarn compile`
- Restart VS Code

### 3D view is blank
- Open DevTools: `Help > Toggle Developer Tools`
- Check Console for errors
- Verify Three.js CDN is accessible

---

## Next Steps

1. **Test with different repos**: Try various GitHub repositories
2. **Enhance visualization**: Add better layouts, colors, interactions
3. **Integrate with BonFire API**: Use your backend for advanced features
4. **Publish as extension**: Package and share with your team

🔥 **You now have VS Code with built-in 3D repository visualization!**
