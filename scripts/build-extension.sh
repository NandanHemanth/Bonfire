#!/bin/bash

echo "🔥 Building BonFire VS Code extension..."

cd apps/vscode-extension

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing extension dependencies..."
    npm install
fi

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed"
    exit 1
fi

echo "✅ Extension compiled successfully"

# Package extension
echo "📦 Packaging extension..."
npm run package

if [ $? -ne 0 ]; then
    echo "❌ Packaging failed"
    exit 1
fi

VSIX_FILE=$(ls *.vsix 2>/dev/null | head -n 1)

if [ -n "$VSIX_FILE" ]; then
    echo "✅ Extension packaged: $VSIX_FILE"
    echo ""
    echo "To install:"
    echo "  code --install-extension $VSIX_FILE"
else
    echo "❌ No .vsix file found"
    exit 1
fi

cd ../..
