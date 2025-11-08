Write-Host "BonFire VS Code Fork Setup Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is required but not installed." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] git is required but not installed." -ForegroundColor Red
    exit 1
}

$nodeVersion = (node -v).TrimStart('v').Split('.')[0]
if ([int]$nodeVersion -lt 18) {
    Write-Host "[ERROR] Node.js 18+ is required. Current version: $(node -v)" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Prerequisites met (Node.js $(node -v))" -ForegroundColor Green
Write-Host ""

# Get GitHub username
$GITHUB_USERNAME = Read-Host "Enter your GitHub username (for forking VS Code)"

if ([string]::IsNullOrWhiteSpace($GITHUB_USERNAME)) {
    Write-Host "[ERROR] GitHub username is required" -ForegroundColor Red
    exit 1
}

# Move to parent directory
Set-Location ..

# Step 1: Clone VS Code
Write-Host ""
Write-Host "Step 1: Cloning VS Code..." -ForegroundColor Yellow
Write-Host "-------------------------"

if (Test-Path "vscode-bonfire") {
    Write-Host "[WARNING] vscode-bonfire directory already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to remove and re-clone? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Remove-Item -Recurse -Force vscode-bonfire
    } else {
        Write-Host "Using existing vscode-bonfire directory" -ForegroundColor Yellow
        Set-Location vscode-bonfire
    }
}

if (-not (Test-Path "vscode-bonfire")) {
    Write-Host "Cloning from your fork: https://github.com/$GITHUB_USERNAME/vscode.git" -ForegroundColor Cyan
    Write-Host "(Make sure you've forked https://github.com/microsoft/vscode first!)" -ForegroundColor Yellow

    git clone "https://github.com/$GITHUB_USERNAME/vscode.git" vscode-bonfire

    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to clone. Make sure you've forked VS Code to your GitHub account." -ForegroundColor Red
        Write-Host "Go to https://github.com/microsoft/vscode and click 'Fork'" -ForegroundColor Yellow
        exit 1
    }

    Set-Location vscode-bonfire

    # Add upstream
    git remote add upstream https://github.com/microsoft/vscode.git
}

Write-Host "[OK] VS Code cloned" -ForegroundColor Green
Write-Host ""

# Step 2: Install VS Code dependencies
Write-Host "Step 2: Installing VS Code dependencies (this may take 10-15 minutes)..." -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------------------"
Write-Host "Note: VS Code now uses npm instead of yarn" -ForegroundColor Cyan
Write-Host ""

npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Create BonFire extension
Write-Host "Step 3: Creating BonFire 3D extension..." -ForegroundColor Yellow
Write-Host "----------------------------------------"

Set-Location extensions
New-Item -ItemType Directory -Force -Path "bonfire-3d/src/webview" | Out-Null
New-Item -ItemType Directory -Force -Path "bonfire-3d/resources" | Out-Null
Set-Location bonfire-3d

# Create package.json
@'
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
'@ | Out-File -FilePath "package.json" -Encoding utf8

# Create tsconfig.json
@'
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
'@ | Out-File -FilePath "tsconfig.json" -Encoding utf8

# Create icon
@'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="none" stroke="#ff6b35" stroke-width="3"/>
  <path d="M30 70 L50 30 L70 70 Z" fill="#ff6b35" opacity="0.7"/>
  <circle cx="50" cy="50" r="8" fill="#f4a259"/>
</svg>
'@ | Out-File -FilePath "resources/icon.svg" -Encoding utf8

Write-Host "[OK] Extension structure created" -ForegroundColor Green
Write-Host ""

# Install extension dependencies
Write-Host "Installing extension dependencies..." -ForegroundColor Yellow
npm install

Write-Host "[OK] Extension ready" -ForegroundColor Green
Write-Host ""

# Step 4: Build
Write-Host "Step 4: Building extension..." -ForegroundColor Yellow
Write-Host "-----------------------------"

npm run compile

if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Extension compilation failed (this is OK for now)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=================="
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Complete the extension code:" -ForegroundColor Yellow
Write-Host "   cd extensions/bonfire-3d/src"
Write-Host "   Add extension.ts, visualization3D.ts, repoFetcher.ts"
Write-Host "   See docs/VSCODE_FORK_GUIDE.md for full code"
Write-Host ""
Write-Host "2. Build VS Code:" -ForegroundColor Yellow
Write-Host "   cd ..\..\.."
Write-Host "   npm run watch"
Write-Host "   Keep this terminal running"
Write-Host ""
Write-Host "3. Run your custom VS Code (in a new terminal):" -ForegroundColor Yellow
Write-Host "   cd ..\..\.."
Write-Host "   .\scripts\code.bat or npm run watch-cli"
Write-Host ""
Write-Host "4. Look for the BonFire icon in the Activity Bar!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Full guide: bonfire/docs/VSCODE_FORK_GUIDE.md" -ForegroundColor Magenta
Write-Host ""
