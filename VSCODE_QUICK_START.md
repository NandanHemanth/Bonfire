# 🔥 Quick Start: VS Code with 3D Visualization

## TL;DR - Get Running in 3 Steps

### 1. Fork VS Code on GitHub
Go to https://github.com/microsoft/vscode and click **Fork**

### 2. Run Setup Script
```bash
cd bonfire
chmod +x scripts/setup-vscode-fork.sh
./scripts/setup-vscode-fork.sh
# Enter your GitHub username when prompted
```

### 3. Add Extension Code
The script creates the structure. Copy the code from [docs/VSCODE_FORK_GUIDE.md](docs/VSCODE_FORK_GUIDE.md#step-4-create-extension-entry-point) into:
- `extensions/bonfire-3d/src/extension.ts`
- `extensions/bonfire-3d/src/repoFetcher.ts`
- `extensions/bonfire-3d/src/visualization3D.ts`

Then build and run:
```bash
cd ../vscode-bonfire

# Terminal 1: Build (keep running)
yarn watch

# Terminal 2: Run VS Code
./scripts/code.sh
```

---

## What You'll Get

✅ **Custom VS Code Fork** - Your own version of VS Code
✅ **BonFire Icon in Activity Bar** - Below Extensions icon (🔥)
✅ **3D Repository Visualizer** - Interactive Three.js visualization
✅ **GitHub Integration** - Load any public repo

---

## How to Use

1. **Open Your Custom VS Code**
2. **Click the BonFire icon** (🔥) in the left sidebar
3. **Enter a repo**: `facebook/react` or `microsoft/typescript`
4. **Click "Load"**
5. **Explore in 3D!**

### Controls
- **Left-click + drag** → Rotate
- **Right-click + drag** → Pan
- **Mouse wheel** → Zoom

---

## File Structure Created

```
vscode-bonfire/
└── extensions/
    └── bonfire-3d/           ← Your new extension!
        ├── package.json      ← Extension manifest
        ├── tsconfig.json     ← TypeScript config
        ├── src/
        │   ├── extension.ts        ← Entry point
        │   ├── repoFetcher.ts      ← GitHub API
        │   └── visualization3D.ts  ← 3D view
        └── resources/
            └── icon.svg      ← Activity bar icon
```

---

## Customization Ideas

### Change Colors
In `visualization3D.ts`, modify the `getColorByName()` function:
```typescript
const colorMap = {
    'js': 0xf7df1e,  // Yellow for JavaScript
    'ts': 0x3178c6,  // Blue for TypeScript
    // Add your colors!
};
```

### Change Layout
Modify the `visualizeNode()` function to use different layouts:
- **Grid layout**: Position nodes in a grid
- **Tree layout**: Hierarchical tree structure
- **Force-directed**: Nodes push/pull each other
- **Circular**: Arrange in circles

### Add Interactions
```typescript
// Click to open file
mesh.userData = { path: node.path };
mesh.onclick = () => {
    vscode.workspace.openTextDocument(mesh.userData.path);
};
```

---

## Troubleshooting

### "Fork not found"
Make sure you've forked https://github.com/microsoft/vscode to your GitHub account first!

### "Yarn command not found"
```bash
npm install -g yarn
```

### Extension doesn't appear
1. Check `extensions/bonfire-3d/out/extension.js` exists
2. Rebuild: `cd extensions/bonfire-3d && yarn compile`
3. Restart VS Code

### Build errors
```bash
# Clean and reinstall
cd vscode-bonfire
rm -rf node_modules
yarn install
```

---

## Next Steps

### 1. Connect to BonFire API
Instead of GitHub API, use your BonFire backend:
```typescript
// In repoFetcher.ts
async fetchRepository(owner: string, repo: string): Promise<RepoNode> {
    const response = await fetch(`http://localhost:3001/api/repos/${owner}/${repo}`);
    return await response.json();
}
```

### 2. Add More Views
Create additional views for:
- **Cost Analysis** (Finance view)
- **Team Ownership** (HR view)
- **Dependencies** (Developer view)

### 3. Package & Share
```bash
cd extensions/bonfire-3d
vsce package
# Creates bonfire-3d-1.0.0.vsix
# Share with your team!
```

---

## Full Documentation

📚 **Complete Guide**: [docs/VSCODE_FORK_GUIDE.md](docs/VSCODE_FORK_GUIDE.md)

Includes:
- Detailed code explanations
- Advanced features
- Best practices
- Production deployment

---

## Support

- **Issues**: Check the console: `Help > Toggle Developer Tools`
- **Guide**: See [VSCODE_FORK_GUIDE.md](docs/VSCODE_FORK_GUIDE.md)
- **BonFire Docs**: See [docs/](docs/)

---

🔥 **Happy visualizing!**
