#!/bin/bash

echo "🔥 BonFire VS Code Fork Setup Script"
echo "===================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ git is required but not installed."; exit 1; }
command -v yarn >/dev/null 2>&1 || { echo "⚠️  Yarn not found. Installing..."; npm install -g yarn; }

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites met"
echo ""

# Get GitHub username
echo "Enter your GitHub username (for forking VS Code):"
read GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ GitHub username is required"
    exit 1
fi

# Move to parent directory
cd ..

# Step 1: Clone VS Code
echo ""
echo "Step 1: Cloning VS Code..."
echo "-------------------------"

if [ -d "vscode-bonfire" ]; then
    echo "⚠️  vscode-bonfire directory already exists"
    read -p "Do you want to remove and re-clone? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf vscode-bonfire
    else
        echo "Using existing vscode-bonfire directory"
        cd vscode-bonfire
    fi
fi

if [ ! -d "vscode-bonfire" ]; then
    echo "Cloning from your fork: https://github.com/$GITHUB_USERNAME/vscode.git"
    echo "(Make sure you've forked https://github.com/microsoft/vscode first!)"

    git clone https://github.com/$GITHUB_USERNAME/vscode.git vscode-bonfire

    if [ $? -ne 0 ]; then
        echo "❌ Failed to clone. Make sure you've forked VS Code to your GitHub account."
        echo "Go to https://github.com/microsoft/vscode and click 'Fork'"
        exit 1
    fi

    cd vscode-bonfire

    # Add upstream
    git remote add upstream https://github.com/microsoft/vscode.git

    # Checkout stable version
    git checkout release/1.85
fi

echo "✅ VS Code cloned"
echo ""

# Step 2: Install VS Code dependencies
echo "Step 2: Installing VS Code dependencies (this may take 10-15 minutes)..."
echo "-----------------------------------------------------------------------"

yarn install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Step 3: Create BonFire extension
echo "Step 3: Creating BonFire 3D extension..."
echo "----------------------------------------"

cd extensions
mkdir -p bonfire-3d/src/webview bonfire-3d/resources
cd bonfire-3d

# Create package.json
cat > package.json << 'EOF'
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
  "activationEvents": ["onStartupFinished"],
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
          "name": "Repository Visualizer"
        }
      ]
    },
    "commands": [
      {
        "command": "bonfire.openRepoInput",
        "title": "BonFire: Visualize GitHub Repository",
        "icon": "$(graph-scatter)"
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
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
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
EOF

# Create icon
cat > resources/icon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="none" stroke="#ff6b35" stroke-width="3"/>
  <path d="M30 70 L50 30 L70 70 Z" fill="#ff6b35" opacity="0.7"/>
  <circle cx="50" cy="50" r="8" fill="#f4a259"/>
</svg>
EOF

echo "✅ Extension structure created"
echo ""

# Copy source files from bonfire project if they exist
BONFIRE_DIR="../../bonfire"
if [ -d "$BONFIRE_DIR/apps/vscode-extension/src" ]; then
    echo "Copying source files from BonFire project..."
    cp -r "$BONFIRE_DIR/apps/vscode-extension/src/"* src/ 2>/dev/null || echo "No source files to copy"
fi

# Install extension dependencies
echo "Installing extension dependencies..."
yarn install

echo "✅ Extension ready"
echo ""

# Step 4: Build
echo "Step 4: Building extension..."
echo "-----------------------------"

yarn compile

if [ $? -ne 0 ]; then
    echo "⚠️  Extension compilation failed (this is OK for now)"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo ""
echo "1. Complete the extension code:"
echo "   cd extensions/bonfire-3d/src"
echo "   # Add extension.ts, visualization3D.ts, repoFetcher.ts"
echo "   # See docs/VSCODE_FORK_GUIDE.md for full code"
echo ""
echo "2. Build VS Code:"
echo "   cd $(pwd)/.."
echo "   yarn watch"
echo "   # Keep this terminal running"
echo ""
echo "3. Run your custom VS Code (in a new terminal):"
echo "   cd $(pwd)/.."
echo "   ./scripts/code.sh"
echo ""
echo "4. Look for the BonFire 🔥 icon in the Activity Bar!"
echo ""
echo "📚 Full guide: bonfire/docs/VSCODE_FORK_GUIDE.md"
echo ""
